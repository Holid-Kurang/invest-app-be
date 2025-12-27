const { TRANSACTION_TYPE, STATUS } = require('../config/constants');
const StatusFormatter = require('../utils/statusFormatter');

/**
 * Service for formatting and transforming transaction data
 */
class TransactionFormatterService {
    /**
     * Format investment record to transaction format
     * @param {Object} invest - Investment record from database
     * @returns {Object} Formatted transaction
     */
    static formatInvestment(invest) {
        return {
            id: invest.id_invest,
            date: invest.date,
            type: TRANSACTION_TYPE.INVESTMENT,
            amount: parseFloat(invest.amount),
            proof: invest.proof,
            status: StatusFormatter.formatStatus(invest.status),
            investor: invest.user?.name || 'Unknown',
            investorEmail: invest.user?.email || null,
        };
    }

    /**
     * Format withdrawal record to transaction format
     * @param {Object} withdrawal - Withdrawal record from database
     * @returns {Object} Formatted transaction
     */
    static formatWithdrawal(withdrawal) {
        return {
            id: withdrawal.id,
            date: withdrawal.date,
            type: TRANSACTION_TYPE.WITHDRAWAL,
            amount: parseFloat(withdrawal.amount),
            proof: withdrawal.proof,
            status: StatusFormatter.formatStatus(withdrawal.status),
            investor: withdrawal.user?.name || 'Unknown',
            investorEmail: withdrawal.user?.email || null,
        };
    }

    /**
     * Format multiple investments
     * @param {Array} investments - Array of investment records
     * @returns {Array} Array of formatted transactions
     */
    static formatInvestments(investments) {
        if (!investments || investments.length === 0) {
            return [];
        }
        return investments.map(invest => this.formatInvestment(invest));
    }

    /**
     * Format multiple withdrawals
     * @param {Array} withdrawals - Array of withdrawal records
     * @returns {Array} Array of formatted transactions
     */
    static formatWithdrawals(withdrawals) {
        if (!withdrawals || withdrawals.length === 0) {
            return [];
        }
        return withdrawals.map(withdrawal => this.formatWithdrawal(withdrawal));
    }

    /**
     * Merge and sort investments and withdrawals into single transaction list
     * @param {Array} investments - Array of investment records
     * @param {Array} withdrawals - Array of withdrawal records
     * @returns {Array} Merged and sorted transactions
     */
    static mergeAndSortTransactions(investments, withdrawals) {
        const formattedInvestments = this.formatInvestments(investments);
        const formattedWithdrawals = this.formatWithdrawals(withdrawals);

        const allTransactions = [...formattedInvestments, ...formattedWithdrawals];

        // Sort by date descending (newest first)
        return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Filter transactions by status
     * @param {Array} transactions - Array of transactions
     * @param {string} status - Status to filter by
     * @returns {Array} Filtered transactions
     */
    static filterByStatus(transactions, status) {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        const formattedStatus = StatusFormatter.formatStatus(status);
        return transactions.filter(tx => tx.status === formattedStatus);
    }

    /**
     * Group transactions by type
     * @param {Array} transactions - Array of transactions
     * @returns {Object} Transactions grouped by type
     */
    static groupByType(transactions) {
        if (!transactions || transactions.length === 0) {
            return {
                investments: [],
                withdrawals: [],
            };
        }

        return {
            investments: transactions.filter(tx => tx.type === TRANSACTION_TYPE.INVESTMENT),
            withdrawals: transactions.filter(tx => tx.type === TRANSACTION_TYPE.WITHDRAWAL),
        };
    }

    /**
     * Calculate transaction statistics
     * @param {Array} transactions - Array of transactions
     * @returns {Object} Transaction statistics
     */
    static calculateStatistics(transactions) {
        if (!transactions || transactions.length === 0) {
            return {
                total: 0,
                successful: 0,
                pending: 0,
                rejected: 0,
                totalAmount: 0,
                successfulAmount: 0,
            };
        }

        const successful = this.filterByStatus(transactions, STATUS.SUCCESS);
        const pending = this.filterByStatus(transactions, STATUS.PENDING);
        const rejected = this.filterByStatus(transactions, STATUS.REJECTED);

        return {
            total: transactions.length,
            successful: successful.length,
            pending: pending.length,
            rejected: rejected.length,
            totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
            successfulAmount: successful.reduce((sum, tx) => sum + tx.amount, 0),
        };
    }
}

module.exports = TransactionFormatterService;
