const Groq = require("groq-sdk");

// Centralize model configuration
const MODEL_NAME = "llama-3.1-8b-instant"; // Supported stable model

// Initialize Groq client using GROQ_API_KEY
if (!process.env.GROQ_API_KEY) {
    console.error("CRITICAL: GROQ_API_KEY is missing from environment variables.");
} else {
    console.log(`[GroqConfig] API Key loaded (starts with: ${process.env.GROQ_API_KEY.substring(0, 7)}...)`);
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "missing_key",
});

const generateContent = async (prompt) => {
    try {
        const response = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // Extract response text
        return response.choices[0].message.content;

    } catch (error) {
        console.error("Error generating content with Groq API:", error);
        throw error;
    }
};

module.exports = {
    generateContent,
    MODEL_NAME,
};