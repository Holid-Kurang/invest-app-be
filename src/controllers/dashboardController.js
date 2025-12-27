const prisma = require('../config/database');
const { STATUS } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');
const ReturnCalculationService = require('../services/returnCalculationService');
const TransactionFormatterService = require('../services/transactionFormatterService');

class DashboardController {
    /**
     * Get investor dashboard data
     */
    async getInvestorDashboard(req, res) {
        try {
            const userId = req.user.id_user;

            // Fetch data from database
            const [invests, withdrawals] = await Promise.all([
                prisma.invest.findMany({
                    where: { id_user: userId },
                    orderBy: { date: 'desc' }
                }),
                prisma.withdrawal.findMany({
                    where: { id_user: userId },
                    orderBy: { date: 'desc' }
                })
            ]);

            // Calculate statistics
            const totalInvestment = ReturnCalculationService.calculateTotalAmount(
                invests,
                STATUS.SUCCESS
            );

            const totalWithdrawals = ReturnCalculationService.calculateTotalAmount(
                withdrawals,
                STATUS.SUCCESS
            );

            const startDate = ReturnCalculationService.getEarliestInvestmentDate(invests);

            let statistics;
            if (!startDate) {
                statistics = {
                    totalInvestment: 0,
                    annualReturn: 0,
                    dailyReturn: 0,
                    totalReturns: 0,
                    dividendEarnings: 0,
                    totalDays: 0,
                    totalWithdrawals: 0
                };
            } else {
                const dividendData = ReturnCalculationService.calculateDividends(
                    totalInvestment,
                    startDate,
                    totalWithdrawals
                );

                statistics = {
                    totalInvestment,
                    annualReturn: dividendData.annualReturn,
                    dailyReturn: dividendData.dailyReturn,
                    totalReturns: dividendData.totalReturns,
                    dividendEarnings: dividendData.dividendEarnings,
                    totalDays: dividendData.totalDays,
                    totalWithdrawals
                };
            }

            // Format transactions
            const formattedInvests = invests.map(invest => ({
                date: invest.date,
                type: 'Investment',
                amount: parseFloat(invest.amount),
                status: TransactionFormatterService.formatInvestment(invest).status,
                id: invest.id_invest,
                originalType: 'invest',
                proof: invest.proof || null
            }));

            const formattedWithdrawals = withdrawals.map(withdrawal => ({
                date: withdrawal.date,
                type: 'Withdrawal',
                amount: parseFloat(withdrawal.amount),
                status: TransactionFormatterService.formatWithdrawal(withdrawal).status,
                id: withdrawal.id,
                originalType: 'withdrawal',
                proof: withdrawal.proof || null
            }));

            // Merge and sort all transactions
            const allTransactions = [...formattedInvests, ...formattedWithdrawals]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            // Get 10 most recent transactions
            const recentTransactions = allTransactions.slice(0, 10);

            return ResponseFormatter.success(res, {
                statistics,
                transactions: recentTransactions,
                allTransactions
            });

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    // Mendapatkan data dashboard admin
    /**
     * Get admin dashboard data
     */
    async getAdminDashboard(req, res) {
        try {
            const [invests, withdrawals] = await Promise.all([
                prisma.invest.findMany({
                    include: {
                        user: {
                            select: { id_user: true, name: true, email: true }
                        }
                    },
                    orderBy: { date: 'desc' }
                }),
                prisma.withdrawal.findMany({
                    include: {
                        user: {
                            select: { id_user: true, name: true, email: true }
                        }
                    },
                    orderBy: { date: 'desc' }
                })
            ]);

            // Calculate total investment funds
            const totalInvestmentFunds = invests
                .filter(inv => inv.status === STATUS.SUCCESS)
                .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

            // Calculate total unique investors
            const uniqueInvestors = new Set(invests.map(inv => inv.id_user));
            const totalInvestor = uniqueInvestors.size;

            // Calculate total dividends paid
            const dividend = withdrawals
                .filter(wd => wd.status === STATUS.SUCCESS)
                .reduce((sum, wd) => sum + parseFloat(wd.amount), 0);

            // Format and merge transactions
            const formattedInvests = invests.map(invest => ({
                ...TransactionFormatterService.formatInvestment(invest),
                id_user: invest.user.id_user,
                originalType: 'invest'
            }));

            const formattedWithdrawals = withdrawals.map(withdrawal => ({
                ...TransactionFormatterService.formatWithdrawal(withdrawal),
                id_user: withdrawal.user.id_user,
                originalType: 'withdrawal'
            }));

            // Merge, sort, and get 10 most recent
            const allTransactions = [...formattedInvests, ...formattedWithdrawals]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            const recentTransactions = allTransactions.slice(0, 10);

            return ResponseFormatter.success(res, {
                totalInvestmentFunds,
                totalInvestor,
                dividend,
                transactions: recentTransactions
            });

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }
}

module.exports = new DashboardController();
