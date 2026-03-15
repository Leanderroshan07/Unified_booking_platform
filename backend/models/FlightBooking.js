const mongoose = require("mongoose");

const flightBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    travelClass: {
      type: String,
      required: true,
      trim: true,
    },
    mealPlan: {
      type: String,
      trim: true,
    },
    luggage: {
      type: String,
      trim: true,
    },
    passengers: {
      adults: {
        type: Number,
        default: 1,
      },
      children: {
        type: Number,
        default: 0,
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

module.exports = mongoose.model("FlightBooking", flightBookingSchema);