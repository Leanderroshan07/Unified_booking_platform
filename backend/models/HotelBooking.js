const mongoose = require("mongoose");

const hotelBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    roomType: {
      type: String,
      required: true,
      trim: true,
    },
    checkInDate: {
      type: String,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    guests: {
      adults: {
        type: Number,
        default: 2,
      },
      children: {
        type: Number,
        default: 0,
      },
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    taxesPerNight: {
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

module.exports = mongoose.model("HotelBooking", hotelBookingSchema);
