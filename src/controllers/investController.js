const prisma = require('../config/database');
const emailService = require('../services/emailService');

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

      // Simpan investasi ke database tanpa path file (karena tidak disimpan ke disk)
      const newInvest = await prisma.invest.create({
        data: {
          id_user: userId,
          amount: parseFloat(amount),
          proof: req.file.originalname, // Hanya simpan nama file asli
          status: 'pending'
        }
      });

      // Siapkan data file untuk email
      const fileData = {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
      };

      await emailService.sendInvestNotificationToAdmin(
        newInvest, 
        userEmail, 
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
