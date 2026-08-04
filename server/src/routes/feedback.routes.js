const express = require('express');
const { submitFeedback, getFeedback } = require('../controllers/feedback.controller');
const authenticate = require('../middlewares/authenticate.middleware');

const router = express.Router();

// Apply authentication middleware to feedback endpoints
router.use(authenticate);

// POST /api/feedback - Save feedback in MongoDB & send email notification
router.post('/', submitFeedback);

// GET /api/feedback - Retrieve feedback list for admin review
router.get('/', getFeedback);

module.exports = router;
