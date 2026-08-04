const dashboardService = require('../services/dashboard.service');

/**
 * Controller to handle Admin Dashboard analytics request.
 * GET /api/dashboard/admin
 */
const getAdminDashboard = async (req, res, next) => {
    try {
        const { timeframe, search } = req.query;

        const analytics = await dashboardService.getAdminDashboardAnalytics({
            timeframe: timeframe || 'all',
            search: search || ''
        });

        return res.status(200).json({
            success: true,
            data: analytics,
            message: 'Admin dashboard analytics fetched successfully.'
        });
    } catch (error) {
        console.error('[DashboardController] Error fetching admin analytics:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard analytics.',
            error: error.message
        });
    }
};

module.exports = {
    getAdminDashboard
};
