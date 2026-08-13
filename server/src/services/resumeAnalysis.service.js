const { Groq } = require('groq-sdk');
const { RESUME_ANALYSIS_PROMPT } = require('../constants/prompts');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Parses raw text from a candidate's resume into a structured JSON intelligence model.
 * @param {string} rawText - Extracted text from PDF resume.
 * @returns {Promise<Object>} Structured parsedData object.
 */
const extractStructuredResumeData = async (rawText) => {
    try {
        if (!rawText || rawText.trim().length === 0) {
            return getDefaultParsedData();
        }

        console.log(`[extractStructuredResumeData] Analyzing resume text (${rawText.length} chars)...`);

        const prompt = RESUME_ANALYSIS_PROMPT(rawText);
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);

        return {
            workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
            verifiableClaims: Array.isArray(parsed.verifiableClaims) ? parsed.verifiableClaims : []
        };
    } catch (error) {
        console.error('[extractStructuredResumeData] LLM parsing error, returning heuristic fallback:', error.message);
        return getHeuristicFallback(rawText);
    }
};

const getDefaultParsedData = () => ({
    workExperience: [],
    projects: [],
    technicalSkills: [],
    verifiableClaims: []
});

/**
 * Strict fallback parser when LLM parsing is unavailable.
 * Returns empty arrays so no invented placeholders are ever synthesized.
 */
const getHeuristicFallback = (rawText) => {
    return getDefaultParsedData();
};

module.exports = {
    extractStructuredResumeData
};
