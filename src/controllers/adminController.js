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
}

module.exports = new AdminController();
