const express = require('express');
const resumeRoutes = require('./resume.routes');
const interviewRoutes = require('./interview.routes');
const historyRoutes = require('./history.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();

// Mount routes ensuring final API structure
router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/history', historyRoutes);

module.exports = router;
