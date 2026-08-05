const adminStatisticsService = require('../services/adminStatistics.service');

/**
 * Controller to handle fetching complete system-wide analytics.
 * GET /api/admin/statistics
 */
const getStatistics = async (req, res, next) => {
    try {
        const stats = await adminStatisticsService.getAdminStatistics();
        return res.status(200).json({
            success: true,
            data: stats,
            message: 'Admin system statistics retrieved successfully.'
        });
    } catch (error) {
        console.error('[AdminStatisticsController] Error fetching statistics:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve system statistics.',
            error: error.message
        });
    }
};

/**
 * Controller to handle exporting data.
 * GET /api/admin/export
 */
const exportData = async (req, res, next) => {
    try {
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Export type query parameter is required (users, interviews, feedback).'
            });
        }

        const data = await adminStatisticsService.getAdminExportData(type);

        return res.status(200).json({
            success: true,
            data,
            message: `Export data for type ${type} fetched successfully.`
        });
    } catch (error) {
        console.error('[AdminStatisticsController] Error exporting data:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to export data.'
        });
    }
};

module.exports = {
    getStatistics,
    exportData
};
