const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorization');

// Semua route admin memerlukan autentikasi dan role admin
router.use(authMiddleware);
router.use(authorizeRole('admin'));

// Dashboard statistics route
router.get('/dashboard', adminController.getDashboardStats);

// Investor management routes
router.get('/investors', adminController.getAllUsers);
router.get('/investors/:id', adminController.getInvestorDetails);
router.post('/investors', adminController.createInvestor);
router.put('/investors/:id', adminController.updateInvestor);
router.delete('/investors/:id', adminController.deleteInvestor);

// Transactions history route
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
