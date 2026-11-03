const Interview = require('../models/Interview.model');
const Resume = require('../models/Resume.model');
const { askGroq } = require('./groq.service');
const { parseAIResponse: parseAIJSON } = require('../utils/prompts.utils');
const { getProblemByDifficulty, getProblemById, getSafeProblemForFrontend } = require('./codingProblem.service');
const { evaluateInterviewResumeEvidence } = require('./evidenceValidation.service');
const { runTestCases } = require('./execution.service');

// Audio generation integration
let generateAudio;
try {
    generateAudio = require('./murf.service').generateAudio;
} catch (err) {
    generateAudio = async () => '';
}

const {
    GENERATE_QUESTIONS_PROMPT,
    INTERVIEW_GREETING_PROMPT,
    FOLLOW_UP_PROMPT,
    FEEDBACK_PROMPT,
    EVALUATE_CODE_PROMPT,
    buildConversationHistory,
    GENERATE_BLUEPRINT_PROMPT,
    EVALUATE_ANSWER_PROMPT,
    GENERATE_ADAPTIVE_QUESTION_PROMPT
} = require('../constants/prompts');

const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .trim();
};

const isDuplicateQuestion = (newQuestionText, askedQuestionsArray) => {
    if (!newQuestionText || !Array.isArray(askedQuestionsArray)) return false;
    const normalizedNew = normalizeString(newQuestionText);
    if (!normalizedNew) return false;

    return askedQuestionsArray.some(asked => {
        const askedStr = typeof asked === 'string' ? asked : asked?.question;
        const normalizedAsked = normalizeString(askedStr);
        if (!normalizedAsked) return false;
        
        if (normalizedAsked === normalizedNew) return true;
        
        if (normalizedNew.length > 25 && normalizedAsked.length > 25) {
            if (normalizedNew.includes(normalizedAsked) || normalizedAsked.includes(normalizedNew)) {
                return true;
            }
        }
        return false;
    });
};

/**
 * Clean AI JSON response and validate required fields.
 * Throws on missing fields or parse failure — never uses fake data.
 */
const cleanAndParseAIJson = (rawContent, requiredFields = []) => {
    if (!rawContent || typeof rawContent !== 'string') {
        throw new Error('AI returned an empty response');
    }
    const cleaned = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        parsed = parseAIJSON(rawContent);
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Could not parse valid JSON from AI response');
    }

    for (const field of requiredFields) {
        if (parsed[field] === undefined || parsed[field] === null) {
            throw new Error(`Missing required field in AI response: ${field}`);
        }
    }

    return parsed;
};

/**
 * Select coding problem based on current adaptive difficulty
 */
const selectCodingProblem = (interviewDoc) => {
    let problemObj = null;
    if (interviewDoc.codingProblemId) {
        problemObj = getProblemById(interviewDoc.codingProblemId);
    }
    if (!problemObj) {
        const diff = interviewDoc.currentDifficulty || interviewDoc.initialDifficulty || 'Medium';
        const usedIds = (interviewDoc.questions || []).filter(q => q && q.problem && q.problem.id).map(q => q.problem.id);
        problemObj = getProblemByDifficulty(diff, usedIds);
        interviewDoc.codingProblemId = problemObj.id;
        interviewDoc.codingProblemDifficulty = problemObj.difficulty;
    }
    return problemObj;
};

/**
 * Update difficulty adaptively using a rolling average of the last 3 scores.
 * Only adjusts difficulty after at least 2 answers have been evaluated.
 * Backend owns difficulty decisions exclusively.
 */
const updateDifficultyAdaptively = (interview, newScore) => {
    const tracker = interview.performanceTracker || {};
    
    // Add new score to recent scores history
    if (!Array.isArray(tracker.recentScores)) tracker.recentScores = [];
    tracker.recentScores.push(newScore);
    
    // Keep only last 3 scores for trend
    if (tracker.recentScores.length > 3) {
        tracker.recentScores.shift();
    }
    
    const currentCount = (tracker.totalAnswered || 0) + 1;
    tracker.totalAnswered = currentCount;
    tracker.answerCount = currentCount;

    // Rolling average across recent window
    const avgRecent = tracker.recentScores.reduce((a, b) => a + b, 0) / tracker.recentScores.length;
    tracker.averageScore = Math.round(avgRecent * 10) / 10;
    tracker.overallAverage = tracker.averageScore;

    // Only adjust after at least 2 answers
    if (tracker.recentScores.length < 2) {
        interview.performanceTracker = tracker;
        return interview.currentDifficulty || interview.initialDifficulty || 'Medium';
    }
    
    const currentDiff = interview.currentDifficulty || interview.initialDifficulty || 'Medium';
    let updatedDiff = currentDiff;
    
    if (avgRecent >= 75 && currentDiff === 'Easy') updatedDiff = 'Medium';
    else if (avgRecent >= 75 && currentDiff === 'Medium') updatedDiff = 'Hard';
    else if (avgRecent <= 45 && currentDiff === 'Hard') updatedDiff = 'Medium';
    else if (avgRecent <= 45 && currentDiff === 'Medium') updatedDiff = 'Easy';
    
    interview.currentDifficulty = updatedDiff;
    interview.performanceTracker = tracker;
    return updatedDiff;
};

/**
 * Generate next adaptive interview question based on full accumulated context:
 * resume, role, blueprint, previous Q&As, evaluations, topics covered, topics remaining, difficulty, trend.
 */
