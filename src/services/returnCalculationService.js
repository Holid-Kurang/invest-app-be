const { BUSINESS } = require('../config/constants');

/**
 * Service for calculating investment returns and dividends
 */
class ReturnCalculationService {
    /**
     * Calculate investment returns based on time period
     * @param {number} totalInvestment - Total investment amount
     * @param {Date} startDate - Start date of investment
     * @param {Date} endDate - End date (default: current date)
     * @returns {Object} Calculation results
     */
    static calculateReturns(totalInvestment, startDate, endDate = new Date()) {
        // Calculate annual return (12% per year)
        const annualReturn = totalInvestment * BUSINESS.ANNUAL_RETURN_RATE;

        // Calculate daily return
        const dailyReturn = annualReturn / BUSINESS.DAYS_IN_YEAR;

        // Calculate total days between dates
        const timeDiff = endDate - startDate;
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        // Calculate total returns
        const totalReturns = dailyReturn * totalDays;

        return {
            annualReturn,
            dailyReturn,
            totalDays,
            totalReturns,
        };
    }

    /**
     * Calculate dividend earnings after withdrawals
     * @param {number} totalInvestment - Total investment amount
     * @param {Date} startDate - Start date of investment
     * @param {number} totalWithdrawals - Total amount withdrawn
     * @param {Date} currentDate - Current date (optional)
     * @returns {Object} Dividend calculation
     */
    static calculateDividends(totalInvestment, startDate, totalWithdrawals, currentDate = new Date()) {
        const returns = this.calculateReturns(totalInvestment, startDate, currentDate);

        // Calculate remaining dividend after withdrawals
        const dividendEarnings = returns.totalReturns - totalWithdrawals > 0
            ? returns.totalReturns - totalWithdrawals
            : 0;

        return {
            ...returns,
            totalWithdrawals,
            dividendEarnings,
        };
    }

    /**
     * Get earliest investment date from investments array
     * @param {Array} investments - Array of investment records
     * @returns {Date|null} Earliest investment date or null if no investments
     */
    static getEarliestInvestmentDate(investments) {
        if (!investments || investments.length === 0) {
            return null;
        }

        const successfulInvestments = investments.filter(inv => inv.status === 'success');

        if (successfulInvestments.length === 0) {
            return null;
        }

        const dates = successfulInvestments.map(inv => new Date(inv.date));
        return new Date(Math.min(...dates));
    }

    /**
     * Calculate total amount from transactions by status
     * @param {Array} transactions - Array of transactions
     * @param {string} status - Status filter (optional)
     * @returns {number} Total amount
     */
    static calculateTotalAmount(transactions, status = null) {
        if (!transactions || transactions.length === 0) {
            return 0;
        }

        return transactions
            .filter(tx => !status || tx.status === status)
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    }
}

module.exports = ReturnCalculationService;
