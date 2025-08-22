const prisma = require('../config/database');

class DashboardController {
    // Mendapatkan data dashboard investor
    async getInvestorDashboard(req, res) {
        try {
            const userId = req.user.id_user;

            // Ambil semua data investasi
            const invests = await prisma.invest.findMany({
                where: { id_user: userId },
                orderBy: { date: 'desc' }
            });

            // Ambil semua data return
            const returns = await prisma.return.findMany({
                where: { id_user: userId },
                orderBy: { request_at: 'desc' }
            });

            // Ambil semua data withdrawal
            const withdrawals = await prisma.withdrawal.findMany({
                where: { id_user: userId },
                orderBy: { date: 'desc' }
            });

            // Hitung statistik
            const totalInvestment = invests
                .filter(invest => invest.status === 'success')
                .reduce((sum, invest) => sum + parseFloat(invest.amount), 0);

            const totalReturns = returns
                .filter(returnItem => returnItem.status === 'succes')
                .reduce((sum, returnItem) => sum + parseFloat(returnItem.amount), 0);

            const totalWithdrawals = withdrawals
                .filter(withdrawal => withdrawal.status === 'success')
                .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0);

            // Hitung return tahunan (asumsi 12% dari total investasi)
            const annualReturn = totalInvestment * 0.12;

            // Hitung return harian (return tahunan / 365)
            const dailyReturn = annualReturn / 365;

            // Hitung dividend earnings (sama dengan total returns untuk sementara)
            const dividendEarnings = totalReturns;

            // Gabungkan semua transaksi untuk tabel
            const allTransactions = [];

            // Tambahkan investasi
            invests.forEach(invest => {
                allTransactions.push({
                    date: invest.date,
                    type: 'Investment',
                    amount: parseFloat(invest.amount),
                    status: invest.status === 'success' ? 'Successful' : invest.status === 'pending' ? 'Pending' : 'Rejected',
                    id: invest.id_invest,
                    originalType: 'invest'
                });
            });

            // Tambahkan returns
            returns.forEach(returnItem => {
                allTransactions.push({
                    date: returnItem.request_at,
                    type: 'Return',
                    amount: parseFloat(returnItem.amount),
                    status: returnItem.status === 'succes' ? 'Successful' : 'Pending',
                    id: returnItem.id_return,
                    originalType: 'return'
                });
            });

            // Tambahkan withdrawals
            withdrawals.forEach(withdrawal => {
                allTransactions.push({
                    date: withdrawal.date,
                    type: 'Withdrawal',
                    amount: parseFloat(withdrawal.amount),
                    status: withdrawal.status === 'success' ? 'Successful' : withdrawal.status === 'pending' ? 'Pending' : 'Rejected',
                    id: withdrawal.id,
                    originalType: 'withdrawal'
                });
            });

            // Urutkan transaksi berdasarkan tanggal terbaru
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Ambil 10 transaksi terbaru untuk tabel
            const recentTransactions = allTransactions.slice(0, 10);

            res.status(200).json({
                success: true,
                data: {
                    statistics: {
                        totalInvestment,
                        annualReturn,
                        dailyReturn,
                        totalReturns,
                        dividendEarnings
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
}

module.exports = new DashboardController();
