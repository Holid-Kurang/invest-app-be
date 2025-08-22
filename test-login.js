// Test script untuk login API
const API_BASE_URL = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🧪 Testing login API...\n');

  // Test data
  const testUsers = [
    {
      name: 'Admin User',
      email: 'admin@investapp.com',
      password: 'admin123'
    },
    {
      name: 'Investor User', 
      email: 'investor@investapp.com',
      password: 'investor123'
    }
  ];

  for (const testUser of testUsers) {
    console.log(`Testing ${testUser.name}:`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Login berhasil!');
        console.log('Data user:', {
          id_user: result.data.user.id_user,
          email: result.data.user.email,
          role: result.data.user.role
        });
        console.log('Token:', result.data.token.substring(0, 20) + '...');
      } else {
        console.log('❌ Login gagal:', result.message);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log(''); // Empty line for separation
  }
}

// Test health check
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Server healthy:', result.message);
    } else {
      console.log('❌ Server tidak sehat');
    }
  } catch (error) {
    console.log('❌ Server tidak dapat diakses:', error.message);
  }
  
  console.log('');
}

// Jalankan test
async function runTests() {
  await testHealthCheck();
  await testLogin();
}

runTests();
