const Interview = require('../models/Interview.model');
const Resume = require('../models/Resume.model');
const { askGroq } = require('./groq.service');
const { parseAIResponse: parseAIJSON } = require('../utils/prompts.utils');
const { getCodingProblemById, getPublicProblemDefinition } = require('../constants/codingQuestions');
const { updateSkillProfileFromInterview } = require('./skill.service');
const { evaluateInterviewResumeEvidence } = require('./evidenceValidation.service');

// Assuming murf.service will be created, mock its failure safely for now if missing
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
                totalQuestions: interview.totalQuestions
            };
        }

        // 2. Generate Interview Blueprint via AI
        let blueprintObj = null;
        try {
            const blueprintPrompt = GENERATE_BLUEPRINT_PROMPT(role, resumeText, targetDifficulty, totalQuestions);
            const rawBlueprint = await askGroq(blueprintPrompt);
            blueprintObj = parseAIJSON(rawBlueprint);
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

        // 3. Generate initial questions set
        const questionsPrompt = GENERATE_QUESTIONS_PROMPT(role, resumeText, totalQuestions);
        let parsedQuestions = [];
        try {
            const rawAIResponse = await askGroq(questionsPrompt);
            parsedQuestions = parseAIJSON(rawAIResponse) || [];
        } catch (qErr) {
            console.warn('[startInterview] Initial questions fallback:', qErr.message);
        }

        const questions = [
            { question: "Tell me about yourself and your background.", type: "behavioral", category: "Behavioral & Resume", difficulty: targetDifficulty },
            ...parsedQuestions
        ];

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

        // 6. Persist adaptive fields & bind active resume to Interview document
        const activeResume = await Resume.findOne({ userId, isActive: true }).sort({ createdAt: -1 }) || await Resume.findOne({ userId }).sort({ createdAt: -1 });
        if (activeResume) {
            interview.resumeId = activeResume._id;
        }

        interview.role = role;
        interview.initialDifficulty = targetDifficulty;
        interview.currentDifficulty = targetDifficulty;
        interview.totalQuestions = totalQuestions;
        interview.blueprint = blueprintObj;
        interview.performanceTracker = {
            strengths: [],
            weaknesses: [],
            categoryScores: {},
            overallAverage: 0,
            answerCount: 0
        };
        interview.evaluations = [];
        interview.questions = questions;
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
            totalQuestions: interview.totalQuestions
        };
    } catch (error) {
        console.error('Error starting interview in service:', error);
        throw error;
    }
};

