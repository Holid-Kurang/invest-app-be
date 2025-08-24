const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminController {

    // Get all investors (admin only)
    async getAllInvestors(req, res) {
        try {
            const investors = await prisma.user.findMany({
                where: { role: 'investor' },
                select: {
                    id_user: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: { created_at: 'desc' }
            });

            res.status(200).json({
                success: true,
                data: investors
            });

        } catch (error) {
            console.error('Get all investors error:', error);
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
}

module.exports = new AdminController();
