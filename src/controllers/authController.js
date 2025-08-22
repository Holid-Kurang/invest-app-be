const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class AuthController {
  // Register user baru
  async register(req, res) {
    try {
      const { email, password, role = 'investor' } = req.body;

      // Validasi input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password harus diisi'
        });
      }

      // Validasi role
      if (!['investor', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role harus investor atau admin'
        });
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Simpan user baru
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { id_user: newUser.id_user, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User berhasil didaftarkan',
        data: {
          user: {
            id_user: newUser.id_user,
            email: newUser.email,
            role: newUser.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password harus diisi'
        });
      }

      // Cari user berdasarkan email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id_user: user.id_user, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: {
            id_user: user.id_user,
            email: user.email,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get profile user
  async getProfile(req, res) {
    try {
      const userId = req.user.id_user;

      const user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: {
          id_user: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = new AuthController();
