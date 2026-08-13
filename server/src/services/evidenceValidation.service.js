const { askGroq } = require('./groq.service');
const { parseAIResponse } = require('../utils/prompts.utils');
const { EVALUATE_CLAIM_EVIDENCE_PROMPT } = require('../constants/prompts');

/**
 * Validates candidate response evidence against a resume claim using LLM analysis.
 * @param {string} claimText - Resume metric claim, project, or work experience context.
 * @param {string} question - Question asked to candidate (or combined multi-turn questions).
 * @param {string} candidateAnswer - Candidate's verbal/written answer (or combined multi-turn answers).
 * @param {Object} answerEval - Technical score & depth rating from answer evaluation.
 * @returns {Promise<Object>} Evidence validation result object.
 */
const validateClaimEvidence = async (claimText, question, candidateAnswer, answerEval) => {
    try {
        if (!claimText || !candidateAnswer || String(candidateAnswer).trim().length === 0) {
            return getFallbackEvidenceResult(claimText, 'insufficient_evidence', 'Insufficient answer or claim details provided.');
        }

        const prompt = EVALUATE_CLAIM_EVIDENCE_PROMPT(claimText, question, candidateAnswer, answerEval);
        const rawResponse = await askGroq(prompt);
        const parsed = parseAIResponse(rawResponse);

        const validStatuses = ['supported', 'partially_supported', 'insufficient_evidence', 'needs_clarification'];
        const evidenceStatus = validStatuses.includes(parsed?.evidenceStatus)
            ? parsed.evidenceStatus
            : 'insufficient_evidence';

        return {
            claimText: String(claimText).slice(0, 300),
            questionAsked: String(question).slice(0, 400),
            candidateResponse: String(candidateAnswer).slice(0, 800),
            evidenceStatus,
            reasoning: parsed?.reasoning || 'Response evaluated for technical evidence and domain alignment.',
            extractedEvidence: Array.isArray(parsed?.extractedEvidence) ? parsed.extractedEvidence : [],
            confidenceRating: typeof parsed?.confidenceRating === 'number' ? Math.min(1.0, Math.max(0.0, parsed.confidenceRating)) : 0.75
        };
    } catch (error) {
        console.error('[validateClaimEvidence] Error validating claim evidence:', error.message);
        return getFallbackEvidenceResult(claimText, 'insufficient_evidence', 'Automated evidence validation encountered a temporary parsing issue.');
    }
};

const getFallbackEvidenceResult = (claimText, status = 'insufficient_evidence', reasoning = '') => ({
    claimText: String(claimText || '').slice(0, 300),
    questionAsked: '',
    candidateResponse: '',
    evidenceStatus: status,
    reasoning: reasoning || 'Insufficient evidence captured during interview.',
    extractedEvidence: [],
    confidenceRating: 0.5
});

/**
 * Process multi-turn evidence across an interview document against a resume document.
 * Groups primary questions and follow-ups addressing the same claim into multi-turn evidence evaluation.
 * @param {Object} interview - Mongoose Interview document
 * @param {Object} resume - Mongoose Resume document
 * @returns {Promise<Array>} Updated array of evidence validation objects
 */
const evaluateInterviewResumeEvidence = async (interview, resume) => {
    try {
        if (!interview || !resume || !resume.parsedData) {
            return interview?.evidenceValidations || [];
        }

        const parsedData = resume.parsedData;
        const claimsList = [];

        // Collect verifiable metric claims
        if (Array.isArray(parsedData.verifiableClaims) && parsedData.verifiableClaims.length > 0) {
            for (const c of parsedData.verifiableClaims) {
                claimsList.push(c.metric || c.claimText || c.context);
            }
        }

        // Collect project titles & descriptions
        if (Array.isArray(parsedData.projects) && parsedData.projects.length > 0) {
            for (const p of parsedData.projects) {
                if (p.title) claimsList.push(`Project: ${p.title} - ${p.description || ''}`);
            }
        }

        // Collect work experience entries
        if (Array.isArray(parsedData.workExperience) && parsedData.workExperience.length > 0) {
            for (const w of parsedData.workExperience) {
                if (w.title && w.company) claimsList.push(`Role: ${w.title} at ${w.company}`);
            }
        }

        if (claimsList.length === 0) {
            return interview.evidenceValidations || [];
        }

        const questions = interview.questions || [];
        const messages = interview.messages || [];
        const evaluations = interview.evaluations || [];

        // Group resume questions and aggregate multi-turn user responses per claim
        const claimMap = new Map();

        for (let i = 0; i < questions.length; i++) {
            const qObj = typeof questions[i] === 'string' ? { question: questions[i] } : questions[i];
            const isResumeQuestion = qObj.type === 'resume' || 
                                     qObj.category === 'Behavioral & Resume Deep Dive' || 
                                     (qObj.question && qObj.question.toLowerCase().includes('resume'));

            if (isResumeQuestion) {
                // Find matching claim explicitly by string inclusion or position
                let matchedClaim = claimsList.find(c => qObj.question.toLowerCase().includes(c.toLowerCase().slice(0, 15))) || claimsList[i % claimsList.length];

                // Collect multi-turn user answers following this question
                const qIndex = i;
                const answerMsgs = [];
                
                // Primary answer following question prompt
                const userAnswersForTurn = messages.filter((m, idx) => m.role === 'user' && idx >= (qIndex * 2) && idx <= (qIndex * 2 + 3));
                for (const uMsg of userAnswersForTurn) {
                    if (uMsg.content && !answerMsgs.includes(uMsg.content)) {
                        answerMsgs.push(uMsg.content);
                    }
                }

                const aggregatedAnswerText = answerMsgs.join(' \n[Follow-up Answer]: ');
                const answerEval = evaluations[i] || {};

                if (!claimMap.has(matchedClaim)) {
                    claimMap.set(matchedClaim, {
                        claimText: matchedClaim,
                        questionsAsked: [qObj.question],
                        answers: [aggregatedAnswerText],
                        evaluations: [answerEval]
                    });
                } else {
                    const existing = claimMap.get(matchedClaim);
                    if (!existing.questionsAsked.includes(qObj.question)) {
                        existing.questionsAsked.push(qObj.question);
                    }
                    if (aggregatedAnswerText && !existing.answers.includes(aggregatedAnswerText)) {
                        existing.answers.push(aggregatedAnswerText);
                    }
                    existing.evaluations.push(answerEval);
                }
            }
        }

        // Perform evidence validation for each unique probed claim (Idempotent & Multi-turn)
        const freshEvidenceValidations = [];

        for (const [claimText, claimData] of claimMap.entries()) {
            const combinedQuestions = claimData.questionsAsked.join(' | ');
            const combinedAnswers = claimData.answers.join(' \n---\n ');
            const bestEval = claimData.evaluations.reduce((best, cur) => (cur.overallScore > (best.overallScore || 0) ? cur : best), claimData.evaluations[0] || {});

            if (combinedAnswers.trim().length > 0) {
                const validationResult = await validateClaimEvidence(claimText, combinedQuestions, combinedAnswers, bestEval);
                freshEvidenceValidations.push(validationResult);
            }
        }

        // Deterministic replacement ensures idempotency on repeated execution
        interview.evidenceValidations = freshEvidenceValidations;
        await interview.save();
        return freshEvidenceValidations;
    } catch (err) {
        console.error('[evaluateInterviewResumeEvidence] Failed to process evidence:', err.message);
        return interview?.evidenceValidations || [];
    }
};

module.exports = {
    validateClaimEvidence,
    evaluateInterviewResumeEvidence
};
