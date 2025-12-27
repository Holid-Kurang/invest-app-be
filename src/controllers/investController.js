const prisma = require('../config/database');
const emailService = require('../services/emailService');
const cloudinary = require('../services/cloudService');
const { TRANSACTION_TYPE, STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, CLOUDINARY } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');
const AmountValidator = require('../utils/amountValidator');

class InvestController {
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
    async uploadProofToCloudinary(file, userId) {
        if (!file) {
            return null;
        }

        try {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: CLOUDINARY.RESOURCE_TYPE,
                        folder: CLOUDINARY.FOLDER,
                        public_id: `proof_${userId}_${Date.now()}`,
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
     * Send email notification to admin
     */
    async sendAdminNotification(investId, investData, userEmail, file) {
        if (!file) {
            return;
        }

        const fileData = {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype
        };

        await emailService.sendTransactionNotificationToAdmin(
            investId,
            investData,
            userEmail,
            TRANSACTION_TYPE.INVESTMENT,
            fileData
        );
    }

    /**
     * Create new investment
     */
    async createInvest(req, res) {
        try {
            const { amount } = req.body;
            const userId = req.user.id_user;

            // Get user email
            const userEmail = await this.getUserEmail(userId, req.user.email);
            if (!userEmail) {
                return ErrorHandler.validationError(res, 'Email user tidak ditemukan');
            }

            // Validate amount
            const validation = AmountValidator.validate(amount);
            if (!validation.valid) {
                return ErrorHandler.validationError(res, validation.error);
            }

            // Upload proof to Cloudinary
            const proofUrl = await this.uploadProofToCloudinary(req.file, userId);

            // Create investment record
            const newInvest = await prisma.invest.create({
                data: {
                    id_user: userId,
                    amount: validation.amount,
                    proof: proofUrl,
                    status: STATUS.PENDING
                }
            });

            // Send notification to admin
            await this.sendAdminNotification(
                newInvest.id_invest,
                newInvest,
                userEmail,
                req.file
            );

            return ResponseFormatter.created(
                res,
                null,
                SUCCESS_MESSAGES.INVEST_CREATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Update investment status (admin only)
     */
    async updateInvestStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            const StatusFormatter = require('../utils/statusFormatter');
            if (!StatusFormatter.isValidStatus(status)) {
                return ErrorHandler.validationError(res, ERROR_MESSAGES.INVALID_STATUS);
            }

            const updatedInvest = await prisma.invest.update({
                where: { id_invest: parseInt(id) },
                data: { status }
            });

            return ResponseFormatter.success(
                res,
                updatedInvest,
                SUCCESS_MESSAGES.STATUS_UPDATED
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Get all investments (admin only)
     */
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

            const formattedInvestments = investments.map(investment => ({
                id: investment.id_invest,
                date: investment.date,
                amount: parseFloat(investment.amount),
                status: investment.status,
                investor: investment.user.name,
                investor_email: investment.user.email,
                id_user: investment.user.id_user,
                hasProof: !!investment.proof,
                proofUrl: investment.proof
            }));

            return ResponseFormatter.success(res, formattedInvestments);

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }

    /**
     * Delete investment (admin only)
     */
    async deleteInvestment(req, res) {
        try {
            const { id } = req.params;

            const deletedInvest = await prisma.invest.delete({
                where: { id_invest: parseInt(id) }
            });

            return ResponseFormatter.success(
                res,
                deletedInvest,
                'Investasi berhasil dihapus'
            );

        } catch (error) {
            return ErrorHandler.handleError(res, error);
        }
    }
}

module.exports = new InvestController();
