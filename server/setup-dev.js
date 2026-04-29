const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const setupDev = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const devEmail = "haseebsaleem312@gmail.com";
        const devPassword = "Mughal@1212";
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(devPassword, salt);

        let user = await User.findOne({ email: devEmail });
        
        if (user) {
            user.password = hashedPassword;
            user.role = 'developer';
            await user.save();
            console.log(`Developer account updated: ${devEmail}`);
        } else {
            user = new User({
                name: "Haseeb Saleem",
                email: devEmail,
                password: hashedPassword,
                role: 'developer'
            });
            await user.save();
            console.log(`Developer account created: ${devEmail}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

setupDev();
