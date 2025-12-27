const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { ROLE, STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, BUSINESS } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');
const ReturnCalculationService = require('../services/returnCalculationService');
const TransactionFormatterService = require('../services/transactionFormatterService');

class AdminController {

    /**
     * Get all users (admin only)
     */
    async getAllUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id_user: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: { role: 'desc' }
            });

            return ResponseFormatter.success(res, users);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Create new investor (admin only)
     */
    async createInvestor(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email || !password) {
                return ErrorHandler.validationError(
                    res,
                    'Name, email dan password diperlukan'
                );
            }

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return ErrorHandler.validationError(
                    res,
                    ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
                );
            }

            // Create new investor
            const hashedPassword = await bcrypt.hash(password, BUSINESS.BCRYPT_SALT_ROUNDS);

            const newInvestor = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: ROLE.INVESTOR
                },
                select: {
                    id_user: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true
                }
            });

            return ResponseFormatter.created(
                res,
                newInvestor,
                SUCCESS_MESSAGES.USER_CREATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Update investor (admin only)
     */
    async updateInvestor(req, res) {
        try {
            const { id } = req.params;
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email) {
                return ErrorHandler.validationError(
                    res,
                    'Name dan email diperlukan'
                );
            }

            // Check if investor exists
            const existingInvestor = await prisma.user.findFirst({
                where: {
                    id_user: parseInt(id),
                    role: ROLE.INVESTOR
                }
            });

            if (!existingInvestor) {
                return ErrorHandler.notFoundError(res, ERROR_MESSAGES.INVESTOR_NOT_FOUND);
            }

            // Check if email is taken by another user
            const emailTaken = await prisma.user.findFirst({
                where: {
                    email,
                    id_user: { not: parseInt(id) }
                }
            });

            if (emailTaken) {
                return ErrorHandler.validationError(
                    res,
                    'Email sudah digunakan oleh user lain'
                );
            }

            // Update data
            const updateData = { name, email };

            if (password) {
                updateData.password = await bcrypt.hash(password, BUSINESS.BCRYPT_SALT_ROUNDS);
            }

            const updatedInvestor = await prisma.user.update({
                where: { id_user: parseInt(id) },
                data: updateData,
                select: {
                    id_user: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true
                }
            });

            return ResponseFormatter.success(
                res,
                updatedInvestor,
                SUCCESS_MESSAGES.USER_UPDATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Delete investor (admin only)
     */
    async deleteInvestor(req, res) {
        try {
            const { id } = req.params;

            // Check if investor exists
            const existingInvestor = await prisma.user.findFirst({
                where: {
                    id_user: parseInt(id),
                    role: ROLE.INVESTOR
                }
            });

            if (!existingInvestor) {
                return ErrorHandler.notFoundError(res, ERROR_MESSAGES.INVESTOR_NOT_FOUND);
            }

            // Check if investor has related data (investments, withdrawals)
            const [investmentCount, withdrawalCount] = await Promise.all([
                prisma.invest.count({ where: { id_user: parseInt(id) } }),
                prisma.withdrawal.count({ where: { id_user: parseInt(id) } })
            ]);

            if (investmentCount > 0 || withdrawalCount > 0) {
                return ErrorHandler.validationError(
                    res,
                    ERROR_MESSAGES.INVESTOR_HAS_TRANSACTIONS
                );
            }

            // Delete investor
            await prisma.user.delete({
                where: { id_user: parseInt(id) }
            });

            return ResponseFormatter.success(
                res,
                null,
                SUCCESS_MESSAGES.INVESTOR_DELETED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Fetch investor data by ID
     */
    async fetchInvestorData(id) {
        const investor = await prisma.user.findFirst({
            where: {
                id_user: parseInt(id),
                role: ROLE.INVESTOR
            },
            select: {
                id_user: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            }
        });

        if (!investor) {
            return null;
        }

        const [investments, withdrawals] = await Promise.all([
            prisma.invest.findMany({
                where: { id_user: parseInt(id) },
                orderBy: { date: 'desc' }
            }),
            prisma.withdrawal.findMany({
                where: { id_user: parseInt(id) },
                orderBy: { date: 'desc' }
            })
        ]);

        return { investor, investments, withdrawals };
    }

    /**
     * Calculate investor statistics
     */
    calculateInvestorStatistics(investments, withdrawals) {
        const totalInvestment = ReturnCalculationService.calculateTotalAmount(
            investments,
            STATUS.SUCCESS
        );

        const totalWithdrawals = ReturnCalculationService.calculateTotalAmount(
            withdrawals,
            STATUS.SUCCESS
        );

        const startDate = ReturnCalculationService.getEarliestInvestmentDate(investments);

        if (!startDate) {
            return {
                totalInvestment: 0,
                annualReturn: 0,
                dailyReturn: 0,
                totalWithdrawals: 0,
                totalReturns: 0,
                dividendEarnings: 0,
                totalDays: 0
            };
        }

        const dividendData = ReturnCalculationService.calculateDividends(
            totalInvestment,
            startDate,
            totalWithdrawals
        );

        return {
            totalInvestment,
            annualReturn: dividendData.annualReturn,
            dailyReturn: dividendData.dailyReturn,
            totalWithdrawals,
            totalReturns: dividendData.totalReturns,
            dividendEarnings: dividendData.dividendEarnings,
            totalDays: dividendData.totalDays
        };
    }

    /**
     * Get investor details with transactions and statistics
     */
    async getInvestorDetails(req, res) {
        try {
            const { id } = req.params;

            // Fetch investor data
            const data = await this.fetchInvestorData(id);
            if (!data) {
                return ErrorHandler.notFoundError(res, ERROR_MESSAGES.INVESTOR_NOT_FOUND);
            }

            const { investor, investments, withdrawals } = data;

            // Calculate statistics
            const statistics = this.calculateInvestorStatistics(investments, withdrawals);

            // Format transaction history
            const transactionHistory = TransactionFormatterService.mergeAndSortTransactions(
                investments,
                withdrawals
            );

            const investorDetails = {
                investor,
                statistics,
                transactionHistory
            };

            return ResponseFormatter.success(res, investorDetails);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Get all transactions history (admin only)
     */
    async getAllTransactions(req, res) {
        try {
            const [invests, withdrawals] = await Promise.all([
                prisma.invest.findMany({
                    include: {
                        user: {
                            select: {
                                id_user: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { date: 'desc' }
                }),
                prisma.withdrawal.findMany({
                    include: {
                        user: {
                            select: {
                                id_user: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { date: 'desc' }
                })
            ]);

            // Format investments with additional fields
            const formattedInvests = invests.map(invest => ({
                ...TransactionFormatterService.formatInvestment(invest),
                id_user: invest.user.id_user,
                originalType: 'invest'
            }));

            // Format withdrawals with additional fields
            const formattedWithdrawals = withdrawals.map(withdrawal => ({
                ...TransactionFormatterService.formatWithdrawal(withdrawal),
                id_user: withdrawal.user.id_user,
                originalType: 'withdrawal'
            }));

            // Merge and sort transactions
            const allTransactions = [...formattedInvests, ...formattedWithdrawals]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            return ResponseFormatter.success(res, allTransactions);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Calculate dashboard statistics
     */
    calculateDashboardStatistics(allInvestments, allWithdrawals) {
        const totalInvestmentFunds = allInvestments
            .filter(inv => inv.status === STATUS.SUCCESS)
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        const totalDividend = allWithdrawals
            .filter(wd => wd.status === STATUS.SUCCESS)
            .reduce((sum, wd) => sum + parseFloat(wd.amount), 0);

        return { totalInvestmentFunds, totalDividend };
    }

    /**
     * Get admin dashboard statistics
     */
    async getDashboardStats(req, res) {
        try {
            const [
                totalInvestors,
                allInvestments,
                allWithdrawals,
                recentInvests,
                recentWithdrawals
            ] = await Promise.all([
                prisma.user.count({ where: { role: ROLE.INVESTOR } }),
                prisma.invest.findMany({
                    select: { amount: true, status: true }
                }),
                prisma.withdrawal.findMany({
                    select: { amount: true, status: true }
                }),
                prisma.invest.findMany({
                    include: {
                        user: {
                            select: { id_user: true, name: true, email: true }
                        }
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                }),
                prisma.withdrawal.findMany({
                    include: {
                        user: {
                            select: { id_user: true, name: true, email: true }
                        }
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                })
            ]);

            // Calculate statistics
            const { totalInvestmentFunds, totalDividend } = this.calculateDashboardStatistics(
                allInvestments,
                allWithdrawals
            );

            // Format recent transactions
            const formattedInvests = recentInvests.map(invest => ({
                ...TransactionFormatterService.formatInvestment(invest),
                id_user: invest.user.id_user
            }));

            const formattedWithdrawals = recentWithdrawals.map(withdrawal => ({
                ...TransactionFormatterService.formatWithdrawal(withdrawal),
                id_user: withdrawal.user.id_user
            }));

            // Merge, sort, and limit to 10 most recent
            const recentTransactions = [...formattedInvests, ...formattedWithdrawals]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            const dashboardStats = {
                totalInvestors,
                totalInvestmentFunds,
                totalDividend,
                transactions: recentTransactions
            };

            return ResponseFormatter.success(res, dashboardStats);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }
}

module.exports = new AdminController();
