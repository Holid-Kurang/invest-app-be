const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Centralized error handler for consistent error responses
 */
class ErrorHandler {
    
    static handleError(res, error, customMessage = null, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        console.error('Error:', error);

        return res.status(statusCode).json({
            success: false,
            message: customMessage || ERROR_MESSAGES.SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && { error: error.message }),
        });
    }

    static validationError(res, message) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message,
        });
    }

    static notFoundError(res, message) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message,
        });
    }

    static unauthorizedError(res, message = ERROR_MESSAGES.UNAUTHORIZED) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message,
        });
    }
}

module.exports = ErrorHandler;
