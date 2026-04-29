require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- ROUTES IMPORTS ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders'); 
const aiRoutes = require('./routes/ai');
const app = express();

// --- MIDDLEWARE ---
// CORS ko sab se pehle rakha hai taake frontend (5173) backend (5000) se baat kar sakay
app.use(cors()); 

// Image uploads aur bari files (Base64) ke liye limit barha di
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API ENDPOINTS ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/ai', aiRoutes);

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DATABASE_CONNECTED // SYNCHRONIZATION_COMPLETE"))
  .catch((err) => console.log("DATABASE_OFFLINE // ERROR:", err));

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    =========================================
    SERVER_ACTIVE // PORT_${PORT}
    ADMIN_PRIVILEGES // GRANTED
    DATABASE_STATUS // ONLINE
    =========================================
    `);
});