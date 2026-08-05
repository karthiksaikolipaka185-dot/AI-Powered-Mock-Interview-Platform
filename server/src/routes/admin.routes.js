const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const userManagementRoutes = require('./userManagement.routes');
const interviewManagementRoutes = require('./interviewManagement.routes');
const feedbackManagementRoutes = require('./feedbackManagement.routes');
const dashboardRoutes = require('./dashboard.routes');
const { getStatistics, exportData } = require('../controllers/adminStatistics.controller');

const router = express.Router();

// Apply authentication & admin authorization filters to all admin endpoints securely
router.use(authenticate);
router.use(adminMiddleware);

// Unify sub-feature routers
router.use('/users', userManagementRoutes);
router.use('/interviews', interviewManagementRoutes);
router.use('/feedback', feedbackManagementRoutes);
router.use('/dashboard', dashboardRoutes);

// Analytics Statistics & Export endpoints
router.get('/statistics', getStatistics);
router.get('/export', exportData);

module.exports = router;
