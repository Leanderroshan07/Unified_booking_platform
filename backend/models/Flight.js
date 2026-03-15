const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    airline: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    cabinClasses: [
      {
        type: String,
        trim: true,
      },
    ],
    luggageAllowance: {
      type: String,
      trim: true,
      default: "25kg check-in + 7kg cabin",
    },
    mealOptions: [
      {
        type: String,
        trim: true,
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    aircraft: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    travelTime: {
      type: String,
      trim: true,
      default: "",
    },
    popularityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    recommendationWeight: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    distanceScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

flightSchema.path("cabinClasses").default(() => ["Economy", "Premium", "Deluxe"]);
flightSchema.path("mealOptions").default(() => ["Veg Meal", "Non-Veg Meal", "Continental"]);
flightSchema.path("amenities").default(() => ["Priority Check-in", "Lounge Access", "In-Flight Wi-Fi"]);
flightSchema.path("tags").default(() => ["transport", "flight"]);

module.exports = mongoose.model("Flight", flightSchema);