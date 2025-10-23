import http from 'http';

// Test configuration
const BASE_URL = 'http://localhost:3002';
const TEST_ENDPOINTS = [
  '/api/animals',
  '/api/breeding',
  '/api/health',
  '/api/feeding',
  '/api/financial',
  '/api/rfid',
  '/api/tasks'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n🔍 Testing: ${endpoint}`);

    const req = http.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`  ✅ Status: ${res.statusCode}`);
          console.log(`  📄 Response:`, response);
        } catch (e) {
          console.log(`  ✅ Status: ${res.statusCode}`);
          console.log(`  📄 Raw Response:`, data.substring(0, 200) + '...');
        }
        resolve({ endpoint, status: res.statusCode, success: res.statusCode < 400 });
      });
    });

    req.on('error', (err) => {
      console.log(`  ❌ Error: ${err.message}`);
      resolve({ endpoint, error: err.message, success: false });
    });

    req.setTimeout(5000, () => {
      console.log(`  ⏰ Timeout`);
      req.destroy();
      resolve({ endpoint, error: 'Timeout', success: false });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🚀 Starting API endpoint tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('⏰ Each test has a 5-second timeout\n');

  const results = [];

  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');

  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const error = result.error ? ` (${result.error})` : '';
    console.log(`${status} ${result.endpoint} - ${result.status || 'Error'}${error}`);
  });

  console.log(`\n🎯 Results: ${successful}/${results.length} endpoints accessible`);

  if (failed > 0) {
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure the Next.js development server is running on port 3004');
    console.log('2. Check if MONGODB_URI is properly configured in .env.local');
    console.log('3. Verify database connection and network connectivity');
    console.log('4. Check server logs for any error messages');
  } else {
    console.log('\n🎉 All endpoints are accessible!');
  }
}

// Check if server is running first
function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.request(`${BASE_URL}/api/health`, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      console.log('⚠️  Next.js development server is not running on port 3004');
      console.log('💡 Please start the server with: npm run dev');
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log('\n🛑 Cannot proceed with API tests without running server');
    return;
  }

  await testAllEndpoints();
}

main().catch(console.error);