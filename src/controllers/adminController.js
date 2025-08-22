const prisma = require('../config/database');

class AdminController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id_user: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get all investments (admin only)
  async getAllInvestments(req, res) {
    try {
      const investments = await prisma.invest.findMany({
        include: {
          user: {
            select: {
              id_user: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: investments
      });

    } catch (error) {
      console.error('Get all investments error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get all returns (admin only)
  async getAllReturns(req, res) {
    try {
      const returns = await prisma.return.findMany({
        include: {
          user: {
            select: {
              id_user: true,
              email: true
            }
          }
        },
        orderBy: { request_at: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: returns
      });

    } catch (error) {
      console.error('Get all returns error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get all withdrawals (admin only)
  async getAllWithdrawals(req, res) {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        include: {
          user: {
            select: {
              id_user: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: withdrawals
      });

    } catch (error) {
      console.error('Get all withdrawals error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Dashboard statistics (admin only)
  async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalInvestors,
        totalAdmins,
        totalInvestments,
        pendingInvestments,
        successInvestments,
        totalReturns,
        pendingReturns,
        totalWithdrawals,
        pendingWithdrawals
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'investor' } }),
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.invest.count(),
        prisma.invest.count({ where: { status: 'pending' } }),
        prisma.invest.count({ where: { status: 'success' } }),
        prisma.return.count(),
        prisma.return.count({ where: { status: 'pending' } }),
        prisma.withdrawal.count(),
        prisma.withdrawal.count({ where: { status: 'pending' } })
      ]);

      const totalInvestmentAmount = await prisma.invest.aggregate({
        _sum: { amount: true },
        where: { status: 'success' }
      });

      const totalReturnAmount = await prisma.return.aggregate({
        _sum: { amount: true },
        where: { status: 'succes' }
      });

      const totalWithdrawalAmount = await prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'success' }
      });

      res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            investors: totalInvestors,
            admins: totalAdmins
          },
          investments: {
            total: totalInvestments,
            pending: pendingInvestments,
            success: successInvestments,
            totalAmount: totalInvestmentAmount._sum.amount || 0
          },
          returns: {
            total: totalReturns,
            pending: pendingReturns,
            totalAmount: totalReturnAmount._sum.amount || 0
          },
          withdrawals: {
            total: totalWithdrawals,
            pending: pendingWithdrawals,
            totalAmount: totalWithdrawalAmount._sum.amount || 0
          }
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = new AdminController();
