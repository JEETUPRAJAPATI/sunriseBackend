// Test authentication endpoints
const testAuth = async () => {
  console.log('=== TESTING API ENDPOINTS ===\n');
  
  try {
    // Test 1: Basic API test endpoint
    console.log('1. Testing /api/test...');
    const testRes = await fetch('http://localhost:5000/api/test', {
      headers: { 'Accept': 'application/json' }
    });
    console.log(`Status: ${testRes.status}, Content-Type: ${testRes.headers.get('content-type')}`);
    
    if (testRes.headers.get('content-type')?.includes('application/json')) {
      const testData = await testRes.json();
      console.log('✓ Test endpoint working:', testData.message);
    } else {
      console.log('✗ Test endpoint returning HTML');
    }
    
    // Test 2: Login endpoint
    console.log('\n2. Testing /api/auth/login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log(`Status: ${loginRes.status}, Content-Type: ${loginRes.headers.get('content-type')}`);
    
    if (loginRes.headers.get('content-type')?.includes('application/json')) {
      const loginData = await loginRes.json();
      console.log('✓ Login successful:', loginData.success ? 'YES' : 'NO');
      console.log('✓ User role:', loginData.user?.role);
      console.log('✓ Token received:', loginData.token ? 'YES' : 'NO');
    } else {
      const text = await loginRes.text();
      console.log('✗ Login returning HTML instead of JSON');
      console.log('First 100 chars:', text.substring(0, 100));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAuth();