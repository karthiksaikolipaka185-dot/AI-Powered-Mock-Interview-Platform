const express = require('express');
const { getInterviewsList, getInterviewDetail, deleteInterview } = require('../controllers/interviewManagement.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Protect all admin interview endpoints with JWT & admin verification
router.use(authenticate);
router.use(adminMiddleware);

// GET /api/admin/interviews - Paginated interviews list (supports both trailing slash and empty path)
router.get('/', getInterviewsList);
router.get('', getInterviewsList);

// GET /api/admin/interviews/:id - Detailed session timeline & code submissions
router.get('/:id', getInterviewDetail);

// DELETE /api/admin/interviews/:id - Delete interview session
router.delete('/:id', deleteInterview);

module.exports = router;
