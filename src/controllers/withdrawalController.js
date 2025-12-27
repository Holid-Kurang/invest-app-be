const prisma = require('../config/database');
const emailService = require('../services/emailService');
const cloudinary = require('../services/cloudService');
const { TRANSACTION_TYPE, STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, CLOUDINARY } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');
const AmountValidator = require('../utils/amountValidator');

class WithdrawalController {
    /**
     * Get user email from JWT or database
     */
    async getUserEmail(userId, jwtEmail) {
        if (jwtEmail) {
            return jwtEmail;
        }

        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: { email: true }
        });

        return user?.email || null;
    }

    /**
     * Upload proof file to Cloudinary
     */
    async uploadProofToCloudinary(file, withdrawalId) {
        if (!file) {
            throw new Error(ERROR_MESSAGES.FILE_REQUIRED);
        }

        try {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: CLOUDINARY.RESOURCE_TYPE,
                        folder: 'withdrawal-proofs',
                        public_id: `withdrawal_proof_${withdrawalId}_${Date.now()}`,
                        format: CLOUDINARY.FORMAT
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(file.buffer);
            });

            return uploadResult.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Gagal mengupload bukti pembayaran');
        }
    }

    /**
     * Create new withdrawal
     */
    async createWithdrawal(req, res) {
        try {
            const { amount } = req.body;
            const userId = req.user.id_user;

            // Get user email
            const userEmail = await this.getUserEmail(userId, req.user.email);
            if (!userEmail) {
                return ErrorHandler.validationError(res, 'Email user tidak ditemukan');
            }

            // Validate withdrawal amount
            const validation = AmountValidator.validateWithdrawal(amount);
            if (!validation.valid) {
                return ErrorHandler.validationError(res, validation.error);
            }

            // Create withdrawal record
            const newWithdrawal = await prisma.withdrawal.create({
                data: {
                    id_user: userId,
                    amount: validation.amount,
                    status: STATUS.PENDING
                }
            });

            // Send notification to admin
            await emailService.sendTransactionNotificationToAdmin(
                newWithdrawal.id,
                newWithdrawal,
                userEmail,
                TRANSACTION_TYPE.WITHDRAWAL
            );

            return ResponseFormatter.created(
                res,
                null,
                SUCCESS_MESSAGES.WITHDRAWAL_CREATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Get user withdrawals
     */
    async getUserWithdrawals(req, res) {
        try {
            const userId = req.user.id_user;

            const withdrawals = await prisma.withdrawal.findMany({
                where: { id_user: userId },
                orderBy: { date: 'desc' }
            });

            return ResponseFormatter.success(res, withdrawals);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Update withdrawal status (admin only)
     */
    async updateWithdrawalStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            const StatusFormatter = require('../utils/statusFormatter');
            if (!StatusFormatter.isValidStatus(status)) {
                return ErrorHandler.validationError(res, ERROR_MESSAGES.INVALID_STATUS);
            }

            const updatedWithdrawal = await prisma.withdrawal.update({
                where: { id: parseInt(id) },
                data: { status }
            });

            return ResponseFormatter.success(
                res,
                updatedWithdrawal,
                SUCCESS_MESSAGES.STATUS_UPDATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Get all withdrawals (admin only)
     */
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

            return ResponseFormatter.success(res, formattedWithdrawals);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Delete withdrawal (admin only)
     */
    async deleteWithdrawal(req, res) {
        try {
            const { id } = req.params;

            const deletedWithdrawal = await prisma.withdrawal.delete({
                where: { id: parseInt(id) }
            });

            return ResponseFormatter.success(
                res,
                deletedWithdrawal,
                'Withdrawal berhasil dihapus'
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Upload proof for withdrawal (admin only)
     */
    async uploadProof(req, res) {
        try {
            const { id } = req.params;

            // Upload proof to Cloudinary
            const proofUrl = await this.uploadProofToCloudinary(req.file, id);

            // Update withdrawal with proof URL
            const updatedWithdrawal = await prisma.withdrawal.update({
                where: { id: parseInt(id) },
                data: { proof: proofUrl }
            });

            return ResponseFormatter.success(
                res,
                {
                    id: updatedWithdrawal.id,
                    proof: updatedWithdrawal.proof
                },
                SUCCESS_MESSAGES.WITHDRAWAL_UPDATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error, error.message);
        }
    }
}

module.exports = new WithdrawalController();
