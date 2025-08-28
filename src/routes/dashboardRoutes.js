const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Protected routes - hanya untuk user yang sudah login
router.get('/investor', authMiddleware, authorizeRole('investor'), dashboardController.getInvestorDashboard);
router.get('/admin', authMiddleware, authorizeRole('admin'), dashboardController.getAdminDashboard);

module.exports = router;
