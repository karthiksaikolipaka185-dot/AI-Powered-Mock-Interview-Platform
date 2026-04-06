const parseAIResponse = (responseText) => {
    try {
        if (!responseText) return null;
        
        // Remove markdown code fences (``` or ```json)
        const cleanedText = responseText.replace(/```(?:json)?/g, '').trim();
        
        // Parse JSON safely using JSON.parse
        return JSON.parse(cleanedText);
    } catch (error) {
        // Log errors if parsing fails
        console.error('Error parsing AI JSON response:', error);
        throw error;
    }
};

module.exports = {
    parseAIResponse
};
