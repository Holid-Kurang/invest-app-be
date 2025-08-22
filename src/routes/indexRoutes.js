const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const investRoutes = require('./investRoutes');
const returnRoutes = require('./returnRoutes');
const withdrawalRoutes = require('./withdrawalRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Routes
router.use('/auth', authRoutes);
router.use('/invest', investRoutes);
router.use('/return', returnRoutes);
router.use('/withdrawal', withdrawalRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// 404 handler untuk routes yang tidak ditemukan
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

module.exports = router;