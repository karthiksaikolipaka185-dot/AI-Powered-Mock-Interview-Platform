/**
 * Admin authorization middleware.
 * Ensures the authenticated user's email matches process.env.ADMIN_EMAIL.
 */
const adminMiddleware = (req, res, next) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'karthiksaikolipaka185@gmail.com';
        const userEmail = req.user ? req.user.email : null;

        if (!userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
            console.warn(`[AdminMiddleware] Forbidden access attempt by: ${userEmail || 'Unauthenticated User'}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        console.error('[AdminMiddleware] Error verifying admin privileges:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error during admin verification'
        });
    }
};

module.exports = adminMiddleware;
