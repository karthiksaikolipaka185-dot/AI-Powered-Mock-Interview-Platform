const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate.middleware');
const { getProfile, recalculateProfile } = require('../controllers/skill.controller');

router.get('/profile', authenticate, getProfile);
router.post('/recalculate', authenticate, recalculateProfile);

module.exports = router;
