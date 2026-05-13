const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'haseebsaleem312@gmail.com' });
        if (user) {
            console.log("USER_FOUND: " + user.name + " (" + user.role + ")");
        } else {
            console.log("USER_NOT_FOUND");
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
