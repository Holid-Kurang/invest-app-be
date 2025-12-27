const { BUSINESS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Utility functions for amount validation
 */
class AmountValidator {
    
    static validate(amount, options = {}) {
        const {
            min = BUSINESS.MIN_AMOUNT,
            max = BUSINESS.MAX_AMOUNT,
        } = options;

        // Check if amount is provided
        if (!amount) {
            return {
                valid: false,
                error: ERROR_MESSAGES.AMOUNT_REQUIRED,
            };
        }

        // Parse amount to float
        const parsedAmount = parseFloat(amount);

        // Check if amount is a valid number
        if (isNaN(parsedAmount)) {
            return {
                valid: false,
                error: ERROR_MESSAGES.AMOUNT_INVALID,
            };
        }

        // Check minimum amount
        if (parsedAmount <= min) {
            return {
                valid: false,
                error: ERROR_MESSAGES.AMOUNT_INVALID,
            };
        }

        // Check maximum amount
        if (parsedAmount >= max) {
            return {
                valid: false,
                error: ERROR_MESSAGES.AMOUNT_TOO_LARGE,
            };
        }

        return {
            valid: true,
            error: null,
            amount: parsedAmount,
        };
    }

    static validateWithdrawal(amount) {
        const validation = this.validate(amount);

        if (!validation.valid) {
            return validation;
        }

        // Check minimum withdrawal amount
        if (validation.amount < BUSINESS.MIN_WITHDRAWAL) {
            return {
                valid: false,
                error: ERROR_MESSAGES.AMOUNT_BELOW_MINIMUM,
            };
        }

        return validation;
    }

    static formatToRupiah(amount) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }
}

module.exports = AmountValidator;
