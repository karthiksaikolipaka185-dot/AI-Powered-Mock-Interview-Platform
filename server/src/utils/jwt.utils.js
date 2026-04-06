const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given user.
 * @param {Object} user - The user object containing _id and email.
 * @returns {string} - The signed JWT token.
 */
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email
    };
    
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Verify a JWT token.
 * @param {string} token - The token to verify.
 * @returns {Object} - The decoded payload.
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
