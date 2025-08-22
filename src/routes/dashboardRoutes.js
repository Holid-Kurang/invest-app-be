const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authentication');

// Protected routes - hanya untuk user yang sudah login
router.get('/investor', authMiddleware, dashboardController.getInvestorDashboard);

module.exports = router;
