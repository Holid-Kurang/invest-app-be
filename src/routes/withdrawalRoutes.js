const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route withdrawal memerlukan autentikasi
router.use(authMiddleware);

// User routes (investor dan admin bisa akses)
router.post('/', authorizeRole('investor', 'admin'), withdrawalController.createWithdrawal);
router.get('/', authorizeRole('investor', 'admin'), withdrawalController.getUserWithdrawals);

// Admin routes (hanya admin yang bisa update status dan lihat semua withdrawal)
router.get('/admin/all', authorizeRole('admin'), withdrawalController.getAllWithdrawals);
router.put('/:id/status', authorizeRole('admin'), withdrawalController.updateWithdrawalStatus);

module.exports = router;
