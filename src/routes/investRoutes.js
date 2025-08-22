const express = require('express');
const router = express.Router();
const investController = require('../controllers/investController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route invest memerlukan autentikasi
router.use(authMiddleware);

// User routes (investor dan admin bisa akses)
router.post('/', authorizeRole('investor', 'admin'), investController.createInvest);
router.get('/', authorizeRole('investor', 'admin'), investController.getUserInvests);
router.get('/:id', authorizeRole('investor', 'admin'), investController.getInvestById);

// Admin routes (hanya admin yang bisa update status)
router.put('/:id/status', authorizeRole('admin'), investController.updateInvestStatus);

module.exports = router;
