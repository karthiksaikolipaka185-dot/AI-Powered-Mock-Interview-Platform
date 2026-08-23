const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_fallback_secret');
                req.user = {
                    ...decoded,
                    _id: decoded.userId || decoded.id || decoded._id,
                    id: decoded.userId || decoded.id || decoded._id
                };
                return next();
            }
        }

        // Strict 401 response in production environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication token is missing or invalid.'
            });
        }

        // Development-only unauthenticated fallback
        req.user = { _id: '507f191e810c19729de860ea', name: 'Developer User' };
        return next();
    } catch (error) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid or expired authentication token.'
            });
        }
        
        console.warn('[AuthMiddleware] Invalid Token in Development: Fallback to Dev Identity.');
        req.user = { _id: '507f191e810c19729de860ea', name: 'Developer User' };
        return next();
    }
};

module.exports = authenticate;

