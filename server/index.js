// STUDIO3D SERVER CORE
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- ROUTES IMPORTS ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders'); 
const aiRoutes = require('./routes/ai');
const sessionRoutes = require('./routes/sessions');
const contactRoutes = require('./routes/contact');
const app = express();

// --- GLOBAL SIMULATION MODE (Default: ON) ---
// Simulation mode acts as a safety net. If the MongoDB connection fails (e.g., due to IP Whitelist issues
// or bad internet), the backend automatically serves mock data from memory. This ensures the frontend UI 
// never crashes during a presentation.
global.isSimulationMode = true; 

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
app.use('/api/sessions', sessionRoutes);
app.use('/api/contact', contactRoutes);

// ====================================================================
// 🧠 DATABASE CONNECTION & NEURAL MONITORING LOGIC
// ====================================================================
// These event listeners automatically toggle Simulation Mode based on 
// the active status of the MongoDB Atlas link.
mongoose.connection.on('connected', () => {
    global.isSimulationMode = false;
    console.log("\x1b[32m%s\x1b[0m", "DATABASE_CONNECTED // SYNCHRONIZATION_COMPLETE");
});

mongoose.connection.on('error', (err) => {
    global.isSimulationMode = true;
    console.log("\x1b[31m%s\x1b[0m", "DATABASE_ERROR // NEURAL_LINK_CORRUPTED");
    console.error("REASON:", err.message);
});

mongoose.connection.on('disconnected', () => {
    global.isSimulationMode = true;
    console.log("\x1b[33m%s\x1b[0m", "DATABASE_DISCONNECTED // ENTERING_MOCK_RECOVERY_MODE");
});

const connectDB = async () => {
    try {
        console.log("SYNCHRONIZING_WITH_MAIN_FRAME...");
        // Set a shorter timeout and disable buffering so queries don't hang
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studio3d', {
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false, 
            autoIndex: false 
        });

        // Seed data if DB is empty (ensures FYP demo works perfectly on live DB)
        try {
            const User = mongoose.models.User || require('./models/user');
            const bcrypt = require('bcryptjs');
            
            const adminExists = await User.findOne({ email: 'admin@demo.com' });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                
                // 1. Developer Account
                await new User({ name: 'Lead Developer', email: 'stublue2357@gmail.com', password: hashedPassword, role: 'developer' }).save();
                
                // 2. Demo Admin
                await new User({ name: 'Demo Admin', email: 'admin@demo.com', password: hashedPassword, role: 'admin' }).save();
                
                // 3. Demo User
                await new User({ name: 'Demo User', email: 'user@demo.com', password: hashedPassword, role: 'user' }).save();
                
                console.log("Seeded default accounts (stublue2357@gmail.com, admin@demo.com, user@demo.com)");
            }
            
            const Product = mongoose.models.Product || require('./models/product');
            const count = await Product.countDocuments();
            if (count === 0) {
                const mockStore = require('./utils/mockStore');
                const products = mockStore.getProducts();
                for (let p of products) {
                    const { _id, ...rest } = p;
                    await new Product(rest).save();
                }
                console.log("Seeded mock products to MongoDB");
            }
        } catch (seedErr) {
            console.error("Auto-seeding failed:", seedErr.message);
        }

    } catch (err) {
        global.isSimulationMode = true; 
        console.log("\x1b[31m%s\x1b[0m", "DATABASE_OFFLINE // NEURAL_MOCK_MODE_ACTIVATED");
        console.log("REASON:", err.message);
        console.log("TIP: The project is now running in 'Simulation Mode'. Data will not persist after restart.");
    }
};
connectDB();

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`
    =========================================
    SERVER_ACTIVE // PORT_${PORT}
    ADMIN_PRIVILEGES // GRANTED
    DATABASE_STATUS // ONLINE
    =========================================
    `);
});

// --- NEURAL KEEP-ALIVE ---
// Force the process to stay alive in simulation mode
setInterval(() => {}, 1000 * 60 * 60);