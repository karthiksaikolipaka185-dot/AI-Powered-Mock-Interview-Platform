const express = require('express');
const { getAdminDashboard } = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Protected by JWT authentication and ADMIN_EMAIL check
router.use(authenticate);
router.use(adminMiddleware);

// GET /api/dashboard/admin
router.get('/admin', getAdminDashboard);

module.exports = router;
