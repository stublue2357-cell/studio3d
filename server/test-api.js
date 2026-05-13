const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  console.log('--- STARTING API TESTS ---');

  let token = '';

  try {
    console.log('1. Testing Login API...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'haseebsaleem312@gmail.com',
      password: 'Mughal@1212'
    });
    token = loginRes.data.token;
    console.log('✅ Login Successful! Token received.');

    console.log('2. Testing Products API...');
    const productsRes = await axios.get(`${baseURL}/products`);
    console.log(`✅ Products Fetched! Count: ${productsRes.data.length}`);

    console.log('3. Testing AI Generation API...');
    const aiRes = await axios.post(`${baseURL}/ai/generate`, {
      prompt: 'A futuristic cyber jacket'
    }, {
      headers: { 'x-auth-token': token },
      timeout: 30000 // 30 seconds
    });
    console.log(`✅ AI Generation Successful! Engine used: ${aiRes.data.engine}`);

    console.log('--- ALL BACKEND TESTS PASSED ---');
  } catch (error) {
    console.error('❌ API Test Failed!');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
