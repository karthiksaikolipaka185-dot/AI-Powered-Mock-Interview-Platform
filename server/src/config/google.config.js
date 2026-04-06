const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token.
 * @param {string} token - The credential token from Google.
 * @returns {Object} - The verified ticket payload.
 */
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        return ticket.getPayload();
    } catch (error) {
        console.error('Google token verification failed:', error.message);
        throw new Error('Invalid Google credential');
    }
};

module.exports = {
    verifyGoogleToken
};
