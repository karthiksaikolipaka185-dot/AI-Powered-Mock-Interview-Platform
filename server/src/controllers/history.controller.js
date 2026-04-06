const { getUserHistory, getHistoryEntry, deleteHistoryEntry, clearUserHistory } = require('../services/history.service');

const getHistory = async (req, res, next) => {
    try {
        // Extract dynamically mapping defaults accurately 
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        
        const userId = req.user._id || req.user.id;

        const paginatedResult = await getUserHistory(userId, page, limit);

        return res.status(200).json({
            success: true,
            data: paginatedResult
        });
    } catch (error) {
        next(error);
    }
};

const getHistoryItem = async (req, res, next) => {
    try {
        const entryId = req.params.id;
        const userId = req.user._id || req.user.id;

        const result = await getHistoryEntry(entryId, userId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message === 'Interview not found') {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        next(error);
    }
};

const deleteHistoryItem = async (req, res, next) => {
    try {
        const entryId = req.params.id;
        const userId = req.user._id || req.user.id;

        await deleteHistoryEntry(entryId, userId);

        return res.status(200).json({
            success: true,
            message: 'Interview record cleanly deleted.'
        });
    } catch (error) {
        next(error);
    }
};

const clearHistory = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;

        const deletedCount = await clearUserHistory(userId);

        return res.status(200).json({
            success: true,
            data: {
                message: "All history cleared",
                deletedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHistory,
    getHistoryItem,
    deleteHistoryItem,
    clearHistory
};
