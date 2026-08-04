const express = require('express');
const { getUsersList, getUserDetail } = require('../controllers/userManagement.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Protect all user management endpoints with authentication & admin verification
router.use(authenticate);
router.use(adminMiddleware);

// GET /api/admin/users - Paginated user list with search & filters
router.get('/', getUsersList);

// GET /api/admin/users/:id - Detailed user profile & telemetry
router.get('/:id', getUserDetail);

module.exports = router;
