const feedbackService = require('../services/feedback.service');

/**
 * Controller to handle feedback submission.
 */
const submitFeedbackController = async (req, res, next) => {
    try {
        const userId = req.user ? (req.user.userId || req.user._id || req.user.id) : null;
        const userEmail = req.user ? req.user.email : 'Anonymous Candidate';
        const { rating, favoriteFeature, suggestion } = req.body;

        const feedback = await feedbackService.submitFeedback({
            userId,
            rating,
            favoriteFeature,
            suggestion,
            userEmail
        });

        return res.status(201).json({
            success: true,
            data: feedback,
            message: 'Feedback submitted successfully.'
        });
    } catch (error) {
        console.error('[FeedbackController] Error submitting feedback:', error);
        next(error);
    }
};

/**
 * Controller to handle retrieving feedback items.
 */
const getFeedbackController = async (req, res, next) => {
    try {
        const feedbacks = await feedbackService.getFeedback();

        return res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        console.error('[FeedbackController] Error fetching feedback:', error);
        next(error);
    }
};

module.exports = {
    submitFeedback: submitFeedbackController,
    createFeedback: submitFeedbackController,
    getFeedback: getFeedbackController
};
