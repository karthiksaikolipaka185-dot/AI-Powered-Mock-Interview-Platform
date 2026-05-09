const parseAIResponse = (responseText) => {
    try {
        if (!responseText) return null;
        console.log(`[parseAIResponse] Received text of length: ${responseText.length}`);
        
        const cleaned = responseText.trim();
        
        // 1. Try parsing the whole thing first (Fast path)
        try {
            return JSON.parse(cleaned);
        } catch (e) {}

        // 2. Try extracting from markdown blocks
        const mdMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/) || cleaned.match(/```\s*([\s\S]*?)\s*```/);
        if (mdMatch) {
            try {
                return JSON.parse(mdMatch[1].trim());
            } catch (e) {}
        }

        // 3. Robust scan for JSON structures (handles trailing conversational text)
        const firstOpenBrace = cleaned.indexOf('{');
        const firstOpenBracket = cleaned.indexOf('[');
        
        let startChar, endChar;
        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startChar = '{';
            endChar = '}';
        } else if (firstOpenBracket !== -1) {
            startChar = '[';
            endChar = ']';
        }

        if (startChar) {
            let start = cleaned.indexOf(startChar);
            let end = cleaned.lastIndexOf(endChar);
            
            // Iteratively shrink the window if parsing fails (to handle multiple objects/noise)
            while (start !== -1 && end !== -1 && end > start) {
                const potentialJson = cleaned.substring(start, end + 1);
                try {
                    return JSON.parse(potentialJson);
                } catch (e) {
                    end = cleaned.lastIndexOf(endChar, end - 1);
                }
            }
        }

        throw new Error('Could not find valid JSON in AI response');
    } catch (error) {
        console.error('Error parsing AI JSON response:', error.message);
        console.log('Failed Raw AI Response Snippet:', responseText.substring(0, 500));
        throw new Error('AI returned an invalid data format. Please try again.');
    }
};

module.exports = {
    parseAIResponse
};