const generateNextQuestion = async (interview, userResume) => {
    const currentDifficulty = interview.currentDifficulty || 'Medium';
    const totalQuestions = interview.totalQuestions || 5;
    const answeredQuestions = (interview.questions || []).filter(q => q && q.answer);
    const answeredCount = answeredQuestions.length;
    const currentQuestionNumber = answeredCount + 1;

    // Check if next question slot should be a coding problem
    const isCodingSlot = (totalQuestions === 5 && answeredCount === 2) || 
                         (totalQuestions === 10 && answeredCount === 4) ||
                         (totalQuestions === 15 && answeredCount === 7);

    const hasHadCoding = (interview.questions || []).some(q => q && q.type === 'coding') || !!interview.codingProblemId;

    if (isCodingSlot && !hasHadCoding) {
        const problemObj = selectCodingProblem(interview);
        const safeProb = getSafeProblemForFrontend(problemObj);
        return {
            question: `Coding Challenge: ${problemObj.title}\n\n${problemObj.description}`,
            topic: 'Problem Solving & Coding',
            category: 'Problem Solving & Coding',
            type: 'coding',
            difficulty: problemObj.difficulty || currentDifficulty,
            purpose: 'Evaluate algorithmic problem solving, edge case reasoning, and code quality',
            followUpOf: null,
            problem: safeProb,
            answer: null,
            evaluation: null
        };
    }

    // Determine performance trend from recent rolling history
    const recentScores = interview.performanceTracker?.recentScores || [];
    let performanceTrend = 'stable';
    if (recentScores.length >= 2) {
        const last = recentScores[recentScores.length - 1];
        const prev = recentScores[recentScores.length - 2];
        if (last > prev + 5) performanceTrend = 'improving';
        else if (last < prev - 5) performanceTrend = 'declining';
    }

    // Determine topics covered and remaining from blueprint
    const topicsCovered = interview.topicsCovered || [];
    const blueprintTopics = (interview.blueprint?.topics || [])
        .map(t => typeof t === 'string' ? t : t.category)
        .filter(Boolean);
    let remainingTopics = blueprintTopics.filter(t => !topicsCovered.some(c => c.toLowerCase() === t.toLowerCase()));
    if (remainingTopics.length === 0) {
        remainingTopics = ['System Design & Scalability', 'Edge Cases & Production Reliability', 'Architecture & Performance Optimization'];
    }

    const weakAreas = interview.performanceTracker?.weakAreas || [];
    const resumeProjects = userResume?.parsedData?.projects || [];
    const resumeProject = resumeProjects.length > 0 ? resumeProjects[0].title : null;
    const resumeText = userResume?.extractedText || userResume?.parsedData?.rawTextFallback || '';

    const adaptivePrompt = GENERATE_ADAPTIVE_QUESTION_PROMPT({
        jobRole: interview.role,
        interviewType: interview.interviewType || 'Full-Stack Technical Interview',
        initialDifficulty: interview.initialDifficulty,
        currentDifficulty,
        currentQuestionNumber,
        totalQuestions,
        resumeText: resumeText.slice(0, 3000),
        blueprint: interview.blueprint,
        previousQAs: answeredQuestions,
        topicsCovered,
        remainingTopics,
        performanceTrend,
        weakAreas,
        resumeProject
    });

    let rawAIResponse;
    try {
        rawAIResponse = await askGroq(adaptivePrompt);
    } catch (err) {
        console.error('[generateNextQuestion] Groq call failed:', err.message);
        throw new Error('AI question generation failed. Please retry.');
    }

    let parsed;
    try {
        parsed = cleanAndParseAIJson(rawAIResponse, ['question']);
    } catch (parseErr) {
        console.error('[generateNextQuestion] Parsing failed:', parseErr.message);
        throw new Error('AI returned an invalid question structure. Please retry.');
    }

    // Programmatic Deduplication Check
    const askedQuestionsList = (interview.questions || []).map(q => typeof q === 'string' ? q : q.question);
    if (isDuplicateQuestion(parsed.question, askedQuestionsList)) {
        console.warn(`[generateNextQuestion] Duplicate question detected ("${parsed.question}"). Retrying...`);
        try {
            const retryPrompt = `${adaptivePrompt}\n\nCRITICAL DEDUPLICATION: Do NOT generate any question similar to: ${askedQuestionsList.map(q => `"${q}"`).join(', ')}. Pick a different topic from: ${remainingTopics.join(', ')}.`;
            const rawRetry = await askGroq(retryPrompt);
            const parsedRetry = cleanAndParseAIJson(rawRetry, ['question']);
            if (parsedRetry && parsedRetry.question && !isDuplicateQuestion(parsedRetry.question, askedQuestionsList)) {
                parsed = parsedRetry;
            }
        } catch (retryErr) {
            console.warn('[generateNextQuestion] Duplicate retry error:', retryErr.message);
        }
    }

    // Final deduplication fallback
    if (isDuplicateQuestion(parsed.question, askedQuestionsList)) {
        const fallbackTopic = remainingTopics[0] || 'System Architecture';
        parsed.question = `Could you explain your architectural approach and technical trade-offs when designing ${fallbackTopic} in a production environment?`;
        parsed.topic = fallbackTopic;
        parsed.type = 'technical';
        parsed.difficulty = currentDifficulty;
        parsed.purpose = `Assess practical engineering approach to ${fallbackTopic}`;
    }

    return {
        question: parsed.question,
        topic: parsed.topic || parsed.category || remainingTopics[0] || 'Core Technical Concepts',
        category: parsed.topic || parsed.category || remainingTopics[0] || 'Core Technical Concepts',
        type: parsed.type || 'technical',
        difficulty: parsed.difficulty || currentDifficulty,
        purpose: parsed.purpose || '',
        followUpOf: parsed.followUpOf || null,
        problem: null,
        answer: null,
        evaluation: null
    };
};

