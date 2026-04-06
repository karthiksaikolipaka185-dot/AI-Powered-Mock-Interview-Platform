const authService = require('../services/auth.service');

/**
 * Register a new user account.
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // 1. Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // 2. Call service
        const data = await authService.register(name, email, password);
        
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

/**
 * Login an existing user account.
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // 2. Call service
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

        // 1. Basic validation
        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }

        // 2. Call service
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
        const userId = req.user.userId; // Extract from Auth middleware
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
 * Logout a user account.
 */
const logout = async (req, res, next) => {
    return res.status(200).json({
        success: true,
        message: 'Logout successful. Please clear the token from the client.'
    });
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    getMe,
    logout
};