const submitAnswer = async (interviewId, userAnswer) => {
    const interview = await Interview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    // Identify last AI question
    const aiMessages = interview.messages.filter(m => m.role === 'ai');
    const lastQuestionText = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : "Initial Question";

    // Append user message
    interview.messages.push({ role: 'user', content: userAnswer });

    // 1. Evaluate Candidate Answer
    let evalObj = {
        technicalScore: 7,
        communicationScore: 7,
        overallScore: 7,
        strengths: ["Clear response"],
        weaknesses: [],
        conceptsMissed: [],
        depthRating: "Moderate"
    };

    try {
        const evalPrompt = EVALUATE_ANSWER_PROMPT(lastQuestionText, userAnswer, interview.role, interview.currentDifficulty);
        const rawEval = await askGroq(evalPrompt);
        const parsedEval = parseAIJSON(rawEval);
        if (parsedEval && typeof parsedEval.overallScore === 'number') {
            evalObj = parsedEval;
        }
    } catch (evalErr) {
        console.warn('[submitAnswer] Evaluation parsing fallback:', evalErr.message);
    }

    // Record evaluation
    interview.evaluations.push({
        question: lastQuestionText,
        answer: userAnswer,
        difficulty: interview.currentDifficulty,
        ...evalObj,
        timestamp: new Date()
    });

    // 2. Update Performance Tracker & Adaptive Difficulty
    const tracker = interview.performanceTracker || { strengths: [], weaknesses: [], categoryScores: {}, overallAverage: 0, answerCount: 0 };
    if (evalObj.strengths) {
        tracker.strengths = Array.from(new Set([...(tracker.strengths || []), ...evalObj.strengths])).slice(0, 10);
    }
    if (evalObj.weaknesses) {
        tracker.weaknesses = Array.from(new Set([...(tracker.weaknesses || []), ...evalObj.weaknesses])).slice(0, 10);
    }

    const currentAnsCount = (tracker.answerCount || 0) + 1;
    const oldAvg = tracker.overallAverage || 0;
    tracker.overallAverage = Math.round(((oldAvg * (currentAnsCount - 1) + (evalObj.overallScore || 7)) / currentAnsCount) * 10) / 10;
    tracker.answerCount = currentAnsCount;

    // Identify category of previous question for categoryScores & blueprint tracking
    const lastQuestionObj = interview.questions && interview.questions.length > 0 ? interview.questions[interview.questions.length - 1] : null;
    const activeCategory = (lastQuestionObj && lastQuestionObj.category) || "Core Technical Concepts";

    // Update categoryScores
    if (!tracker.categoryScores) tracker.categoryScores = {};
    const oldCatScore = tracker.categoryScores[activeCategory];
    if (typeof oldCatScore === 'number') {
        tracker.categoryScores[activeCategory] = Math.round(((oldCatScore + (evalObj.overallScore || 7)) / 2) * 10) / 10;
    } else {
        tracker.categoryScores[activeCategory] = Math.round((evalObj.overallScore || 7) * 10) / 10;
    }
    interview.performanceTracker = tracker;
    interview.markModified('performanceTracker');

    // Update Blueprint Topic Tracking
    if (interview.blueprint && Array.isArray(interview.blueprint.topics)) {
        let matchedTopic = interview.blueprint.topics.find(t => 
            t.category && (
                t.category.toLowerCase() === activeCategory.toLowerCase() ||
                activeCategory.toLowerCase().includes(t.category.toLowerCase()) ||
                t.category.toLowerCase().includes(activeCategory.toLowerCase())
            )
        );
        if (!matchedTopic && interview.blueprint.topics.length > 0) {
            matchedTopic = interview.blueprint.topics.find(t => t.status !== 'covered') || interview.blueprint.topics[0];
        }

        if (matchedTopic) {
            matchedTopic.questionsAsked = (matchedTopic.questionsAsked || 0) + 1;
            const planned = matchedTopic.plannedCount || 1;
            if (matchedTopic.questionsAsked >= planned) {
                matchedTopic.status = 'covered';
            } else {
                matchedTopic.status = 'partially_covered';
            }
        }
        interview.markModified('blueprint');
    }

    // Adapt Difficulty: High score => upgrade difficulty; Low score => downgrade difficulty
    let updatedDifficulty = interview.currentDifficulty || 'Medium';
    if (evalObj.overallScore >= 8.5) {
        if (updatedDifficulty === 'Easy') updatedDifficulty = 'Medium';
        else if (updatedDifficulty === 'Medium') updatedDifficulty = 'Hard';
    } else if (evalObj.overallScore < 5.0) {
        if (updatedDifficulty === 'Hard') updatedDifficulty = 'Medium';
        else if (updatedDifficulty === 'Medium') updatedDifficulty = 'Easy';
    }
    interview.currentDifficulty = updatedDifficulty;

    // Determine fixed total questions from stored initial difficulty or default
    const targetTotalQuestions = interview.totalQuestions || (interview.initialDifficulty === 'Easy' ? 5 : (interview.initialDifficulty === 'Hard' ? 15 : 10));
    const questionsAnswered = (interview.evaluations ? interview.evaluations.length : 0);

    // CRITICAL COMPLETION CHECK: If questionsAnswered >= targetTotalQuestions, END INTERVIEW IMMEDIATELY.
    if (questionsAnswered >= targetTotalQuestions) {
        interview.status = 'completed';
        await interview.save();
        
        // Trigger Phase 3 candidate skill profile update
        try {
            await updateSkillProfileFromInterview(interview.userId, interview);
        } catch (skillErr) {
            console.warn('[submitAnswer] Skill profile update warning:', skillErr.message);
        }

        return {
            nextQuestion: null,
            audio: '',
            isCompleted: true,
            currentDifficulty: updatedDifficulty,
            totalQuestions: targetTotalQuestions,
            evaluation: evalObj
        };
    }

    // 3. Generate Next Adaptive Question (Only when questionsAnswered < targetTotalQuestions)
    const conversationHistory = buildConversationHistory(interview.messages);
    const aiCount = aiMessages.length; // includes greeting

    let nextQuestionText = '';
    let questionType = 'technical';
    let questionCategory = 'Core Technical Concepts';
    let codingProblem = null;

    // Check if next question slot should be a coding problem (e.g. Q3 in 5-q Easy, Q5 in 10-q Medium)
    const isCodingSlot = (targetTotalQuestions === 5 && questionsAnswered === 2) || 
                         (targetTotalQuestions === 10 && questionsAnswered === 4) ||
                         (targetTotalQuestions === 15 && questionsAnswered === 7);

    if (isCodingSlot) {
        const problemObj = getCodingProblemById('two-sum');
        codingProblem = getPublicProblemDefinition(problemObj);
        nextQuestionText = `Coding Challenge: ${problemObj.title}\n\n${problemObj.description}`;
        questionType = 'coding';
        questionCategory = 'Problem Solving & Coding';
    } else {
        try {
            let userResume = null;
            if (interview.resumeId) {
                userResume = await Resume.findOne({ _id: interview.resumeId, userId: interview.userId });
            }
            if (!userResume && interview.userId) {
                userResume = await Resume.findOne({ userId: interview.userId });
            }

            const parsedResumeJson = (userResume?.parsedData && Object.keys(userResume.parsedData).length > 0)
                ? userResume.parsedData
                : (userResume?.extractedText ? { rawTextFallback: userResume.extractedText.slice(0, 2000) } : null);

            const adaptivePrompt = GENERATE_ADAPTIVE_QUESTION_PROMPT(
                interview.role,
                interview.currentDifficulty,
                interview.blueprint,
                interview.performanceTracker,
                evalObj,
                conversationHistory,
                questionsAnswered + 1,
                targetTotalQuestions,
                parsedResumeJson
            );
            const rawNext = await askGroq(adaptivePrompt);
            const parsedNext = parseAIJSON(rawNext);
            if (parsedNext && parsedNext.question) {
                nextQuestionText = parsedNext.question;
                questionType = parsedNext.type || 'technical';
                questionCategory = parsedNext.category || 'Domain Deep Dive';
            }
        } catch (adaptErr) {
            console.warn('[submitAnswer] Adaptive question fallback:', adaptErr.message);
        }

        if (!nextQuestionText) {
            const followUpPrompt = FOLLOW_UP_PROMPT(conversationHistory);
            nextQuestionText = await askGroq(followUpPrompt);
        }

        if (questionType === 'coding') {
            const problemObj = getCodingProblemById('two-sum');
            codingProblem = getPublicProblemDefinition(problemObj);
            nextQuestionText = `Coding Challenge: ${problemObj.title}\n\n${problemObj.description}`;
            questionCategory = 'Problem Solving & Coding';
        }
    }

    // Programmatic Duplicate-Question Guard
    const askedQuestionsList = (interview.questions || []).map(q => typeof q === 'string' ? q : q.question);
    let retryCount = 0;
    const maxRetries = 2;

    while (isDuplicateQuestion(nextQuestionText, askedQuestionsList) && retryCount < maxRetries) {
        retryCount++;
        console.warn(`[submitAnswer] Duplicate question detected ("${nextQuestionText}"). Bounded retry ${retryCount}/${maxRetries}...`);
        try {
            const retryPrompt = `${GENERATE_ADAPTIVE_QUESTION_PROMPT(interview.role, interview.currentDifficulty, interview.blueprint, interview.performanceTracker, evalObj, conversationHistory, questionsAnswered + 1, targetTotalQuestions)}\n\nCRITICAL: Do NOT generate any question similar to: ${askedQuestionsList.map(q => `"${q}"`).join(', ')}`;
            const rawRetry = await askGroq(retryPrompt);
            const parsedRetry = parseAIJSON(rawRetry);
            if (parsedRetry && parsedRetry.question) {
                nextQuestionText = parsedRetry.question;
                questionType = parsedRetry.type || questionType;
                questionCategory = parsedRetry.category || questionCategory;
            }
        } catch (retryErr) {
            console.warn('[submitAnswer] Duplicate retry error:', retryErr.message);
        }
    }

    if (isDuplicateQuestion(nextQuestionText, askedQuestionsList) && questionType !== 'coding') {
        console.warn('[submitAnswer] Duplicate detected after max retries. Applying safe fallback question.');
        const uncoveredTopicObj = (interview.blueprint?.topics || []).find(t => t.status !== 'covered');
        const uncoveredTopic = uncoveredTopicObj ? uncoveredTopicObj.category : 'System Design & Architecture';
        nextQuestionText = `Can you walk me through how you would approach ${uncoveredTopic} in a real-world software project?`;
        questionCategory = uncoveredTopic;
        questionType = 'technical';
    }

    // 4. Generate audio stream for next question
    let audio = '';
    try {
        const audioSpeechText = questionType === 'coding'
            ? "You'll now solve the following coding problem. Read the problem statement on your screen and implement your solution in the editor."
            : nextQuestionText;
        audio = await generateAudio(audioSpeechText);
    } catch (error) {
        console.warn('Audio generation failed in submitAnswer:', error.message);
    }

    // Append AI question message and question object
    interview.messages.push({ role: 'ai', content: nextQuestionText });
    interview.questions.push({
        question: nextQuestionText,
        type: questionType,
        category: questionCategory,
        difficulty: updatedDifficulty,
        problem: codingProblem
    });
    
    interview.lastAudio = audio || '';

    await interview.save();

    return {
        nextQuestion: nextQuestionText,
        audio,
        isCompleted: false,
        currentDifficulty: updatedDifficulty,
        totalQuestions: targetTotalQuestions,
        questionType,
        category: questionCategory,
        problem: codingProblem,
        evaluation: evalObj
    };
};

