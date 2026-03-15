const mongoose = require("mongoose");

const trainBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    travelClass: {
      type: String,
      required: true,
      trim: true,
    },
    passengers: {
      adults: {
        type: Number,
        default: 1,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainBooking", trainBookingSchema);
