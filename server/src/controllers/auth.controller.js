const authService = require('../services/auth.service');

/**
 * Register a new user account with verification token.
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const data = await authService.register(name, email, password);
        
        return res.status(201).json({
            success: true,
            message: data.message || 'User registered successfully. Please verify your email.',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

/**
 * Verify candidate email token link.
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const result = await authService.verifyEmailToken(token);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

/**
 * Login an existing user account with email verification check.
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const data = await authService.emailLogin(email, password);
        
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 401).json({ success: false, message: error.message });
    }
};

/**
 * Handle Google OAuth login.
 */
const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }

        const data = await authService.googleLogin(credential);

        return res.status(200).json({
            success: true,
            message: 'Google login successful',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 401).json({ success: false, message: error.message });
    }
};

/**
 * Fetch current user profile.
 */
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await authService.getUserProfile(userId);
        
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

/**
 * Resend verification token link to candidate email.
 */
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const result = await authService.resendVerificationToken(email);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

/**
 * Logout a user account.
 */
const logout = async (req, res, next) => {
    return res.status(200).json({
        success: true,
        message: 'Logout successful.'
    });
};

module.exports = {
    registerUser,
    verifyEmail,
    resendVerification,
    loginUser,
    googleAuth,
    getMe,
    logout
};

