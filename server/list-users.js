const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().select('name email role');
        console.log("TOTAL_USERS: " + users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
