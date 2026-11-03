const express = require('express');
const resumeRoutes = require('./resume.routes');
const interviewRoutes = require('./interview.routes');
const historyRoutes = require('./history.routes');
const authRoutes = require('./auth.routes');
const feedbackRoutes = require('./feedback.routes');
const dashboardRoutes = require('./dashboard.routes');
const adminRoutes = require('./admin.routes');
const { getHealthStatus } = require('../controllers/health.controller');

const router = express.Router();

// Health Check Endpoint: GET /api/health
router.get('/health', getHealthStatus);

// Core Feature Routes
router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/history', historyRoutes);
router.use('/feedback', feedbackRoutes);

// Admin & Dashboard Feature Routes
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
