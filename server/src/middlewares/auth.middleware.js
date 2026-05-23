const { verifyToken } = require('../utils/jwt.utils');

/**
 * Middleware to verify JWT token and attach user to request object.
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Check for presence of Authorization header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        // 2. Extract and verify token
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // 3. Attach decoded payload (userId, email) to request object
        req.user = {
            ...decoded,
            _id: decoded.userId,
            id: decoded.userId
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired authentication token.' 
        });
    }
};

module.exports = authMiddleware;
