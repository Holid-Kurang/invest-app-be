const prisma = require('../config/database');

class ReturnController {
  // Membuat request return baru
  async createReturn(req, res) {
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

      const newReturn = await prisma.return.create({
        data: {
          id_user: userId,
          amount: parseFloat(amount),
          status: 'pending'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Request return berhasil dibuat',
        data: newReturn
      });

    } catch (error) {
      console.error('Create return error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Mendapatkan semua return user
  async getUserReturns(req, res) {
    try {
      const userId = req.user.id_user;

      const returns = await prisma.return.findMany({
        where: { id_user: userId },
        orderBy: { request_at: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: returns
      });

    } catch (error) {
      console.error('Get user returns error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Update status return (untuk admin)
  async updateReturnStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validasi status
      if (!['pending', 'succes'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid'
        });
      }

      const updateData = { status };
      
      // Jika status success, set approved_at
      if (status === 'succes') {
        updateData.approved_at = new Date();
      }

      const updatedReturn = await prisma.return.update({
        where: { id_return: parseInt(id) },
        data: updateData
      });

      res.status(200).json({
        success: true,
        message: 'Status return berhasil diupdate',
        data: updatedReturn
      });

    } catch (error) {
      console.error('Update return status error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = new ReturnController();
