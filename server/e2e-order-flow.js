const axios = require('axios');

async function runE2E() {
  const baseURL = 'http://localhost:5000/api';
  console.log('🚀 --- STARTING END-TO-END LIFECYCLE TEST ---');

  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'Password123!'
  };

  try {
    // 1. REGISTER NEW USER
    console.log('\n[1] Registering Test User...');
    await axios.post(`${baseURL}/auth/register`, testUser);
    
    // LOGIN TO GET TOKEN
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
    });
    let userToken = loginRes.data.token;
    console.log('✅ User Registered & Logged In.');

    // 2. SIMULATE AI GENERATION
    console.log('\n[2] Generating AI Design...');
    const aiRes = await axios.post(`${baseURL}/ai/generate`, {
      prompt: 'Neon cyber-punk dragon pattern'
    }, {
      headers: { 'x-auth-token': userToken },
      timeout: 30000
    });
    const designImage = aiRes.data.imageUrl;
    console.log(`✅ AI Design Generated! Engine: ${aiRes.data.engine}`);

    // 3. FETCH PRODUCTS (Need a product ID for order)
    console.log('\n[3] Fetching Products...');
    const productsRes = await axios.get(`${baseURL}/products`);
    if(productsRes.data.length === 0) throw new Error("No products found to order!");
    const productToOrder = productsRes.data[0];
    console.log(`✅ Product Selected: ${productToOrder.name} (${productToOrder._id})`);

    // 4. PLACE ORDER WITH CUSTOM DESIGN
    console.log('\n[4] Placing Custom Order...');
    const orderPayload = {
      products: [{
        product: productToOrder._id,
        quantity: 1,
        size: 'M',
        customDesign: {
          type: 'AI',
          data: JSON.stringify({ aiImage: designImage, overlayImage: designImage }) // 3D View Payload Format
        }
      }],
      totalAmount: productToOrder.price + 20, // base + custom fee
      shippingAddress: {
        address: '123 Test Ave',
        city: 'Testville',
        phone: '555-1234'
      },
      customerNote: 'E2E Automation Test Order'
    };

    const orderRes = await axios.post(`${baseURL}/orders/place`, orderPayload, {
      headers: { 'x-auth-token': userToken }
    });
    const orderId = orderRes.data.order._id;
    console.log(`✅ Order Placed! ID: ${orderId}`);

    // 5. ADMIN LOGIN
    console.log('\n[5] Logging in as Admin...');
    const adminRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@studio3d.com',
      password: '123456'
    });
    const adminToken = adminRes.data.token;
    console.log('✅ Admin Logged In.');

    // 6. ADMIN FETCHES ALL ORDERS & VERIFIES
    console.log('\n[6] Admin Fetching Orders & Verifying Custom Design...');
    const allOrdersRes = await axios.get(`${baseURL}/orders/admin/all`, {
      headers: { 'x-auth-token': adminToken }
    });
    const foundOrder = allOrdersRes.data.find(o => o._id === orderId);
    if(!foundOrder) throw new Error("Order not found in Admin Panel!");
    console.log(`✅ Order Found in Admin Dashboard. Status: ${foundOrder.status}`);
    
    // Verify 3D Data payload exists
    const adminDesignData = foundOrder.products[0].customDesign.data;
    if(adminDesignData && adminDesignData.includes(designImage.substring(0, 30))) {
        console.log('✅ Custom 3D Design Payload successfully carried over to Admin Dashboard!');
    } else {
        throw new Error("Custom 3D Design Payload is missing or corrupted!");
    }

    // 7. ADMIN APPROVES ORDER
    console.log('\n[7] Admin Approving Order...');
    const updateRes = await axios.patch(`${baseURL}/orders/status/${orderId}`, {
      status: 'Approved',
      adminFeedback: 'E2E Validation Passed. Looking good!'
    }, {
      headers: { 'x-auth-token': adminToken }
    });
    console.log(`✅ Order Status Updated to: ${updateRes.data.order.status}`);

    console.log('\n🎉 --- END-TO-END LIFECYCLE TEST COMPLETED SUCCESSFULLY --- 🎉');

  } catch (error) {
    console.error('\n❌ E2E TEST FAILED!');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runE2E();
