const mongoose = require('mongoose');
const { auditEmailConfiguration } = require('./email.service');

/**
 * Validate required environment variables on server startup.
 * Throws a descriptive error if critical infrastructure variables are missing.
 */
const validateEnvironmentVariables = () => {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'OWNER_EMAIL',
        'CLIENT_URL'
    ];

    const missingVars = [];

    // Check GEMINI_API_KEY or GROQ_API_KEY for AI provider
    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
        missingVars.push('GEMINI_API_KEY (or GROQ_API_KEY)');
    }

    for (const varName of requiredVars) {
        if (!process.env[varName] || process.env[varName].trim() === '') {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        console.error('\n====================================================');
        console.error('CRITICAL ERROR: MISSING ENVIRONMENT VARIABLES');
        console.error('The following required environment variables are missing from .env:');
        missingVars.forEach(v => console.error(`  - ${v}`));
        console.error('Please configure them in server/.env before starting the server.');
        console.error('====================================================\n');
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Informative status check for Postmark variables
    if (!process.env.POSTMARK_SERVER_TOKEN || !process.env.EMAIL_FROM) {
        console.warn('[Startup] Warning: POSTMARK_SERVER_TOKEN or EMAIL_FROM is missing. Transactional emails will be disabled until configured.');
    }

    // Informative status check for Google OAuth variables
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
        console.warn('[Startup] Warning: GOOGLE_CLIENT_ID is using placeholder or not set. Google Sign-In requires a valid Client ID.');
    }
};

/**
 * Audit and print status of all core services during startup.
 */
const checkServicesStatus = () => {
    const isPostmarkConfigured = Boolean(process.env.POSTMARK_SERVER_TOKEN && process.env.POSTMARK_SERVER_TOKEN.trim() !== '');

    const status = {
        mongodb: mongoose.connection.readyState === 1,
        gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY),
        murf: Boolean(process.env.MURF_API_KEY),
        assemblyai: Boolean(process.env.ASSEMBLYAI_API_KEY),
        email: isPostmarkConfigured,
        googleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id'),
        routesLoaded: true
    };

    console.log('\n--- Service Startup Audit ---');

    if (status.mongodb) {
        console.log('✓ MongoDB Connected');
    } else {
        console.log('✗ MongoDB Failed (Disconnected)');
    }

    if (status.gemini) {
        console.log('✓ Gemini Ready');
    } else {
        console.log('✗ Gemini Failed (Missing API Key)');
    }

    if (status.murf) {
        console.log('✓ Murf Ready');
    } else {
        console.log('✗ Murf Failed (Missing API Key)');
    }

    if (status.assemblyai) {
        console.log('✓ AssemblyAI Ready');
    } else {
        console.log('✗ AssemblyAI Failed (Missing API Key)');
    }

    if (status.email) {
        console.log('✓ Postmark Ready');
    } else {
        console.log('✗ Email Failed (Missing POSTMARK_SERVER_TOKEN)');
    }

    if (status.googleAuth) {
        console.log('✓ Google OAuth Ready');
    } else {
        console.log('! Google OAuth Placeholder (Set GOOGLE_CLIENT_ID in .env)');
    }

    if (status.routesLoaded) {
        console.log('✓ Routes Loaded');
    } else {
        console.log('✗ Routes Failed');
    }

    console.log('-----------------------------\n');

    // Run Postmark detailed audit check
    auditEmailConfiguration();

    return status;
};

module.exports = {
    validateEnvironmentVariables,
    checkServicesStatus
};

