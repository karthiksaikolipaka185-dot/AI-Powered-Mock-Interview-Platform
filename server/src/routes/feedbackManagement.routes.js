const express = require('express');
const { getFeedbackList, getFeedbackDetail, markAsReviewed } = require('../controllers/feedbackManagement.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Protect all admin feedback endpoints with JWT & admin verification
router.use(authenticate);
router.use(adminMiddleware);

// GET /api/admin/feedback - Paginated feedback list (supports both trailing slash and empty path)
router.get('/', getFeedbackList);
router.get('', getFeedbackList);

// GET /api/admin/feedback/:id - Detailed feedback entry with sentiment
router.get('/:id', getFeedbackDetail);

// PATCH /api/admin/feedback/:id/review - Mark feedback as Reviewed
router.patch('/:id/review', markAsReviewed);

module.exports = router;