const { runTestCases } = require('./execution.service');

const runCode = async (interviewId, code, language, problemId = 'two-sum', userId = null) => {
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    const problem = getCodingProblemById(problemId);
    const publicResults = await runTestCases(code, language, problem.publicTestCases || []);

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

const submitCode = async (interviewId, code, language, problemId = 'two-sum', userId = null) => {
    // Fetch interview with strict ownership authorization
    const query = userId ? { _id: interviewId, userId } : { _id: interviewId };
    const interview = await Interview.findOne(query);
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    const problem = getCodingProblemById(problemId);
    
    // 1. Execute against public test cases
    const publicResults = await runTestCases(code, language, problem.publicTestCases || []);

    // 2. Execute against hidden test cases (inputs/outputs remain server-side!)
    const hiddenResults = await runTestCases(code, language, problem.hiddenTestCases || []);

    // Graceful Failure Guard: If execution service itself failed, do NOT save or advance interview
    if (publicResults.hasExecutionFailure || hiddenResults.hasExecutionFailure) {
        return {
            success: false,
            isExecutionFailure: true,
            message: 'Code execution service temporarily unavailable. Please try again.'
        };
    }

    // 3. Compute execution-derived correctness score
    const totalTests = publicResults.totalCount + hiddenResults.totalCount;
    const totalPassed = publicResults.passedCount + hiddenResults.passedCount;
    const executionPassRate = totalTests > 0 ? (totalPassed / totalTests) : 1;
    const correctnessScore = Math.round(executionPassRate * 10 * 10) / 10;

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
        correctnessScore,
        aiEvaluationNote,
        timestamp: new Date()
    });

    // 5. Update Phase 1 Performance Tracker & Adaptive Difficulty
    const tracker = interview.performanceTracker || { strengths: [], weaknesses: [], categoryScores: {}, overallAverage: 0, answerCount: 0 };
    if (!tracker.categoryScores) tracker.categoryScores = {};
    
    const activeCategory = "Problem Solving & Coding";
    const oldCatScore = tracker.categoryScores[activeCategory];
    tracker.categoryScores[activeCategory] = typeof oldCatScore === 'number' 
        ? Math.round(((oldCatScore + correctnessScore) / 2) * 10) / 10 
        : correctnessScore;

    const currentAnsCount = (tracker.answerCount || 0) + 1;
    const oldAvg = tracker.overallAverage || 0;
    tracker.overallAverage = Math.round(((oldAvg * (currentAnsCount - 1) + correctnessScore) / currentAnsCount) * 10) / 10;
    tracker.answerCount = currentAnsCount;

    if (correctnessScore >= 8.0) {
        tracker.strengths = Array.from(new Set([...(tracker.strengths || []), `Passed ${totalPassed}/${totalTests} code test cases for ${problem.title}`])).slice(0, 10);
    } else {
        tracker.weaknesses = Array.from(new Set([...(tracker.weaknesses || []), `Failed ${totalTests - totalPassed} test cases in ${problem.title}`])).slice(0, 10);
    }
    
    interview.performanceTracker = tracker;
    interview.markModified('performanceTracker');

    // Record evaluation entry so evaluations count reflects coding question
    interview.evaluations.push({
        question: problem.title,
        answer: `[Code Submission - ${language}]: Passed ${totalPassed}/${totalTests} test cases.`,
        difficulty: interview.currentDifficulty,
        overallScore: correctnessScore,
        technicalScore: correctnessScore,
        timestamp: new Date()
    });

    // Adapt Difficulty
    let updatedDifficulty = interview.currentDifficulty || 'Medium';
    if (correctnessScore >= 8.5) {
        if (updatedDifficulty === 'Easy') updatedDifficulty = 'Medium';
        else if (updatedDifficulty === 'Medium') updatedDifficulty = 'Hard';
    } else if (correctnessScore < 5.0) {
        if (updatedDifficulty === 'Hard') updatedDifficulty = 'Medium';
        else if (updatedDifficulty === 'Medium') updatedDifficulty = 'Easy';
    }
    interview.currentDifficulty = updatedDifficulty;

    // Check completion right after coding question evaluation
    const targetTotalQuestions = interview.totalQuestions || (interview.initialDifficulty === 'Easy' ? 5 : (interview.initialDifficulty === 'Hard' ? 15 : 10));
    const questionsAnswered = (interview.evaluations ? interview.evaluations.length : 0);

    if (questionsAnswered >= targetTotalQuestions) {
        interview.status = 'completed';
        await interview.save();

        // Trigger Phase 3 candidate skill profile update
        try {
            await updateSkillProfileFromInterview(interview.userId, interview);
        } catch (skillErr) {
            console.warn('[submitCode] Skill profile update warning:', skillErr.message);
        }

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
            correctnessScore,
            evaluationResult: aiEvaluationNote,
            nextQuestion: null,
            audio: '',
            isCompleted: true,
            currentDifficulty: updatedDifficulty,
            totalQuestions: targetTotalQuestions
        };
    }

    // 6. Generate next question via adaptive interviewer
    interview.messages.push({ 
        role: 'user', 
        content: `[Code Submission - ${language}]: Submitted solution for "${problem.title}". Test Cases Passed: ${totalPassed}/${totalTests}. Correctness Score: ${correctnessScore}/10.\n[Evaluator Note]: ${aiEvaluationNote}` 
    });
    
    const conversationHistory = buildConversationHistory(interview.messages);
    const nextQuestion = await askGroq(FOLLOW_UP_PROMPT(conversationHistory));

    let audio = '';
    try {
        audio = await generateAudio(nextQuestion);
    } catch (error) {
        console.warn('Audio generation failed for code submission.');
    }

    interview.messages.push({ role: 'ai', content: nextQuestion });
    interview.questions.push({
        question: nextQuestion,
        type: 'technical',
        category: 'Follow-up',
        difficulty: updatedDifficulty
    });
    interview.lastAudio = audio || '';
    
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
        correctnessScore,
        evaluationResult: aiEvaluationNote,
        nextQuestion,
        audio,
        isCompleted: false,
        currentDifficulty: updatedDifficulty,
        totalQuestions: targetTotalQuestions
    };
};

