// Quick test script to verify API endpoints
const testLogin = async () => {
  try {
    console.log('Testing login...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
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
    
    const contentType = response.headers.get('content-type');
    console.log('Login - Content-Type:', contentType);
    console.log('Login - Status:', response.status);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Login Success! JSON response:', data);
      
      // Test auth/me endpoint with the token
      if (data.success) {
        console.log('\nTesting auth/me...');
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        const meContentType = meResponse.headers.get('content-type');
        console.log('Auth/me - Content-Type:', meContentType);
        console.log('Auth/me - Status:', meResponse.status);
        
        if (meContentType && meContentType.includes('application/json')) {
          const meData = await meResponse.json();
          console.log('Auth/me Success! JSON response:', meData);
        }
      }
    } else {
      const text = await response.text();
      console.log('Error: HTML response received');
      console.log('First 200 chars:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testLogin();