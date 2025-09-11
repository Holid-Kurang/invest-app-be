const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminController {

    // Get all users (admin only)
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

            res.status(200).json({
                success: true,
                data: users
            });

        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Create new investor (admin only)
    async createInvestor(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email dan password diperlukan'
                });
            }

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar'
                });
            }

            // Create new investor
            const hashedPassword = await bcrypt.hash(password, 10);

            const newInvestor = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'investor'
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

            res.status(201).json({
                success: true,
                data: newInvestor,
                message: 'Investor berhasil dibuat'
            });

        } catch (error) {
            console.error('Create investor error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Update investor (admin only)
    async updateInvestor(req, res) {
        try {
            const { id } = req.params;
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name dan email diperlukan'
                });
            }

            // Check if investor exists
            const existingInvestor = await prisma.user.findFirst({
                where: {
                    id_user: parseInt(id),
                    role: 'investor'
                }
            });

            if (!existingInvestor) {
                return res.status(404).json({
                    success: false,
                    message: 'Investor tidak ditemukan'
                });
            }

            // Check if email is taken by another user
            const emailTaken = await prisma.user.findFirst({
                where: {
                    email,
                    id_user: { not: parseInt(id) }
                }
            });

            if (emailTaken) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah digunakan oleh user lain'
                });
            }

            // Update data
            const updateData = { name, email };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
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

            res.status(200).json({
                success: true,
                data: updatedInvestor,
                message: 'Investor berhasil diupdate'
            });

        } catch (error) {
            console.error('Update investor error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Delete investor (admin only)
    async deleteInvestor(req, res) {
        try {
            const { id } = req.params;

            // Check if investor exists
            const existingInvestor = await prisma.user.findFirst({
                where: {
                    id_user: parseInt(id),
                    role: 'investor'
                }
            });

            if (!existingInvestor) {
                return res.status(404).json({
                    success: false,
                    message: 'Investor tidak ditemukan'
                });
            }

            // Check if investor has related data (investments, withdrawals)
            const [investmentCount, withdrawalCount] = await Promise.all([
                prisma.invest.count({ where: { id_user: parseInt(id) } }),
                prisma.withdrawal.count({ where: { id_user: parseInt(id) } })
            ]);

            if (investmentCount > 0 || withdrawalCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak dapat menghapus investor yang memiliki data investasi atau withdrawal'
                });
            }

            // Delete investor
            await prisma.user.delete({
                where: { id_user: parseInt(id) }
            });

            res.status(200).json({
                success: true,
                message: 'Investor berhasil dihapus'
            });

        } catch (error) {
            console.error('Delete investor error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Get investor details with investment history (admin only)
    async getInvestorDetails(req, res) {
        try {
            const { id } = req.params;

            // Get investor info
            const investor = await prisma.user.findFirst({
                where: {
                    id_user: parseInt(id),
                    role: 'investor'
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
                return res.status(404).json({
                    success: false,
                    message: 'Investor tidak ditemukan'
                });
            }

            // Get investor's investment and withdrawal history
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

            // Hitung total investasi yang berhasil
            const totalInvestment = investments
                .filter(invest => invest.status === 'success')
                .reduce((sum, invest) => sum + parseFloat(invest.amount), 0);

            // Hitung return-related statistics
            const annualReturn = totalInvestment * 0.12;
            const dailyReturn = annualReturn / 365;

            // Hitung total hari investasi
            const firstInvestment = investments
                .filter(invest => invest.status === 'success')
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            let totalDays = 0;
            if (firstInvestment) {
                const startDate = new Date(firstInvestment.date);
                const currentDate = new Date();
                totalDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
            }

            // Hitung total withdrawal yang berhasil
            const totalWithdrawals = withdrawals
                .filter(withdrawal => withdrawal.status === 'success')
                .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0);

            const totalReturns = dailyReturn * totalDays;
            const dividendEarnings = totalReturns - totalWithdrawals > 0 ? totalReturns - totalWithdrawals : 0;

            // Format transaction history
            const transactionHistory = [
                ...investments.map(inv => ({
                    id: inv.id_invest,
                    date: inv.date,
                    type: 'Investment',
                    amount: parseFloat(inv.amount),
                    status: inv.status === 'success' ? 'Successful' :
                        inv.status === 'pending' ? 'Pending' : 'Rejected',
                    proof: inv.proof
                })),
                ...withdrawals.map(wd => ({
                    id: wd.id,
                    date: wd.date,
                    type: 'Withdrawal',
                    amount: parseFloat(wd.amount),
                    status: wd.status === 'success' ? 'Successful' :
                        wd.status === 'pending' ? 'Pending' : 'Rejected',
                    proof: null
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            const investorDetails = {
                investor,
                statistics: {
                    totalInvestment,
                    annualReturn,
                    dailyReturn,
                    totalWithdrawals,
                    totalReturns,
                    dividendEarnings,
                    totalDays
                },
                transactionHistory
            };

            res.status(200).json({
                success: true,
                data: investorDetails
            });

        } catch (error) {
            console.error('Get investor details error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Get all transactions history (admin only)
    async getAllTransactions(req, res) {
        try {
            // Ambil semua data dari database dengan informasi user
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

            // Gabungkan semua transaksi
            const allTransactions = [
                // Investasi
                ...invests.map(invest => ({
                    id: invest.id_invest,
                    date: invest.date,
                    type: 'Investment',
                    amount: parseFloat(invest.amount),
                    status: invest.status === 'success' ? 'Successful' :
                        invest.status === 'pending' ? 'Pending' : 'Rejected',
                    investor: invest.user.name,
                    investor_email: invest.user.email,
                    id_user: invest.user.id_user,
                    originalType: 'invest',
                    proof: invest.proof || null
                })),

                // Withdrawals
                ...withdrawals.map(withdrawal => ({
                    id: withdrawal.id,
                    date: withdrawal.date,
                    type: 'Withdrawal',
                    amount: parseFloat(withdrawal.amount),
                    status: withdrawal.status === 'success' ? 'Successful' :
                        withdrawal.status === 'pending' ? 'Pending' : 'Rejected',
                    investor: withdrawal.user.name,
                    investor_email: withdrawal.user.email,
                    id_user: withdrawal.user.id_user,
                    originalType: 'withdrawal',
                    proof: null
                }))
            ];

            // Urutkan berdasarkan tanggal terbaru
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Dividen = total withdrawal yang sukses oleh admin ke semua user
            // (untuk sementara tidak dihitung karena tidak ada fitur dividen di aplikasi)
            // const totalDividends = allTransactions
            //     .filter(tx => tx.type === 'Withdrawal' && tx.status === 'Successful')
            //     .reduce((sum, tx) => sum + tx.amount, 0);
            // total Investor = jumlah user dengan role investor
            // const totalInvestors = await prisma.user.count({ where: { role: 'investor' } });
            // Total Investasi = total investasi yang sukses oleh semua user
            // const totalInvestments = allTransactions
            //     .filter(tx => tx.type === 'Investment' && tx.status === 'Successful')
            //     .reduce((sum, tx) => sum + tx.amount, 0);
            res.status(200).json({
                success: true,
                data: allTransactions
            });

        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Get admin dashboard statistics
    async getDashboardStats(req, res) {
        try {
            // Ambil statistik dari database
            const [totalInvestors, allInvestments, allWithdrawals, recentInvests, recentWithdrawals] = await Promise.all([
                // Total Investor
                prisma.user.count({ where: { role: 'investor' } }),

                // Semua investasi untuk statistik
                prisma.invest.findMany({
                    select: {
                        amount: true,
                        status: true
                    }
                }),

                // Semua withdrawal untuk statistik
                prisma.withdrawal.findMany({
                    select: {
                        amount: true,
                        status: true
                    }
                }),

                // Investasi terbaru untuk transaksi
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
                    orderBy: { date: 'desc' },
                    take: 10
                }),

                // Withdrawal terbaru untuk transaksi
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
                    orderBy: { date: 'desc' },
                    take: 10
                })
            ]);

            // Hitung Total Investment Funds (investasi yang sukses)
            const totalInvestmentFunds = allInvestments
                .filter(investment => investment.status === 'success')
                .reduce((sum, investment) => sum + parseFloat(investment.amount), 0);

            // Hitung Total Dividen (withdrawal yang sukses)
            const totalDividend = allWithdrawals
                .filter(withdrawal => withdrawal.status === 'success')
                .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0);

            // Gabungkan transaksi terbaru
            const allRecentTransactions = [
                // Format investasi
                ...recentInvests.map(invest => ({
                    id: invest.id_invest,
                    date: invest.date,
                    type: 'Investment',
                    amount: parseFloat(invest.amount),
                    status: invest.status === 'success' ? 'Successful' :
                        invest.status === 'pending' ? 'Pending' : 'Rejected',
                    investor: invest.user.name,
                    investor_email: invest.user.email,
                    id_user: invest.user.id_user
                })),

                // Format withdrawal
                ...recentWithdrawals.map(withdrawal => ({
                    id: withdrawal.id,
                    date: withdrawal.date,
                    type: 'Withdrawal',
                    amount: parseFloat(withdrawal.amount),
                    status: withdrawal.status === 'success' ? 'Successful' :
                        withdrawal.status === 'pending' ? 'Pending' : 'Rejected',
                    investor: withdrawal.user.name,
                    investor_email: withdrawal.user.email,
                    id_user: withdrawal.user.id_user
                }))
            ];

            // Urutkan berdasarkan tanggal terbaru dan ambil 10 transaksi teratas
            const recentTransactions = allRecentTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            const dashboardStats = {
                totalInvestors,
                totalInvestmentFunds,
                totalDividend,
                transactions: recentTransactions
            };

            res.status(200).json({
                success: true,
                data: dashboardStats
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
}

module.exports = new AdminController();
