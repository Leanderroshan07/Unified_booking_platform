require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const listUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({}, "username email role");
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
