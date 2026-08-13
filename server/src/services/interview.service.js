const Interview = require('../models/Interview.model');
const { askGroq } = require('./groq.service');
const { parseAIResponse: parseAIJSON } = require('../utils/prompts.utils');

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
        const totalQuestions = parseInt(totalQuestionsRaw) || 5;
        const targetDifficulty = difficulty || 'Medium';
        console.log(`[startInterview] Starting adaptive session for user: ${userId}, role: ${role}, level: ${targetDifficulty}, totalQuestions: ${totalQuestions}`);
        
        // 1. Fetch existing Interview
        const interview = await Interview.findOne({ _id: interviewId, userId });
        if (!interview) {
            const error = new Error('Interview session context not found or unauthorized');
            error.statusCode = 404;
            throw error;
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

        // 6. Persist adaptive fields to Interview document
        interview.role = role;
        interview.initialDifficulty = targetDifficulty;
        interview.currentDifficulty = targetDifficulty;
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
            currentDifficulty: interview.currentDifficulty
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

    // 3. Generate Next Adaptive Question
    const conversationHistory = buildConversationHistory(interview.messages);
    const aiCount = aiMessages.length; // includes greeting
    const totalQuestions = (interview.questions && interview.questions.length) || 5;

    let nextQuestionText = '';
    let questionType = 'technical';
    let questionCategory = 'Core Technical Concepts';

    try {
        const adaptivePrompt = GENERATE_ADAPTIVE_QUESTION_PROMPT(
            interview.role,
            interview.currentDifficulty,
            interview.blueprint,
            interview.performanceTracker,
            evalObj,
            conversationHistory,
            aiCount,
            totalQuestions
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

    // Programmatic Duplicate-Question Guard (Issue 5)
    const askedQuestionsList = (interview.questions || []).map(q => typeof q === 'string' ? q : q.question);
    let retryCount = 0;
    const maxRetries = 2;

    while (isDuplicateQuestion(nextQuestionText, askedQuestionsList) && retryCount < maxRetries) {
        retryCount++;
        console.warn(`[submitAnswer] Duplicate question detected ("${nextQuestionText}"). Bounded retry ${retryCount}/${maxRetries}...`);
        try {
            const retryPrompt = `${GENERATE_ADAPTIVE_QUESTION_PROMPT(interview.role, interview.currentDifficulty, interview.blueprint, interview.performanceTracker, evalObj, conversationHistory, aiCount, totalQuestions)}\n\nCRITICAL: Do NOT generate any question similar to: ${askedQuestionsList.map(q => `"${q}"`).join(', ')}`;
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

    if (isDuplicateQuestion(nextQuestionText, askedQuestionsList)) {
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
        audio = await generateAudio(nextQuestionText);
    } catch (error) {
        console.warn('Audio generation failed in submitAnswer:', error.message);
    }

    // Append AI question message and question object
    interview.messages.push({ role: 'ai', content: nextQuestionText });
    interview.questions.push({
        question: nextQuestionText,
        type: questionType,
        category: questionCategory,
        difficulty: updatedDifficulty
    });

    const isCompleted = interview.messages.filter(m => m.role === 'ai').length > totalQuestions;
    await interview.save();

    return {
        nextQuestion: nextQuestionText,
        audio,
        isCompleted,
        currentDifficulty: updatedDifficulty,
        questionType,
        category: questionCategory,
        evaluation: evalObj
    };
};

const submitCode = async (interviewId, code, language) => {
    // Fetch interview
    const interview = await Interview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    // Store submission
    interview.codeSubmissions.push({ code, language, timestamp: new Date() });

    // Evaluate code
    const codingQuestion = interview.questions.find(q => q.type === 'coding')?.question || 'Coding logic problem';
    const evaluationPrompt = EVALUATE_CODE_PROMPT(codingQuestion, code);
    const evaluationResultRaw = await askGroq(evaluationPrompt);

    // Generate follow-up context bridging submission
    interview.messages.push({ role: 'user', content: `[Code Submission]: ${code}\n[Language]: ${language}\n[Evaluator Note]: ${evaluationResultRaw}` });
    
    const conversationHistory = buildConversationHistory(interview.messages);
    const nextQuestion = await askGroq(FOLLOW_UP_PROMPT(conversationHistory));

    let audio = '';
    try {
        audio = await generateAudio(nextQuestion);
    } catch (error) {
        console.warn('Audio generation failed for code submission.');
    }

    interview.messages.push({ role: 'ai', content: nextQuestion });
    
    const aiMessagesCount = interview.messages.filter(m => m.role === 'ai').length;
    const isCompleted = aiMessagesCount > interview.questions.length;
    
    // Save interview
    await interview.save();

    // Return payload explicitly mapping instructions
    return {
        evaluationResult: evaluationResultRaw,
        nextQuestion,
        audio,
        isCompleted
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

    // Mark completed safely mapping explicitly mapped state requirements 
    interview.feedback = finalFeedback;
    interview.status = 'completed';
    await interview.save();

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
    submitCode,
    endInterview,
    getInterviewById
};
