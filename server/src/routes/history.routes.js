const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const { getHistory, getHistoryItem, deleteHistoryItem, clearHistory } = require('../controllers/history.controller');

const router = express.Router();

// Apply authentication
router.use(authenticate);

// Priority 1: Base list output mapped securely 
router.get('/', getHistory);

// Priority 2: Clear history bounded explicit path safely BEFORE arbitrary :id blocks resolve locally
router.delete('/clear', clearHistory);

// Priority 3: Fetch unique identifier object layout
router.get('/:id', getHistoryItem);

// Priority 4: Delete literal instance natively
router.delete('/:id', deleteHistoryItem);

module.exports = router;
