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
    buildConversationHistory
} = require('../constants/prompts');

const startInterview = async (interviewId, userId, role, resumeText, userName, totalQuestionsRaw) => {
    try {
        const totalQuestions = parseInt(totalQuestionsRaw) || 5;
        console.log(`[startInterview] Starting for user: ${userId}, role: ${role}, totalQuestions: ${totalQuestions}`);
        // 1. Fetch the existing Interview mapping userId context
        const interview = await Interview.findOne({ _id: interviewId, userId });
        console.log(`[startInterview] DB search: ${interview ? 'SUCCESS (Found)' : 'FAILED (Not Found)'}`);
        
        if (!interview) {
            const error = new Error('Interview session context not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        // 2. Generate Questions based on role & resume context
        const questionsPrompt = GENERATE_QUESTIONS_PROMPT(role, resumeText, totalQuestions);
        console.log('[startInterview] Requesting questions from AI...');
        
        let rawAIResponse;
        try {
            rawAIResponse = await askGroq(questionsPrompt);
            console.log('[startInterview] AI Response received successfully.');
        } catch (aiErr) {
            console.error('[startInterview] AI Call Failed:', aiErr.message);
            throw new Error(`AI Engine failed: ${aiErr.message}`);
        }

        const parsedQuestions = parseAIJSON(rawAIResponse) || [];
        console.log(`[startInterview] Successfully parsed ${parsedQuestions.length} questions.`);

        // 3. Add Intro Question mapping behavioral base
        const questions = [
            { question: "Tell me about yourself", type: "behavioral" },
            ...parsedQuestions
        ];

        // 4. Generate Greeting utilizing candidate name
        const greetingPrompt = INTERVIEW_GREETING_PROMPT(userName, role);
        const greetingText = await askGroq(greetingPrompt);

        // 5. Generate Audio for the greeting (graceful failure)
        let audio = '';
        try {
            audio = await generateAudio(greetingText);
        } catch (audioError) {
            console.warn('Audio generation failed in startInterview:', audioError.message);
        }

        // 6. Update the Interview Document defensively
        interview.questions = questions;
        interview.messages = [{ role: 'ai', content: greetingText }];
        interview.lastAudio = audio || '';
        interview.status = 'active';

        await interview.save();

        // 7. Return consistent payload checking for field existence
        return {
            interviewId: interview?._id,
            questions: interview?.questions || [],
            greetingText: greetingText || 'Welcome to your interview.',
            audio: interview?.lastAudio || ''
        };
    } catch (error) {
        console.error('Error starting interview in service:', error);
        throw error;
    }
};

const submitAnswer = async (interviewId, userAnswer) => {
    // Fetch interview by ID
    const interview = await Interview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    // Append user answer
    interview.messages.push({ role: 'user', content: userAnswer });

    // Build conversation history (limit last 20 messages)
    const conversationHistory = buildConversationHistory(interview.messages);

    // Generate next question
    const followUpPrompt = FOLLOW_UP_PROMPT(conversationHistory);
    const rawNextQuestion = await askGroq(followUpPrompt);
    const nextQuestion = rawNextQuestion; // text follow-up

    // Generate audio (never break flow if fails)
    let audio = '';
    try {
        audio = await generateAudio(nextQuestion);
    } catch (error) {
        console.warn('Audio generation failed, safely skipping without breaking flow.');
    }

    // Append new question to messages
    interview.messages.push({ role: 'ai', content: nextQuestion });

    // Check if last question: Mark completed safely
    const aiMessagesCount = interview.messages.filter(m => m.role === 'ai').length;
    // Assuming greeting is 1, next is 1st question context... we just use questions length + 1
    const isCompleted = aiMessagesCount > interview.questions.length;
    
    // Save updated interview
    await interview.save();

    // Return payload
    return {
        nextQuestion,
        audio,
        isCompleted
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

    // NORMALIZE: Ensure frontend gets what it expects
    const finalFeedback = normalizeFeedback(feedbackJson);
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
const normalizeFeedback = (rawFeedback) => {
    // Default structure
    const normalized = {
        scores: {
            "Communication Skills": 0,
            "Technical Knowledge": 0,
            "Problem Solving": 0,
            "Code Quality": 0,
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
        normalized.scores["Code Quality"] = toScore(rawFeedback.scores["Code Quality"] || rawFeedback.scores["code_quality"]);
        normalized.scores["Overall Performance"] = toScore(rawFeedback.scores["Overall Performance"] || rawFeedback.scores["overall"]);
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
