const mongoose = require('mongoose');

/**
 * Health check endpoint controller to inspect status of DB and external services.
 */
const getHealthStatus = async (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
    const hasAssemblyKey = Boolean(process.env.ASSEMBLYAI_API_KEY);
    const hasMurfKey = Boolean(process.env.MURF_API_KEY);
    const hasEmailConfig = Boolean(
        (process.env.EMAIL_USER || process.env.SMTP_USER) && 
        (process.env.EMAIL_PASS || process.env.SMTP_PASS)
    );

    const uptimeSeconds = Math.floor(process.uptime());

    return res.status(200).json({
        status: dbConnected ? 'Healthy' : 'Degraded',
        timestamp: new Date().toISOString(),
        services: {
            Database: dbConnected ? 'Connected' : 'Disconnected',
            Gemini: hasGeminiKey ? 'Ready' : 'Unavailable',
            AssemblyAI: hasAssemblyKey ? 'Ready' : 'Unavailable',
            Murf: hasMurfKey ? 'Ready' : 'Unavailable',
            Email: hasEmailConfig ? 'Ready' : 'Unavailable'
        },
        system: {
            serverUptime: `${uptimeSeconds} seconds`,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development'
        }
    });
};

module.exports = { getHealthStatus };
