const axios = require('axios');

// Configuration
const MURF_BASE_URL = 'https://global.api.murf.ai/v1/speech/stream';
const MURF_VOICE_ID = 'en-US-natalie';
const MURF_LOCALE = 'en-US';

const buildPayload = (text) => {
    return {
        // Add prefix to text: "[pause 1s]" to avoid clipping first word
        text: `[pause 1s] ${text}`,
        voiceId: MURF_VOICE_ID,
        model: 'FALCON',
        multiNativeLocale: MURF_LOCALE
    };
};

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY
    };
};

const streamAudio = async (text, res) => {
    try {
        const payload = buildPayload(text);

        // Send request to Murf API
        const response = await axios.post(MURF_BASE_URL, payload, {
            headers: getHeaders(),
            responseType: 'stream'
        });

        // Set content type securely preserving audio specs matching Murf format
        if (!res.headersSent && response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }

        // Stream response: Pipe audio chunks directly to Express response
        // This enables real-time playback
        response.data.pipe(res);

    } catch (error) {
        console.error('Error streaming audio from Murf AI:', error.message || error);
        
        // Error handling: Check if res.headersSent before sending errors
        // Prevent server crashes during streaming
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Audio stream generation failed' });
        } else {
            res.end();
        }
    }
};

const generateAudio = async (text) => {
    try {
        // Send same payload to Murf API
        const payload = buildPayload(text);

        // Collect full audio response
        const response = await axios.post(MURF_BASE_URL, payload, {
            headers: getHeaders(),
            responseType: 'arraybuffer' // Safely handles incoming raw byte layout
        });

        // Convert to base64 format
        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
        
        // Return base64 audio
        return base64Audio;
    } catch (error) {
        console.error('Error generating audio base64 from Murf AI:', error.message || error);
        throw error;
    }
};

module.exports = {
    streamAudio,
    generateAudio
};
