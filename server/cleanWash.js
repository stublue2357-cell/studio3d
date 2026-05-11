require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

const cleanWash = async () => {
    try {
        console.log("INITIALIZING_CLEAN_WASH_PROTOCOL...");
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studio3d');
        
        // 1. DELETE ALL USERS
        console.log("PURGING_ALL_EXISTING_ACCOUNTS...");
        await User.deleteMany({});
        
        const salt = await bcrypt.genSalt(10);
        const simplePassword = await bcrypt.hash('123456', salt);

        // 2. CREATE DEVELOPER ACCOUNT
        console.log("SYNTHESIZING_DEVELOPER_NODE...");
        await new User({
            name: 'Lead Developer',
            email: 'stublue2357@gmail.com',
            password: simplePassword,
            role: 'developer'
        }).save();

        // 3. CREATE DEMO ADMIN
        console.log("SYNTHESIZING_ADMIN_NODE...");
        await new User({
            name: 'Demo Admin',
            email: 'admin@demo.com',
            password: simplePassword,
            role: 'admin'
        }).save();

        // 4. CREATE DEMO USER
        console.log("SYNTHESIZING_USER_NODE...");
        await new User({
            name: 'Demo User',
            email: 'user@demo.com',
            password: simplePassword,
            role: 'user'
        }).save();

        console.log("=========================================");
        console.log("CLEAN_WASH_COMPLETE // SYSTEM_REBOOTED");
        console.log("DEV: stublue2357@gmail.com / 123456");
        console.log("ADMIN: admin@demo.com / 123456");
        console.log("USER: user@demo.com / 123456");
        console.log("=========================================");

        process.exit(0);
    } catch (err) {
        console.error("PROTOCOL_FAILURE:", err.message);
        process.exit(1);
    }
};

cleanWash();
