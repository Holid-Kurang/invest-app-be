const prisma = require('../config/database');

class DashboardController {
    // Mendapatkan data dashboard investor
    async getInvestorDashboard(req, res) {
        try {
            const userId = req.user.id_user;

            // Ambil semua data dari database
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

            // Hitung total investasi yang berhasil
            const totalInvestment = invests
                .filter(invest => invest.status === 'success')
                .reduce((sum, invest) => sum + parseFloat(invest.amount), 0);

            // Hitung return-related statistics
            const annualReturn = totalInvestment * 0.12;
            const dailyReturn = annualReturn / 365;

            // Hitung total hari investasi
            const firstInvestment = invests
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

            // Gabungkan semua transaksi
            const allTransactions = [
                // Investasi
                ...invests.map(invest => ({
                    date: invest.date,
                    type: 'Investment',
                    amount: parseFloat(invest.amount),
                    status: invest.status === 'success' ? 'Successful' :
                        invest.status === 'pending' ? 'Pending' : 'Rejected',
                    id: invest.id_invest,
                    originalType: 'invest',
                    proof: invest.proof || null
                })),

                // Withdrawals
                ...withdrawals.map(withdrawal => ({
                    date: withdrawal.date,
                    type: 'Withdrawal',
                    amount: parseFloat(withdrawal.amount),
                    status: withdrawal.status === 'success' ? 'Successful' :
                        withdrawal.status === 'pending' ? 'Pending' : 'Rejected',
                    id: withdrawal.id,
                    originalType: 'withdrawal',
                    proof: withdrawal.proof || null
                }))
            ];

            // Urutkan berdasarkan tanggal terbaru
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Ambil 10 transaksi terbaru
            const recentTransactions = allTransactions.slice(0, 10);

            res.status(200).json({
                success: true,
                data: {
                    statistics: {
                        totalInvestment,
                        annualReturn,
                        dailyReturn,
                        totalReturns,
                        dividendEarnings,
                        totalDays
                    },
                    transactions: recentTransactions,
                    allTransactions
                }
            });

        } catch (error) {
            console.error('Get investor dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Mendapatkan data dashboard admin
    async getAdminDashboard(req, res) {
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
            // Hitung total dana investasi yang berhasil
            const totalInvestmentFunds = invests
                .filter(invest => invest.status === 'success')
                .reduce((sum, invest) => sum + parseFloat(invest.amount), 0);

            // Hitung total investor unik
            const uniqueInvestors = new Set(invests.map(invest => invest.id_user));
            const totalInvestor = uniqueInvestors.size;

            // Hitung total dividend yang sudah dibayarkan
            const dividend = withdrawals
                .filter(withdrawal => withdrawal.status === 'success')
                .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0);

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
                    proof: withdrawal.proof || null
                }))
            ];

            // Urutkan berdasarkan tanggal terbaru
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Ambil 10 transaksi terbaru
            const recentTransactions = allTransactions.slice(0, 10);

            res.status(200).json({
                success: true,
                data: {
                    totalInvestmentFunds,
                    totalInvestor,
                    dividend,
                    transactions: recentTransactions
                }
            });

        } catch (error) {
            console.error('Get admin dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
}

module.exports = new DashboardController();
