const feedbackManagementService = require('../services/feedbackManagement.service');

/**
 * Controller to fetch paginated feedback list for Admin Feedback Center.
 * GET /api/admin/feedback
 */
const getFeedbackList = async (req, res, next) => {
    try {
        const { page, limit, search, rating, reviewStatus, sortBy } = req.query;

        const data = await feedbackManagementService.getPaginatedFeedback({
            page,
            limit,
            search,
            rating,
            reviewStatus,
            sortBy
        });

        return res.status(200).json({
            success: true,
            data,
            message: 'Feedback records fetched successfully.'
        });
    } catch (error) {
        console.error('[FeedbackManagementController] Error fetching feedback list:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve feedback records.',
            error: error.message
        });
    }
};

/**
 * Controller to fetch single feedback details for the drawer.
 * GET /api/admin/feedback/:id
 */
const getFeedbackDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const detail = await feedbackManagementService.getFeedbackDetailById(id);

        return res.status(200).json({
            success: true,
            data: detail,
            message: 'Feedback details fetched successfully.'
        });
    } catch (error) {
        console.error('[FeedbackManagementController] Error fetching feedback detail:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to retrieve feedback detail.'
        });
    }
};

/**
 * Controller to mark a feedback item as Reviewed.
 * PATCH /api/admin/feedback/:id/review
 */
const markAsReviewed = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedFeedback = await feedbackManagementService.markFeedbackAsReviewed(id);

        return res.status(200).json({
            success: true,
            data: updatedFeedback,
            message: 'Feedback marked as Reviewed successfully.'
        });
    } catch (error) {
        console.error('[FeedbackManagementController] Error updating review status:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update review status.'
        });
    }
};

module.exports = {
    getFeedbackList,
    getFeedbackDetail,
    markAsReviewed
};
