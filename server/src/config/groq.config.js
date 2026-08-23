const Groq = require("groq-sdk");

const MODEL_NAME = "llama-3.1-8b-instant";

let groqInstance = null;

const getGroqClient = () => {
    if (!groqInstance) {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error("GROQ_API_KEY is missing from environment variables.");
        }

        groqInstance = new Groq({ apiKey });
    }

    return groqInstance;
};

const generateContent = async (prompt) => {
    try {
        const client = getGroqClient();

        const response = await client.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

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