const endInterview = async (interviewId, userId) => {
    // Fetch interview
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }

    // Idempotent: Prevent duplicate feedback calling via status check natively 
    if (interview.status === 'completed' && interview.feedback) {
        return { interviewId: interview._id, feedback: interview.feedback };
    }

    // Generate feedback utilizing fully embedded layout
    const conversationHistory = buildConversationHistory(interview.messages);
    const codeString = JSON.stringify(interview.codeSubmissions);
    
    const feedbackPrompt = FEEDBACK_PROMPT(interview.role, conversationHistory, codeString);
    const feedbackRaw = await askGroq(feedbackPrompt);
    
    // Parse AI response (JSON) natively falling back to empty object if fails
    let feedbackJson;
    try {
        feedbackJson = parseAIJSON(feedbackRaw);
        if (!feedbackJson) throw new Error("Parser returned null");
    } catch (err) {
        console.error('[endInterview] Feedback parsing failed, using fallback regex/json.parse');
        try {
            // Last ditch effort: find anything between {}
            const match = feedbackRaw.match(/\{[\s\S]*\}/);
            feedbackJson = JSON.parse(match ? match[0] : feedbackRaw);
        } catch (e) {
            feedbackJson = {};
        }
    }

    // Determine whether coding assessment occurred
    const hasCodingAssessed = (interview.codeSubmissions && interview.codeSubmissions.length > 0) ||
        (interview.questions && interview.questions.some(q => q.type === 'coding'));

    // NORMALIZE: Ensure frontend gets what it expects
    const finalFeedback = normalizeFeedback(feedbackJson, hasCodingAssessed);
    console.log('[endInterview] Normalized feedback score:', finalFeedback.scores["Overall Performance"]);

    // Phase 5: Evaluate Resume Claim Evidence Validation
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

    // Mark completed safely mapping explicitly mapped state requirements 
    interview.feedback = finalFeedback;
    interview.status = 'completed';
    await interview.save();

    // Trigger Phase 3 candidate skill profile update
    try {
        await updateSkillProfileFromInterview(interview.userId, interview);
    } catch (skillErr) {
        console.warn('[endInterview] Skill profile update warning:', skillErr.message);
    }

    // Return payload strictly mapping requested format
    return {
        interviewId: interview._id,
        feedback: interview.feedback
    };
};

