const userManagementService = require('../services/userManagement.service');

/**
 * Controller to handle fetching paginated users list for Admin User Management.
 * GET /api/admin/users
 */
const getUsersList = async (req, res, next) => {
    try {
        const { page, limit, search, sortBy, sortOrder, filterStatus } = req.query;

        const data = await userManagementService.getPaginatedUsers({
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            filterStatus
        });

        return res.status(200).json({
            success: true,
            data,
            message: 'User list fetched successfully.'
        });
    } catch (error) {
        console.error('[UserManagementController] Error fetching user list:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve users list.',
            error: error.message
        });
    }
};

/**
 * Controller to handle fetching complete user details for the slide-over drawer.
 * GET /api/admin/users/:id
 */
const getUserDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const userDetail = await userManagementService.getUserDetailsById(id);

        return res.status(200).json({
            success: true,
            data: userDetail,
            message: 'User profile details fetched successfully.'
        });
    } catch (error) {
        console.error('[UserManagementController] Error fetching user detail:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to retrieve user profile details.'
        });
    }
};

module.exports = {
    getUsersList,
    getUserDetail
};
