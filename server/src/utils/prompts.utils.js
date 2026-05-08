const parseAIResponse = (responseText) => {
    try {
        if (!responseText) return null;
        
        // 1. Find the first [ and last ] to extract JSON array
        const start = responseText.indexOf('[');
        const end = responseText.lastIndexOf(']');
        
        let jsonPart;
        if (start !== -1 && end !== -1 && end > start) {
            jsonPart = responseText.substring(start, end + 1);
        } else {
            // 2. Try object if array fails
            const objStart = responseText.indexOf('{');
            const objEnd = responseText.lastIndexOf('}');
            if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                jsonPart = responseText.substring(objStart, objEnd + 1);
            }
        }

        if (!jsonPart) {
            // Fallback: try parsing whole text if no brackets found (legacy behavior)
            return JSON.parse(responseText.replace(/```(?:json)?/g, '').trim());
        }
        
        return JSON.parse(jsonPart);
    } catch (error) {
        // Log errors if parsing fails with raw context
        console.error('Error parsing AI JSON response:', error.message);
        console.log('Failed Raw AI Response Snippet:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
        throw new Error('AI returned an invalid data format. Please try again.');
    }
};

module.exports = {
    parseAIResponse
};