/**
 * Start or resume an interview session
 */
const startInterview = async (interviewId, userId, role, resumeText, userName, totalQuestionsRaw, difficulty = 'Medium') => {
    try {
        const targetDifficulty = difficulty || 'Medium';
        // Enforce fixed Total Questions contract: Easy = 5, Medium = 10, Hard = 15
        const totalQuestions = targetDifficulty === 'Easy' ? 5 : (targetDifficulty === 'Hard' ? 15 : 10);
        console.log(`[startInterview] Starting adaptive session for user: ${userId}, role: ${role}, level: ${targetDifficulty}, totalQuestions: ${totalQuestions}`);
        
        // 1. Fetch existing Interview
        const interview = await Interview.findOne({ _id: interviewId, userId });
        if (!interview) {
            const error = new Error('Interview session context not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        // Idempotent: Prevent overwriting an already initialized active interview
        if (interview.status === 'active' && interview.messages && interview.messages.length > 0) {
            console.log(`[startInterview] Interview ${interviewId} is already active. Returning existing state.`);
            return {
                interviewId: interview._id,
                questions: interview.questions,
                greetingText: interview.messages[0].content,
                audio: interview.lastAudio || '',
                blueprint: interview.blueprint,
                currentDifficulty: interview.currentDifficulty,
                totalQuestions: interview.totalQuestions,
                topicsCovered: interview.topicsCovered || []
            };
        }

        // 2. Generate Interview Blueprint via AI
        let blueprintObj = null;
        try {
            const blueprintPrompt = GENERATE_BLUEPRINT_PROMPT(role, resumeText, targetDifficulty, totalQuestions);
            const rawBlueprint = await askGroq(blueprintPrompt);
            blueprintObj = cleanAndParseAIJson(rawBlueprint, ['topics']);
        } catch (bpErr) {
            console.warn('[startInterview] Blueprint generation fallback triggered:', bpErr.message);
        }

        if (!blueprintObj || !blueprintObj.topics) {
            blueprintObj = {
                role,
                initialDifficulty: targetDifficulty,
                topics: [
                    { category: "Behavioral & Resume", weightPercentage: 20, plannedCount: 1 },
                    { category: "Core Technical Concepts", weightPercentage: 40, plannedCount: 2 },
                    { category: "Problem Solving & Coding", weightPercentage: 40, plannedCount: 2 }
                ],
                focusAreas: ["Core Competencies", "Problem Solving"]
            };
        }

        // Ensure topic tracking attributes exist
        blueprintObj.topics = (blueprintObj.topics || []).map(t => ({
            category: t.category || "Technical Concepts",
            weightPercentage: t.weightPercentage || 25,
            plannedCount: t.plannedCount || 1,
            questionsAsked: 0,
            status: "not_covered"
        }));

        // 3. Opening question (Question 1)
        const openingQuestion = {
            question: "Tell me about yourself and your background.",
            topic: "Behavioral & Resume",
            category: "Behavioral & Resume",
            type: "behavioral",
            difficulty: targetDifficulty,
            purpose: "Opening introduction and candidate background overview",
            followUpOf: null,
            problem: null,
            answer: null,
            evaluation: null
        };

        // 4. Generate Greeting
        const greetingPrompt = INTERVIEW_GREETING_PROMPT(userName, role);
        const greetingText = await askGroq(greetingPrompt);

        // 5. Generate Audio for greeting
        let audio = '';
        try {
            audio = await generateAudio(greetingText);
        } catch (audioError) {
            console.warn('Audio generation skipped in startInterview:', audioError.message);
        }

        // 6. Bind active resume to Interview document
        const activeResume = await Resume.findOne({ userId, isActive: true }).sort({ createdAt: -1 }) ||
                             await Resume.findOne({ userId }).sort({ createdAt: -1 });
        if (activeResume) {
            interview.resumeId = activeResume._id;
        }

        interview.role = role;
        interview.initialDifficulty = targetDifficulty;
        interview.currentDifficulty = targetDifficulty;
        interview.totalQuestions = totalQuestions;
        interview.blueprint = blueprintObj;
        interview.topicsCovered = [];
        interview.performanceTracker = {
            recentScores: [],
            averageScore: 0,
            weakAreas: [],
            strongAreas: [],
            totalAnswered: 0,
            codingScore: null,
            codingStatus: null,
            strengths: [],
            weaknesses: [],
            categoryScores: {},
            overallAverage: 0,
            answerCount: 0
        };
        interview.evaluations = [];
        interview.questions = [openingQuestion];
        interview.messages = [{ role: 'ai', content: greetingText }];
        interview.lastAudio = audio || '';
        interview.status = 'active';

        await interview.save();

        return {
            interviewId: interview._id,
            questions: interview.questions,
            greetingText: greetingText || 'Welcome to your interview.',
            audio: interview.lastAudio || '',
            blueprint: interview.blueprint,
            currentDifficulty: interview.currentDifficulty,
            totalQuestions: interview.totalQuestions,
            topicsCovered: interview.topicsCovered
        };
    } catch (error) {
        console.error('Error starting interview in service:', error);
        throw error;
    }
};

/**
 * Evaluates candidate answer using real AI (Groq), updates adaptive difficulty via rolling average,
 * persists state, and generates next question or completes the interview.
 */
const submitAnswer = async (interviewId, answerText, questionIndex = undefined, userId = null) => {
    // 1. Fetch interview with authorization check if userId provided
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    if (!answerText || typeof answerText !== 'string' || answerText.trim() === '') {
        const error = new Error('Answer text cannot be empty');
        error.statusCode = 400;
        throw error;
    }

    // 2. Determine target question index
    let qIndex;
    if (questionIndex !== undefined && questionIndex !== null) {
        qIndex = Number(questionIndex);
    } else {
        // Find first question without an answer
        const idx = (interview.questions || []).findIndex(q => !q.answer);
        qIndex = idx !== -1 ? idx : Math.max(0, (interview.questions || []).length - 1);
    }

    if (!interview.questions || interview.questions.length === 0) {
        const error = new Error('No questions found in this interview session');
        error.statusCode = 400;
        throw error;
    }

    if (qIndex < 0 || qIndex >= interview.questions.length) {
        const error = new Error(`Invalid question index ${qIndex}`);
        error.statusCode = 400;
        throw error;
    }

    const targetQuestion = interview.questions[qIndex];

    // Prevent duplicate: if questions[questionIndex].answer already exists, return 409
    if (targetQuestion.answer) {
        const error = new Error(`Answer has already been submitted for question ${qIndex + 1}`);
        error.statusCode = 409;
        throw error;
    }

    // 3. Fetch candidate resume
    let userResume = null;
    if (interview.resumeId) {
        userResume = await Resume.findOne({ _id: interview.resumeId });
    }
    if (!userResume && interview.userId) {
        userResume = await Resume.findOne({ userId: interview.userId, isActive: true }).sort({ createdAt: -1 }) ||
                     await Resume.findOne({ userId: interview.userId }).sort({ createdAt: -1 });
    }
    const resumeSummary = userResume?.extractedText ? userResume.extractedText.slice(0, 2000) : '';

    // 4. Build previous performance summary
    const answeredQuestions = (interview.questions || []).filter(q => q && q.answer);
    const answeredCount = answeredQuestions.length;
    const avgTechScore = answeredCount > 0
        ? Math.round(answeredQuestions.reduce((sum, q) => sum + (q.evaluation?.technicalScore || 0), 0) / answeredCount)
        : 0;
    const currentTopicsCovered = interview.topicsCovered || [];
    const weakAreas = interview.performanceTracker?.weakAreas || [];

    // 5. Build evaluation prompt with ALL context
    const evalPrompt = EVALUATE_ANSWER_PROMPT({
        jobRole: interview.role,
        currentDifficulty: interview.currentDifficulty || 'Medium',
        resumeSummary,
        questionText: targetQuestion.question,
        topic: targetQuestion.topic || targetQuestion.category || 'General',
        type: targetQuestion.type || 'technical',
        answerText: answerText.trim(),
        answeredCount,
        avgTechnicalScore: avgTechScore,
        topicsCovered: currentTopicsCovered,
        weaknesses: weakAreas
    });

    // 6. Call Groq with try/catch — DO NOT save fake data on failure
    let rawEval;
    try {
        rawEval = await askGroq(evalPrompt);
    } catch (apiErr) {
        console.error('[submitAnswer] Groq evaluation API call failed:', apiErr.message);
        throw new Error('AI evaluation failed. Please retry.');
    }

    // 7. Parse and validate AI JSON response
    let parsedEval;
    try {
        parsedEval = cleanAndParseAIJson(rawEval, ['technicalScore', 'communicationScore', 'overallScore']);
    } catch (parseErr) {
        console.error('[submitAnswer] AI JSON validation error:', parseErr.message);
        throw new Error('AI evaluation failed. Please retry.');
    }

    // Normalize numeric values (0-100 scale)
    const technicalScore = Math.min(100, Math.max(0, Math.round(Number(parsedEval.technicalScore))));
    const communicationScore = Math.min(100, Math.max(0, Math.round(Number(parsedEval.communicationScore))));
    const overallScore = Math.min(100, Math.max(0, Math.round(Number(parsedEval.overallScore))));
    const relevanceScore = typeof parsedEval.relevanceScore === 'number'
        ? Math.min(100, Math.max(0, Math.round(parsedEval.relevanceScore)))
        : overallScore;
    const depthScore = typeof parsedEval.depthScore === 'number'
        ? Math.min(100, Math.max(0, Math.round(parsedEval.depthScore)))
        : technicalScore;

    const evaluationResult = {
        technicalScore,
        communicationScore,
        relevanceScore,
        depthScore,
        overallScore,
        strengths: Array.isArray(parsedEval.strengths) ? parsedEval.strengths : [],
        weaknesses: Array.isArray(parsedEval.weaknesses) ? parsedEval.weaknesses : [],
        missingConcepts: Array.isArray(parsedEval.missingConcepts) ? parsedEval.missingConcepts : [],
        areasForFurtherAssessment: Array.isArray(parsedEval.areasForFurtherAssessment) ? parsedEval.areasForFurtherAssessment : [],
        evaluationSummary: String(parsedEval.evaluationSummary || ''),
        topicsCovered: Array.isArray(parsedEval.topicsCovered) ? parsedEval.topicsCovered : [targetQuestion.topic || targetQuestion.category || 'Core Technical']
    };

    // 8. Save answer and evaluation to questions[questionIndex]
    targetQuestion.answer = answerText.trim();
    targetQuestion.evaluation = evaluationResult;
    interview.questions[qIndex] = targetQuestion;
    interview.markModified('questions');

    // Also record in evaluations array for history / backward compatibility
    interview.evaluations.push({
        questionIndex: qIndex,
        question: targetQuestion.question,
        answer: answerText.trim(),
        difficulty: interview.currentDifficulty,
        ...evaluationResult,
        timestamp: new Date()
    });

    // Append to messages
    interview.messages.push({ role: 'user', content: answerText.trim() });

    // 9. Update performanceTracker & adaptive difficulty (Fix C)
    const tracker = interview.performanceTracker || {
        recentScores: [],
        averageScore: 0,
        weakAreas: [],
        strongAreas: [],
        totalAnswered: 0,
        codingScore: null,
        codingStatus: null,
        strengths: [],
        weaknesses: [],
        categoryScores: {},
        overallAverage: 0,
        answerCount: 0
    };

    if (evaluationResult.strengths?.length > 0) {
        tracker.strongAreas = Array.from(new Set([...(tracker.strongAreas || []), ...evaluationResult.strengths])).slice(0, 10);
        tracker.strengths = tracker.strongAreas;
    }
    if (evaluationResult.weaknesses?.length > 0) {
        tracker.weakAreas = Array.from(new Set([...(tracker.weakAreas || []), ...evaluationResult.weaknesses])).slice(0, 10);
        tracker.weaknesses = tracker.weakAreas;
    }

    // Update difficulty using rolling average strategy
    const updatedDifficulty = updateDifficultyAdaptively(interview, overallScore);
    interview.currentDifficulty = updatedDifficulty;
    interview.markModified('performanceTracker');

    // 10. Update topicsCovered array
    const newlyCovered = evaluationResult.topicsCovered || [];
    const updatedTopics = Array.from(new Set([
        ...(interview.topicsCovered || []),
        targetQuestion.topic || targetQuestion.category,
        ...newlyCovered
    ].filter(Boolean)));
    interview.topicsCovered = updatedTopics;
    interview.markModified('topicsCovered');

    // Update blueprint topic status
    if (interview.blueprint && Array.isArray(interview.blueprint.topics)) {
        const topicCat = targetQuestion.topic || targetQuestion.category;
        const bpTopic = interview.blueprint.topics.find(t =>
            t.category && topicCat && (
                t.category.toLowerCase() === topicCat.toLowerCase() ||
                topicCat.toLowerCase().includes(t.category.toLowerCase()) ||
                t.category.toLowerCase().includes(topicCat.toLowerCase())
            )
        );
        if (bpTopic) {
            bpTopic.questionsAsked = (bpTopic.questionsAsked || 0) + 1;
            bpTopic.status = bpTopic.questionsAsked >= (bpTopic.plannedCount || 1) ? 'covered' : 'partially_covered';
            interview.markModified('blueprint');
        }
    }

    // 11. Completion Check
    const totalAnsweredCount = (interview.questions || []).filter(q => q && q.answer).length;
    const targetTotalQuestions = interview.totalQuestions || 5;

    if (totalAnsweredCount >= targetTotalQuestions) {
        interview.status = 'completed';
        await interview.save();

        return {
            nextQuestion: null,
            audio: '',
            isCompleted: true,
            currentDifficulty: updatedDifficulty,
            totalQuestions: targetTotalQuestions,
            topicsCovered: interview.topicsCovered,
            evaluation: evaluationResult
        };
    }

    // 12. Generate Next Adaptive Question (Fix B)
    const nextQuestionObj = await generateNextQuestion(interview, userResume);

    // Audio generation for next question
    let audio = '';
    try {
        const speechText = nextQuestionObj.type === 'coding'
            ? "You'll now solve the following coding problem. Read the problem statement on your screen and implement your solution in the editor."
            : nextQuestionObj.question;
        audio = await generateAudio(speechText);
    } catch (audioErr) {
        console.warn('[submitAnswer] Audio generation skipped:', audioErr.message);
    }

    // Push next question and AI message
    interview.messages.push({ role: 'ai', content: nextQuestionObj.question });
    interview.questions.push(nextQuestionObj);
    interview.lastAudio = audio || '';
    interview.markModified('questions');

    // 13. Save interview document
    await interview.save();

    return {
        nextQuestion: nextQuestionObj.question,
        audio,
        isCompleted: false,
        currentDifficulty: updatedDifficulty,
        totalQuestions: targetTotalQuestions,
        questionType: nextQuestionObj.type,
        category: nextQuestionObj.category || nextQuestionObj.topic,
        topic: nextQuestionObj.topic,
        problem: nextQuestionObj.problem,
        topicsCovered: interview.topicsCovered,
        evaluation: evaluationResult
    };
};

/**
 * Run candidate code against public test cases only
 */
const runCode = async (interviewId, code, language, problemId = null, userId = null) => {
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    const activeProblemId = problemId || interview.codingProblemId || 'prob_001';
    const problem = getProblemById(activeProblemId);
    if (!problem) {
        const error = new Error('Coding problem not found');
        error.statusCode = 404;
        throw error;
    }

    // Save candidate draft code and language
    interview.codingCurrentCode = code;
    interview.codingLanguage = language;
    if (!interview.codingProblemId) {
        interview.codingProblemId = problem.id;
        interview.codingProblemDifficulty = problem.difficulty;
    }
    await interview.save();

    const publicResults = await runTestCases(code, language, problem.publicTestCases || [], problem);

    if (publicResults.hasExecutionFailure) {
        return {
            success: false,
            isExecutionFailure: true,
            message: 'Code execution service temporarily unavailable. Please try again.'
        };
    }

    return {
        success: true,
        type: 'run',
        problemId: problem.id,
        language,
        publicResults
    };
};

/**
 * Submit code against public + hidden test cases, update performance tracker, adapt difficulty,
 * and proceed to subsequent adaptive interview questions.
 */
const submitCode = async (interviewId, code, language, problemId = null, userId = null) => {
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    const activeProblemId = problemId || interview.codingProblemId || 'prob_001';
    const problem = getProblemById(activeProblemId);
    if (!problem) {
        const error = new Error('Coding problem not found');
        error.statusCode = 404;
        throw error;
    }
    
    // 1. Execute against public test cases
    const publicResults = await runTestCases(code, language, problem.publicTestCases || [], problem);

    // 2. Execute against hidden test cases
    const hiddenResults = await runTestCases(code, language, problem.hiddenTestCases || [], problem);

    // Graceful Failure Guard: If execution service itself failed, do NOT save or advance
    if (publicResults.hasExecutionFailure || hiddenResults.hasExecutionFailure) {
        return {
            success: false,
            isExecutionFailure: true,
            message: 'Code execution service temporarily unavailable. Please try again.'
        };
    }

    // 3. Compute execution-derived correctness score (0-100 scale)
    const totalTests = publicResults.totalCount + hiddenResults.totalCount;
    const totalPassed = publicResults.passedCount + hiddenResults.passedCount;
    const passPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100;
    const codingStatus = passPercentage === 100 ? 'accepted' : (passPercentage > 0 ? 'partial' : 'failed');

    // 4. Evaluate code qualitatively via Groq AI
    const codingQuestion = problem.title || 'Coding Challenge';
    let aiEvaluationNote = 'Code execution evaluation completed.';
    try {
        const evaluationPrompt = EVALUATE_CODE_PROMPT(codingQuestion, code);
        aiEvaluationNote = await askGroq(evaluationPrompt);
    } catch (evalErr) {
        console.warn('[submitCode] AI code evaluation fallback:', evalErr.message);
    }

    // Record submission to interview document
    interview.codeSubmissions.push({
        problemId: problem.id,
        code,
        language,
        publicPassed: publicResults.passedCount,
        publicTotal: publicResults.totalCount,
        hiddenPassed: hiddenResults.passedCount,
        hiddenTotal: hiddenResults.totalCount,
        correctnessScore: passPercentage,
        aiEvaluationNote,
        timestamp: new Date()
    });

    // 5. Update Performance Tracker (Fix E) & Adaptive Difficulty
    const tracker = interview.performanceTracker || {};
    tracker.codingScore = passPercentage;
    tracker.codingStatus = codingStatus;

    if (passPercentage >= 80) {
        tracker.strongAreas = Array.from(new Set([...(tracker.strongAreas || []), `Passed ${totalPassed}/${totalTests} test cases for ${problem.title}`])).slice(0, 10);
        tracker.strengths = tracker.strongAreas;
    } else {
        tracker.weakAreas = Array.from(new Set([...(tracker.weakAreas || []), `Failed ${totalTests - totalPassed} test cases for ${problem.title}`])).slice(0, 10);
        tracker.weaknesses = tracker.weakAreas;
    }

    interview.codingCurrentCode = code;
    interview.codingLanguage = language;
    interview.codingSubmitted = true;
    interview.codingEvaluationSummary = {
        totalTests,
        passed: totalPassed,
        failed: totalTests - totalPassed,
        status: codingStatus
    };

    // Update difficulty adaptively with coding pass percentage
    const updatedDifficulty = updateDifficultyAdaptively(interview, passPercentage);
    interview.currentDifficulty = updatedDifficulty;
    interview.markModified('performanceTracker');

    // Find coding question item in questions array and mark answer/evaluation
    let codingQuestionObj = (interview.questions || []).find(q => q && q.type === 'coding' && !q.answer);
    if (codingQuestionObj) {
        codingQuestionObj.answer = `[Code Submission - ${language}]: Passed ${totalPassed}/${totalTests} test cases. (Status: ${codingStatus})`;
        codingQuestionObj.evaluation = {
            technicalScore: passPercentage,
            communicationScore: passPercentage,
            overallScore: passPercentage,
            strengths: passPercentage >= 80 ? [`Passed ${totalPassed}/${totalTests} test cases for ${problem.title}`] : [],
            weaknesses: passPercentage < 80 ? [`Failed ${totalTests - totalPassed} test cases for ${problem.title}`] : [],
            evaluationSummary: aiEvaluationNote,
            topicsCovered: ['Problem Solving & Coding']
        };
        interview.markModified('questions');
    }

    // Add evaluation entry
    interview.evaluations.push({
        question: problem.title,
        answer: `[Code Submission - ${language}]: Passed ${totalPassed}/${totalTests} test cases.`,
        difficulty: interview.currentDifficulty,
        overallScore: passPercentage,
        technicalScore: passPercentage,
        evaluationSummary: aiEvaluationNote,
        timestamp: new Date()
    });

    // Update topics covered
    const updatedTopics = Array.from(new Set([...(interview.topicsCovered || []), 'Problem Solving & Coding']));
    interview.topicsCovered = updatedTopics;
    interview.markModified('topicsCovered');

    // 6. Check completion right after coding question evaluation
    const targetTotalQuestions = interview.totalQuestions || 5;
    const questionsAnswered = (interview.questions || []).filter(q => q && q.answer).length;

    if (questionsAnswered >= targetTotalQuestions) {
        interview.status = 'completed';
        await interview.save();

        return {
            type: 'submit',
            problemId: problem.id,
            language,
            publicResults,
            hiddenSummary: {
                passedCount: hiddenResults.passedCount,
                totalCount: hiddenResults.totalCount,
                passPercentage: hiddenResults.passPercentage
            },
            correctnessScore: passPercentage,
            evaluationResult: aiEvaluationNote,
            nextQuestion: null,
            audio: '',
            isCompleted: true,
            currentDifficulty: updatedDifficulty,
            totalQuestions: targetTotalQuestions
        };
    }

    // 7. Generate subsequent question adaptively with coding context included
    interview.messages.push({ 
        role: 'user', 
        content: `[Code Submission - ${language}]: Submitted solution for "${problem.title}". Test Cases Passed: ${totalPassed}/${totalTests}. Status: ${codingStatus}.\n[Evaluator Note]: ${aiEvaluationNote}` 
    });

    let userResume = null;
    if (interview.resumeId) {
        userResume = await Resume.findOne({ _id: interview.resumeId });
    }
    if (!userResume && interview.userId) {
        userResume = await Resume.findOne({ userId: interview.userId, isActive: true }).sort({ createdAt: -1 }) ||
                     await Resume.findOne({ userId: interview.userId }).sort({ createdAt: -1 });
    }

    const nextQuestionObj = await generateNextQuestion(interview, userResume);

    let audio = '';
    try {
        audio = await generateAudio(nextQuestionObj.question);
    } catch (error) {
        console.warn('Audio generation failed for code submission follow-up.');
    }

    interview.messages.push({ role: 'ai', content: nextQuestionObj.question });
    interview.questions.push(nextQuestionObj);
    interview.lastAudio = audio || '';
    interview.markModified('questions');
    
    await interview.save();

    return {
        type: 'submit',
        problemId: problem.id,
        language,
        publicResults,
        hiddenSummary: {
            passedCount: hiddenResults.passedCount,
            totalCount: hiddenResults.totalCount,
            passPercentage: hiddenResults.passPercentage
        },
        correctnessScore: passPercentage,
        evaluationResult: aiEvaluationNote,
        nextQuestion: nextQuestionObj.question,
        audio,
        isCompleted: false,
        currentDifficulty: updatedDifficulty,
        totalQuestions: targetTotalQuestions,
        questionType: nextQuestionObj.type,
        category: nextQuestionObj.category || nextQuestionObj.topic,
        topic: nextQuestionObj.topic,
        problem: nextQuestionObj.problem
    };
};

/**
 * Save candidate code draft
 */
const saveCode = async (interviewId, code, language, problemId = null, userId = null) => {
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    interview.codingCurrentCode = code || '';
    if (language) interview.codingLanguage = language;
    if (problemId) interview.codingProblemId = problemId;

    await interview.save();
    return {
        success: true,
        message: 'Code draft saved',
        savedAt: new Date()
    };
};

/**
 * End interview and generate final comprehensive feedback report
 */
const endInterview = async (interviewId, userId) => {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    // Idempotent: Prevent duplicate feedback generation
    if (interview.status === 'completed' && interview.feedback) {
        return { interviewId: interview._id, feedback: interview.feedback };
    }

    const conversationHistory = buildConversationHistory(interview.messages);
    const codeString = JSON.stringify(interview.codeSubmissions);
    
    const feedbackPrompt = FEEDBACK_PROMPT(interview.role, conversationHistory, codeString);
    const feedbackRaw = await askGroq(feedbackPrompt);
    
    let feedbackJson;
    try {
        feedbackJson = cleanAndParseAIJson(feedbackRaw, ['scores']);
    } catch (err) {
        console.error('[endInterview] Feedback parsing failed, using fallback regex/json.parse');
        try {
            const match = feedbackRaw.match(/\{[\s\S]*\}/);
            feedbackJson = JSON.parse(match ? match[0] : feedbackRaw);
        } catch (e) {
            feedbackJson = {};
        }
    }

    const hasCodingAssessed = (interview.codeSubmissions && interview.codeSubmissions.length > 0) ||
        (interview.questions && interview.questions.some(q => q.type === 'coding'));

    const finalFeedback = normalizeFeedback(feedbackJson, hasCodingAssessed);

    // Evaluate Resume Claim Evidence Validation
    try {
        let userResume = null;
        if (interview.resumeId) {
            userResume = await Resume.findOne({ _id: interview.resumeId, userId });
        }
        if (!userResume) {
            userResume = await Resume.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
        }
        if (userResume) {
            const evidenceResults = await evaluateInterviewResumeEvidence(interview, userResume);
            finalFeedback.evidenceReport = evidenceResults;
        }
    } catch (evErr) {
        console.warn('[endInterview] Evidence evaluation warning:', evErr.message);
    }

    interview.feedback = finalFeedback;
    interview.status = 'completed';
    await interview.save();

    return {
        interviewId: interview._id,
        feedback: interview.feedback
    };
};

/**
 * Return complete interview state for frontend restoration:
 * all questions with answers & evaluations, currentDifficulty, topicsCovered, performanceTracker,
 * safe coding problem (hidden test cases stripped), coding drafts, and blueprint.
 */
const getInterviewById = async (interviewId, userId) => {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }
    const interviewObj = interview.toObject ? interview.toObject() : interview;

    // Ensure topicsCovered exists
    if (!interviewObj.topicsCovered) {
        interviewObj.topicsCovered = [];
    }

    // Ensure performanceTracker exists
    if (!interviewObj.performanceTracker) {
        interviewObj.performanceTracker = {
            recentScores: [],
            averageScore: 0,
            weakAreas: [],
            strongAreas: [],
            totalAnswered: 0,
            codingScore: null,
            codingStatus: null
        };
    }

    // Attach safe problem definition if codingProblemId is present
    if (interviewObj.codingProblemId) {
        const problem = getProblemById(interviewObj.codingProblemId);
        if (problem) {
            interviewObj.codingProblem = getSafeProblemForFrontend(problem);
        }
    }

    // Strip any hiddenTestCases from questions array to prevent exposure
    if (Array.isArray(interviewObj.questions)) {
        interviewObj.questions = interviewObj.questions.map(q => {
            if (q && q.problem && q.problem.hiddenTestCases) {
                const { hiddenTestCases, ...safeProb } = q.problem;
                return { ...q, problem: safeProb };
            }
            return q;
        });
    }

    return interviewObj;
};

/**
 * Ensures feedback follows a strict structure and scores are valid numbers on 0-10 scale
 */
const normalizeFeedback = (rawFeedback, hasCodingAssessed = true) => {
    const normalized = {
        scores: {
            "Communication Skills": 0,
            "Technical Knowledge": 0,
            "Problem Solving": 0,
            "Code Quality": hasCodingAssessed ? 0 : "N/A",
            "Overall Performance": 0
        },
        strengths: [],
        weaknesses: [],
        suggestions: []
    };

    if (!rawFeedback || typeof rawFeedback !== 'object') return normalized;

    const toScore = (val) => {
        if (typeof val === 'number') {
            if (val > 10) return Math.min(10, Math.max(0, Math.round((val / 10) * 10) / 10));
            return Math.min(10, Math.max(0, val));
        }
        if (typeof val === 'string') {
            const num = parseFloat(val.split('/')[0]);
            if (isNaN(num)) return 0;
            if (num > 10) return Math.min(10, Math.max(0, Math.round((num / 10) * 10) / 10));
            return Math.min(10, Math.max(0, num));
        }
        return 0;
    };

    if (rawFeedback.scores) {
        normalized.scores["Communication Skills"] = toScore(rawFeedback.scores["Communication Skills"] || rawFeedback.scores["communication"]);
        normalized.scores["Technical Knowledge"] = toScore(rawFeedback.scores["Technical Knowledge"] || rawFeedback.scores["technical"]);
        normalized.scores["Problem Solving"] = toScore(rawFeedback.scores["Problem Solving"] || rawFeedback.scores["problem_solving"]);
        
        if (hasCodingAssessed) {
            normalized.scores["Code Quality"] = toScore(rawFeedback.scores["Code Quality"] || rawFeedback.scores["code_quality"]);
        } else {
            normalized.scores["Code Quality"] = "N/A";
        }

        if (rawFeedback.scores["Overall Performance"] !== undefined) {
            normalized.scores["Overall Performance"] = toScore(rawFeedback.scores["Overall Performance"] || rawFeedback.scores["overall"]);
        } else {
            const valid = [
                normalized.scores["Communication Skills"],
                normalized.scores["Technical Knowledge"],
                normalized.scores["Problem Solving"]
            ];
            if (hasCodingAssessed && typeof normalized.scores["Code Quality"] === 'number') {
                valid.push(normalized.scores["Code Quality"]);
            }
            const nonZero = valid.filter(v => typeof v === 'number' && v > 0);
            normalized.scores["Overall Performance"] = nonZero.length > 0
                ? Math.round((nonZero.reduce((a, b) => a + b, 0) / nonZero.length) * 10) / 10
                : 0;
        }
    }

    normalized.strengths = Array.isArray(rawFeedback.strengths) ? rawFeedback.strengths : [];
    normalized.weaknesses = Array.isArray(rawFeedback.weaknesses) ? rawFeedback.weaknesses : [];
    normalized.suggestions = Array.isArray(rawFeedback.suggestions) ? rawFeedback.suggestions : [];

    return normalized;
};

module.exports = {
    startInterview,
    submitAnswer,
    generateNextQuestion,
    updateDifficultyAdaptively,
    runCode,
    submitCode,
    saveCode,
    endInterview,
    getInterviewById,
    normalizeFeedback
};
