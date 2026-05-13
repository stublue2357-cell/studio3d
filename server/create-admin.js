const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = 'haseebsaleem312@gmail.com';
        const password = '12345678';
        const name = 'Haseeb Saleem';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'developer' // Global access for the owner
        });
        
        await newUser.save();
        console.log("USER_SYNTHESIZED_SUCCESSFULLY: " + email);
        console.log("TEMPORARY_PASSWORD: " + password);
        
        await mongoose.connection.close();
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

createUser();
