require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check endpoint tanpa database
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server berjalan di http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});
