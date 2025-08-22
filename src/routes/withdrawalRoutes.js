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
router.get('/:id', authorizeRole('investor', 'admin'), withdrawalController.getWithdrawalById);

// Admin routes (hanya admin yang bisa update status)
router.put('/:id/status', authorizeRole('admin'), withdrawalController.updateWithdrawalStatus);

module.exports = router;
