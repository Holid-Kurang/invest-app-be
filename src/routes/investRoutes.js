const express = require('express');
const router = express.Router();
const investController = require('../controllers/investController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');
const uploadMiddleware = require('../middleware/upload');

// Semua route invest memerlukan autentikasi
router.use(authMiddleware);

// User routes (investor dan admin bisa akses)
router.post('/', authorizeRole('investor', 'admin'), uploadMiddleware, investController.createInvest);

// Admin routes (hanya admin yang bisa update status)
router.get('/admin/all', authorizeRole('admin'), investController.getAllInvestments);
router.put('/:id/status', authorizeRole('admin'), investController.updateInvestStatus);
router.delete('/:id/delete', authorizeRole('admin'), investController.deleteInvestment);

module.exports = router;
