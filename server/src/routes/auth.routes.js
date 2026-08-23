const express = require('express');
const { 
    registerUser, 
    verifyEmail,
    resendVerification,
    loginUser, 
    googleAuth, 
    getMe, 
    logout 
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public Routes
 */
// 1. POST /api/auth/register
router.post('/register', registerUser);

// 2. GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// 3. POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);

// 4. POST /api/auth/login
router.post('/login', loginUser);

// 5. POST /api/auth/google (Google Social Login)
router.post('/google', googleAuth);

/**
 * Protected Routes
 */
router.use(authMiddleware);

// 5. GET /api/auth/me (Get current profile)
router.get('/me', getMe);

// 6. POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
