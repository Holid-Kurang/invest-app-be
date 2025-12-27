const { STATUS, STATUS_DISPLAY } = require('../config/constants');

/**
 * Utility functions for status formatting
 */
class StatusFormatter {
    static formatStatus(status) {
        return STATUS_DISPLAY[status] || status;
    }

    static isValidStatus(status) {
        return Object.values(STATUS).includes(status);
    }

}

module.exports = StatusFormatter;
