const prisma = require('../config/database');
const emailService = require('../services/emailService');
const cloudinary = require('../services/cloudService');

class WithdrawalController {
    // Membuat withdrawal baru
    async createWithdrawal(req, res) {
        try {
            const { amount } = req.body;
            const userId = req.user.id_user;
            let userEmail = req.user.email;

            // Jika email tidak ada di JWT, ambil dari database
            if (!userEmail) {
                const user = await prisma.user.findUnique({
                    where: { id_user: userId },
                    select: { email: true }
                });
                userEmail = user?.email;
            }

            // Validasi email
            if (!userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email user tidak ditemukan'
                });
            }

            // Validasi input
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount harus diisi'
                });
            }

            // Validasi amount harus positif
            if (parseFloat(amount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount harus lebih dari 0'
                });
            }


            // Validasi amount tidak kurang dari 100000
            if (parseFloat(amount) < 100000) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount tidak boleh kurang dari 100,000'
                });
            }

            // Validasi amount tidak lebih dari 10000000000
            if (parseFloat(amount) >= 10000000000) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount tidak boleh melebihi 10,000,000,000'
                });
            }

            const newWithdrawal = await prisma.withdrawal.create({
                data: {
                    id_user: userId,
                    amount: parseFloat(amount),
                    status: 'pending'
                }
            });

            const type = 'Withdrawal';
            const id_withdrawal = newWithdrawal.id;
            await emailService.sendTransactionNotificationToAdmin(
                id_withdrawal,
                newWithdrawal,
                userEmail,
                type,
            );

            res.status(201).json({
                success: true,
                message: 'Withdrawal berhasil dibuat dan menunggu persetujuan admin',
            });

        } catch (error) {
            console.error('Create withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Mendapatkan semua withdrawal user
    async getUserWithdrawals(req, res) {
        try {
            const userId = req.user.id_user;

            const withdrawals = await prisma.withdrawal.findMany({
                where: { id_user: userId },
                orderBy: { date: 'desc' }
            });

            res.status(200).json({
                success: true,
                data: withdrawals
            });

        } catch (error) {
            console.error('Get user withdrawals error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Update status withdrawal (untuk admin)
    async updateWithdrawalStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validasi status
            if (!['pending', 'success', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status tidak valid'
                });
            }

            const updatedWithdrawal = await prisma.withdrawal.update({
                where: { id: parseInt(id) },
                data: { status }
            });

            res.status(200).json({
                success: true,
                message: 'Status withdrawal berhasil diupdate',
                data: updatedWithdrawal
            });

        } catch (error) {
            console.error('Update withdrawal status error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Mendapatkan semua withdrawal untuk admin
    async getAllWithdrawals(req, res) {
        try {
            const withdrawals = await prisma.withdrawal.findMany({
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
            });

            // Format data untuk response
            const formattedWithdrawals = withdrawals.map(withdrawal => ({
                id: withdrawal.id,
                date: withdrawal.date,
                amount: parseFloat(withdrawal.amount),
                status: withdrawal.status,
                proof: withdrawal.proof,
                investor: withdrawal.user.name,
                investor_email: withdrawal.user.email,
                id_user: withdrawal.user.id_user
            }));

            res.status(200).json({
                success: true,
                data: formattedWithdrawals
            });

        } catch (error) {
            console.error('Get all withdrawals error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Menghapus withdrawal (untuk admin)
    async deleteWithdrawal(req, res) {
        try {
            const { id } = req.params;
            const deletedWithdrawal = await prisma.withdrawal.delete({
                where: { id: parseInt(id) }
            });
            res.status(200).json({
                success: true,
                message: 'Withdrawal berhasil dihapus',
                data: deletedWithdrawal
            });
        } catch (error) {
            console.error('Delete withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Upload proof untuk withdrawal (untuk admin)
    async uploadProof(req, res) {
        try {
            const { id } = req.params;

            // Upload file ke Cloudinary
            let proofUrl = null;
            if (req.file) {
                try {
                    const uploadResult = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                resource_type: 'image',
                                folder: 'withdrawal-proofs',
                                public_id: `withdrawal_proof_${id}_${Date.now()}`,
                                format: 'jpg'
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        ).end(req.file.buffer);
                    });

                    proofUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error('Upload to Cloudinary failed:', uploadError);
                    return res.status(500).json({
                        success: false,
                        message: 'Gagal mengupload gambar ke server'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'File proof harus diupload'
                });
            }

            // Update withdrawal dengan URL proof
            const updatedWithdrawal = await prisma.withdrawal.update({
                where: { id: parseInt(id) },
                data: { proof: proofUrl }
            });

            res.status(200).json({
                success: true,
                message: 'Proof berhasil diupload',
                data: {
                    id: updatedWithdrawal.id,
                    proof: updatedWithdrawal.proof
                }
            });

        } catch (error) {
            console.error('Upload proof error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
}

module.exports = new WithdrawalController();
