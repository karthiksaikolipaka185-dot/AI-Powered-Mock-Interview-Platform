const Groq = require("groq-sdk");

// Centralize model configuration
const MODEL_NAME = "llama-3.3-70b-versatile"; // or "mixtral-8x7b-32768"

// Initialize Groq client using GROQ_API_KEY
if (!process.env.GROQ_API_KEY) {
    console.error("CRITICAL: GROQ_API_KEY is missing from environment variables.");
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