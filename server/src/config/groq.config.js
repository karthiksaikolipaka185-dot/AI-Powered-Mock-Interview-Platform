const Groq = require("groq-sdk");

const getGroqModel = () => {
    return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
};

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

const auditGroqService = async () => {
    const apiKeyConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
    const model = getGroqModel();
    let status = 'unavailable';

    if (!apiKeyConfigured) {
        return {
            provider: 'Groq',
            apiKey: 'missing',
            model,
            status: 'failed (missing API key)'
        };
    }

    try {
        const client = getGroqClient();
        const response = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
        });
        if (response && response.choices && response.choices.length > 0) {
            status = 'ready';
        }
    } catch (err) {
        console.error(`[GroqConfig] Configured model "${model}" is unavailable:`, err.message || err);
        status = `unavailable (${err.message || 'error'})`;
    }

    return {
        provider: 'Groq',
        apiKey: apiKeyConfigured ? 'configured' : 'missing',
        model,
        status
    };
};

const generateContent = async (prompt) => {
    const model = getGroqModel();
    try {
        const client = getGroqClient();

        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        if (error.status === 404 || error.code === 'model_not_found' || (error.message && error.message.includes('does not exist'))) {
            console.error(`[GroqConfig] Configured model "${model}" is unavailable.`);
        } else {
            console.error("Error generating content with Groq API:", error.message || error);
        }
        throw error;
    }
};

module.exports = {
    generateContent,
    getGroqModel,
    getGroqClient,
    auditGroqService,
    get MODEL_NAME() {
        return getGroqModel();
    }
};