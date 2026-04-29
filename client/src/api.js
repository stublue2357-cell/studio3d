import axios from 'axios';

// Backend server ka base rasta (Localhost)
// Backend server ka base rasta (Dynamic for Deployment)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL: API_BASE_URL });

// ==========================================
// 🔐 AUTHENTICATION APIS
// ==========================================
export const loginUser = (formData) => API.post('/auth/login', formData);
export const registerUser = (formData) => API.post('/auth/register', formData);

// ==========================================
// 📦 PRODUCT INVENTORY APIS
// ==========================================

// 1. Naya product database mein add karna
export const addProduct = (productData, token) => {
  return API.post('/products/add', productData, {
    headers: { 'x-auth-token': token }
  });
};

// 2. Database se saray products mangwana
export const getProducts = () => API.get('/products');

// 3. Database se sirf kisi aik product ki detail mangwana
export const getProductById = (id) => API.get(`/products/${id}`);

// 4. Product Update karna (Pre-filled data save karne ke liye)
export const updateProduct = (id, productData, token) => {
  return API.patch(`/products/${id}`, productData, {
    headers: { 'x-auth-token': token }
  });
};

// 5. Product Delete (Purge) karna
export const deleteProduct = (id, token) => {
  return API.delete(`/products/${id}`, {
    headers: { 'x-auth-token': token }
  });
};

// ==========================================
// 🛒 ORDER & TRANSACTION APIS
// ==========================================

// 1. Naya order place karna
export const placeOrder = (orderData, token) => {
  return API.post('/orders/place', orderData, {
    headers: { 'x-auth-token': token }
  });
};

// 2. User ke apne orders mangwana (Vault/Dashboard)
export const getMyOrders = (token) => {
  return API.get('/orders/myorders', {
    headers: { 'x-auth-token': token }
  });
};

// 3. Admin ke liye saray users ke orders mangwana
export const getAllOrdersAdmin = (token) => API.get('/orders/admin/all', {
  headers: { 'x-auth-token': token }
});

// 4. Order status update karna (Pending to Delivered)
export const updateOrderStatus = (id, status, token) => API.patch(`/orders/status/${id}`, { status }, {
  headers: { 'x-auth-token': token }
});

// ==========================================
// 🛡️ ADVANCED ADMINISTRATIVE APIS
// ==========================================

// 1. Role Change (Developer/Sub-Owner only)
export const manageUserRole = (targetUserId, newRole, token) => {
  return API.patch('/auth/manage-role', { targetUserId, newRole }, {
    headers: { 'x-auth-token': token }
  });
};

// 2. Request Delete (Admin only)
export const requestDeleteProduct = (id, token) => {
  return API.post(`/products/request-delete/${id}`, {}, {
    headers: { 'x-auth-token': token }
  });
};

// 3. Get All Users (For Management)
export const getAllUsers = (token) => API.get('/auth/users', {
  headers: { 'x-auth-token': token }
});

// 4. Change Password (All users)
export const changePassword = (payload, token) => {
  return API.post('/auth/change-password', payload, {
    headers: { 'x-auth-token': token }
  });
};

// 5. Update Profile (All users)
export const updateProfile = (payload, token) => {
  return API.patch('/auth/update-profile', payload, {
    headers: { 'x-auth-token': token }
  });
};