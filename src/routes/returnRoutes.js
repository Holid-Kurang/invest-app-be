const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route return memerlukan autentikasi
router.use(authMiddleware);

// User routes (investor dan admin bisa akses)
router.post('/', authorizeRole('investor', 'admin'), returnController.createReturn);
router.get('/', authorizeRole('investor', 'admin'), returnController.getUserReturns);

// Admin routes (hanya admin yang bisa update status)
router.put('/:id/status', authorizeRole('admin'), returnController.updateReturnStatus);

module.exports = router;
