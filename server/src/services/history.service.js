const Interview = require('../models/Interview.model');

const getUserHistory = async (userId, page, limit) => {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    
    // Calculate skip limit natively natively 
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch interviews filtering seamlessly parsing mapped limits
    // Optimization query mapping .select() limits fetching large objects safely
    const dataQuery = Interview.find({ userId })
        .select('_id role status createdAt updatedAt feedback')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);
        
    const countQuery = Interview.countDocuments({ userId });

    // Leverage Promise.all extracting outputs rapidly avoiding blocking sequence limits
    const [entries, totalEntries] = await Promise.all([dataQuery, countQuery]);

    return {
        entries,
        totalEntries,
        totalPages: Math.ceil(totalEntries / parsedLimit),
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
