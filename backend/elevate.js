require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const elevate = async () => {
    try {
        await connectDB();
        const email = process.argv[2];
        if (!email) {
            console.error("Please provide an email: node elevate.js user@example.com");
            process.exit(1);
        }
        const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
        if (user) {
            console.log(`User ${email} is now an ADMIN.`);
        } else {
            console.log(`User ${email} not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

elevate();
