const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn("Continuing in degraded mode without MongoDB. Some endpoints may return fallback data.");
    return null;
  }
};

module.exports = connectDB;
