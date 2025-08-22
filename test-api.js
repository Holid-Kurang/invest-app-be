// Test script untuk memverifikasi API endpoints
const http = require('http');

// Test health check endpoint
const testHealthCheck = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Health Check Response:');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
};

// Tunggu sebentar sebelum test
setTimeout(testHealthCheck, 1000);
