const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = "haseebsaleem312@gmail.com";
        const password = "Mughal@1212";

        const user = await User.findOne({ email });
        if (!user) { console.log("User not found"); process.exit(1); }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log("Token generated:", !!token);

        process.exit(0);
    } catch (err) {
        console.error("TEST_FAILED:", err);
        process.exit(1);
    }
};

testLogin();
