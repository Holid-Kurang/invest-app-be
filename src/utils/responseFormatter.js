const { HTTP_STATUS } = require('../config/constants');

/**
 * Standardized response formatter for consistent API responses
 */
class ResponseFormatter {
    
    static success(res, data, message = null, statusCode = HTTP_STATUS.OK) {
        const response = {
            success: true,
        };

        if (message) {
            response.message = message;
        }

        if (data !== undefined) {
            response.data = data;
        }

        return res.status(statusCode).json(response);
    }

    static paginated(res, data, pagination, message = null) {
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message,
            data,
            pagination,
        });
    }

    static created(res, data, message) {
        return this.success(res, data, message, HTTP_STATUS.CREATED);
    }
}

module.exports = ResponseFormatter;
