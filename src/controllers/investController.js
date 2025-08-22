const prisma = require('../config/database');

class InvestController {
  // Membuat investasi baru
  async createInvest(req, res) {
    try {
      const { amount, proof } = req.body;
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

      const newInvest = await prisma.invest.create({
        data: {
          id_user: userId,
          amount: parseFloat(amount),
          proof: proof || null,
          status: 'pending'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Investasi berhasil dibuat',
        data: newInvest
      });

    } catch (error) {
      console.error('Create invest error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Mendapatkan semua investasi user
  async getUserInvests(req, res) {
    try {
      const userId = req.user.id_user;

      const invests = await prisma.invest.findMany({
        where: { id_user: userId },
        orderBy: { date: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: invests
      });

    } catch (error) {
      console.error('Get user invests error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Mendapatkan detail investasi
  async getInvestById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;

      const invest = await prisma.invest.findFirst({
        where: {
          id_invest: parseInt(id),
          id_user: userId
        }
      });

      if (!invest) {
        return res.status(404).json({
          success: false,
          message: 'Investasi tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: invest
      });

    } catch (error) {
      console.error('Get invest by id error:', error);
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
      if (!['pending', 'success'].includes(status)) {
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
}

module.exports = new InvestController();
