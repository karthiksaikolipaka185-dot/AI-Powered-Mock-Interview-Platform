const express = require('express');
const Router = express.Router;
const { uploadResume, getResume } = require('../controllers/resume.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const { uploadResume: uploadResumeMiddleware } = require('../middlewares/multer.middleware');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /upload -> 1. multer upload middleware (PDF-only), 2. uploadResume controller
router.post('/upload', uploadResumeMiddleware, uploadResume);

// GET / -> Calls getResume controller
router.get('/', getResume);

module.exports = router;
