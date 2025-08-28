const prisma = require('../config/database');
const emailService = require('../services/emailService');
const cloudinary = require('../services/cloudService');

class InvestController {
    // Membuat investasi baru
    async createInvest(req, res) {
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

            // Validasi amount tidak melebihi batas maksimal (10^10 = 10,000,000,000)
            if (parseFloat(amount) >= 10000000000) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount tidak boleh melebihi 10,000,000,000'
                });
            }

            // Upload file ke Cloudinary
            let proofUrl = null;
            if (req.file) {
                try {
                    const uploadResult = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                resource_type: 'image',
                                folder: 'investment-proofs',
                                public_id: `proof_${userId}_${Date.now()}`,
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
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({
                        success: false,
                        message: 'Gagal mengupload bukti pembayaran'
                    });
                }
            }

            // Simpan investasi ke database dengan URL Cloudinary
            const newInvest = await prisma.invest.create({
                data: {
                    id_user: userId,
                    amount: parseFloat(amount),
                    proof: proofUrl, // Simpan URL dari Cloudinary
                    status: 'pending'
                }
            });

            // Siapkan data file untuk email
            const fileData = {
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype
            };

            const type = 'Investment';
            const id_invest = newInvest.id_invest;
            await emailService.sendTransactionNotificationToAdmin(
                id_invest,
                newInvest,
                userEmail,
                type,
                fileData // Kirim file buffer, bukan path
            );

            res.status(201).json({
                success: true,
                message: 'Investasi berhasil dibuat dan notifikasi telah dikirim',
            });

        } catch (error) {
            console.error('Create invest error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Update status investasi (untuk admin)
    async updateInvestStatus(req, res) {
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

            const updatedInvest = await prisma.invest.update({
                where: { id_invest: parseInt(id) },
                data: { status }
            });

            res.status(200).json({
                success: true,
                message: 'Status investasi berhasil diupdate',
                data: updatedInvest
            });

        } catch (error) {
            console.error('Update invest status error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }

    // Mendapatkan semua investasi untuk admin
    async getAllInvestments(req, res) {
        try {
            const investments = await prisma.invest.findMany({
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
            const formattedInvestments = investments.map(investment => ({
                id: investment.id_invest,
                date: investment.date,
                amount: parseFloat(investment.amount),
                status: investment.status,
                investor: investment.user.name,
                investor_email: investment.user.email,
                id_user: investment.user.id_user,
                hasProof: !!investment.proof,
                proofUrl: investment.proof // URL dari Cloudinary
            }));

            res.status(200).json({
                success: true,
                data: formattedInvestments
            });
        } catch (error) {
            console.error('Get all investments error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
}

module.exports = new InvestController();
