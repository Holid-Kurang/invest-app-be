const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route admin memerlukan autentikasi dan role admin
router.use(authMiddleware);
router.use(authorizeRole('admin'));

// Admin management routes
router.get('/users', adminController.getAllUsers);
router.get('/investments', adminController.getAllInvestments);
router.get('/returns', adminController.getAllReturns);
router.get('/withdrawals', adminController.getAllWithdrawals);
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
