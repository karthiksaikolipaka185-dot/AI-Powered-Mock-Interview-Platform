const express = require('express');
const { 
    registerUser, 
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

// 2. POST /api/auth/login
router.post('/login', loginUser);

// 3. POST /api/auth/google (Google Social Login)
router.post('/google', googleAuth);

/**
 * Protected Routes
 */
// Apply auth middleware for private identity-sensitive routes
router.use(authMiddleware);

// 4. GET /api/auth/me (Get current profile)
router.get('/me', getMe);

// 5. POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
