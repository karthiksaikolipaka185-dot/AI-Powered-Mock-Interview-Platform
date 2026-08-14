/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    // 1. Log the error internally for debugging
    console.error('Error in Application:', err.stack || err.message);

    // 2. Set an appropriate status code (Multer errors should return 400, custom err.statusCode respected)
    let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
    }
    
    // 3. Send standardized JSON error response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
