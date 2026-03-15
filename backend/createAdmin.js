require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const createAdmin = async () => {
    try {
        await connectDB();
        const email = "admin@example.com";
        const password = "adminpassword";
        const username = "admin";
        const contactNumber = "1234567890";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findOneAndDelete({ email });
        const user = await User.create({
            username,
            email,
            contactNumber,
            password: hashedPassword,
            role: "admin"
        });

        console.log(`Admin user ${email} created with password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
