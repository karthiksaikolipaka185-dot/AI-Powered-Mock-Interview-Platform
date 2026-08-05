const interviewManagementService = require('../services/interviewManagement.service');

/**
 * Controller to fetch paginated interviews list.
 * GET /api/admin/interviews
 */
const getInterviewsList = async (req, res, next) => {
    try {
        const { page, limit, search, status, difficulty, sortBy } = req.query;

        const data = await interviewManagementService.getPaginatedInterviews({
            page,
            limit,
            search,
            status,
            difficulty,
            sortBy
        });

        return res.status(200).json({
            success: true,
            data,
            message: 'Interview sessions list fetched successfully.'
        });
    } catch (error) {
        console.error('[InterviewManagementController] Error fetching interviews list:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve interviews list.',
            error: error.message
        });
    }
};

/**
 * Controller to fetch detailed single interview telemetry & code submissions.
 * GET /api/admin/interviews/:id
 */
const getInterviewDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const detail = await interviewManagementService.getInterviewDetailById(id);

        return res.status(200).json({
            success: true,
            data: detail,
            message: 'Interview detailed telemetry fetched successfully.'
        });
    } catch (error) {
        console.error('[InterviewManagementController] Error fetching interview detail:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to retrieve interview detail.'
        });
    }
};

/**
 * Controller to handle deleting an interview session.
 * DELETE /api/admin/interviews/:id
 */
const deleteInterview = async (req, res, next) => {
    try {
        const { id } = req.params;

        await interviewManagementService.deleteInterviewById(id);

        return res.status(200).json({
            success: true,
            message: 'Interview session deleted successfully.'
        });
    } catch (error) {
        console.error('[InterviewManagementController] Error deleting interview:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to delete interview session.'
        });
    }
};

module.exports = {
    getInterviewsList,
    getInterviewDetail,
    deleteInterview
};
