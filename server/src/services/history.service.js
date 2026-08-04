const Interview = require('../models/Interview.model');

const getUserHistory = async (userId, page, limit) => {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    
    const skip = (parsedPage - 1) * parsedLimit;

    console.log(`[getUserHistory] Querying history for userId: ${userId}, page: ${parsedPage}, limit: ${parsedLimit}`);

    const dataQuery = Interview.find({ userId })
        .select('_id role status createdAt updatedAt feedback')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);
        
    const countQuery = Interview.countDocuments({ userId });

    const [entries, totalEntries] = await Promise.all([dataQuery, countQuery]);

    console.log(`[getUserHistory] Returning ${entries.length} entries out of total ${totalEntries} for userId: ${userId}`);

    return {
        entries,
        totalEntries,
        totalPages: Math.max(1, Math.ceil(totalEntries / parsedLimit)),
        currentPage: parsedPage
    };
};

const getHistoryEntry = async (entryId, userId) => {
    // Find interview strictly bounding against both IDs explicitly excluding version field
    const interview = await Interview.findOne({ _id: entryId, userId }).select('-__v');
    
    if (!interview) {
        throw new Error('Interview not found');
    }
    
    return interview;
};

const deleteHistoryEntry = async (entryId, userId) => {
    // Secure bound execution avoiding deleting elements globally
    const result = await Interview.deleteOne({ _id: entryId, userId });
    return result;
};

const clearUserHistory = async (userId) => {
    // Obliterate matched user sessions unconditionally 
    const result = await Interview.deleteMany({ userId });
    return result.deletedCount;
};

module.exports = {
    getUserHistory,
    getHistoryEntry,
    deleteHistoryEntry,
    clearUserHistory
};
