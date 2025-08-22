const prisma = require('../config/database');

class WithdrawalController {
  // Membuat withdrawal baru
  async createWithdrawal(req, res) {
    try {
      const { amount } = req.body;
      const userId = req.user.id_user;

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

      const newWithdrawal = await prisma.withdrawal.create({
        data: {
          id_user: userId,
          amount: parseFloat(amount),
          status: 'pending'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Withdrawal berhasil dibuat',
        data: newWithdrawal
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

  // Mendapatkan detail withdrawal
  async getWithdrawalById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;

      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          id: parseInt(id),
          id_user: userId
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: withdrawal
      });

    } catch (error) {
      console.error('Get withdrawal by id error:', error);
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
}

module.exports = new WithdrawalController();
