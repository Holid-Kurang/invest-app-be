const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route admin memerlukan autentikasi dan role admin
router.use(authMiddleware);
router.use(authorizeRole('admin'));


// Investor management routes
router.get('/investors', adminController.getAllInvestors);
router.post('/investors', adminController.createInvestor);
router.put('/investors/:id', adminController.updateInvestor);
router.delete('/investors/:id', adminController.deleteInvestor);

module.exports = router;