const getInterviewById = async (interviewId, userId) => {
    // Fetch interview by ID and userId explicitly returning full interview data limits securely 
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
        const error = new Error('Interview not found');
        error.statusCode = 404;
        throw error;
    }
    return interview;
};

/**
 * Ensures feedback follows a strict structure and scores are valid numbers
 */
const normalizeFeedback = (rawFeedback, hasCodingAssessed = true) => {
    // Default structure
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

    // Helper to extract numeric value from various formats (e.g. 8, "8", "8/10")
    const toScore = (val) => {
        if (typeof val === 'number') return Math.min(10, Math.max(0, val));
        if (typeof val === 'string') {
            const num = parseInt(val.split('/')[0]);
            return isNaN(num) ? 0 : Math.min(10, Math.max(0, num));
        }
        return 0;
    };

    // Map scores safely
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
            // Compute average based on valid numeric scores
            const valid = [
                normalized.scores["Communication Skills"],
                normalized.scores["Technical Knowledge"],
                normalized.scores["Problem Solving"]
            ];
            if (hasCodingAssessed && typeof normalized.scores["Code Quality"] === 'number') {
                valid.push(normalized.scores["Code Quality"]);
            }
            const nonZero = valid.filter(v => typeof v === 'number' && v > 0);
            normalized.scores["Overall Performance"] = nonZero.length > 0 ? Math.round((nonZero.reduce((a, b) => a + b, 0) / nonZero.length) * 10) / 10 : 7;
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
    runCode,
    submitCode,
    endInterview,
    getInterviewById
};
