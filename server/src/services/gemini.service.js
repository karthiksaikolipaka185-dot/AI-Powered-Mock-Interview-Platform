const { generateContent } = require('../config/gemini.config');

const askGemini = async (prompt) => {
    try {
        // Call generateContent
        const responseText = await generateContent(prompt);
        
        // Throw error if response is empty
        if (!responseText || responseText.trim() === '') {
            throw new Error('Received empty response from Gemini API');
        }
        
        return responseText;
    } catch (error) {
        // Handle errors
        console.error('Error in askGemini service:', error);
        throw error;
    }
};

module.exports = { askGemini };
