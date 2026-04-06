const { GoogleGenAI } = require('@google/genai');

// Centralize model configuration
const MODEL_NAME = 'gemini-2.5-flash';

// Initialize @google/genai client using GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateContent = async (prompt) => {
    try {
        // Send prompt to Gemini API
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        
        // Return response.text
        return response.text;
    } catch (error) {
        // Handle errors with proper logging
        console.error('Error generating content with Gemini API:', error);
        throw error;
    }
};

module.exports = {
    generateContent,
    MODEL_NAME
};
