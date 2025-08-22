const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda tidak memiliki permission untuk mengakses resource ini.'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memeriksa authorization'
      });
    }
  };
};

module.exports = authorizeRole;
