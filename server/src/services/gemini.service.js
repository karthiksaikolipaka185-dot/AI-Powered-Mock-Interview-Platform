const { askGroq } = require('./groq.service');

/**
 * Interface to generate content using Gemini / AI engine.
 * Dynamically uses GEMINI_API_KEY or falls back to Groq AI provider.
 */
const askGemini = async (prompt) => {
    try {
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza')) {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } else {
            // Fallback to active Groq AI engine
            return await askGroq(prompt);
        }
    } catch (error) {
        console.warn('[GeminiService] Direct Gemini call fallback to Groq:', error.message);
        return await askGroq(prompt);
    }
};

module.exports = {
    askGemini,
    generateContent: askGemini
};
