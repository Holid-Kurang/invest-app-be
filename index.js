require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const indexRoutes = require('./src/routes/indexRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', indexRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
