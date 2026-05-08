const { generateContent } = require('../config/groq.config');

const askGroq = async (prompt) => {
    try {
        // Call generateContent
        const responseText = await generateContent(prompt);
        
        // Throw error if response is empty
        if (!responseText || responseText.trim() === '') {
            throw new Error('Received empty response from Groq API');
        }
        
        return responseText;
    } catch (error) {
        // Handle errors
        console.error('Error in askGroq service:', error);
        throw error;
    }
};

module.exports = { askGroq };
