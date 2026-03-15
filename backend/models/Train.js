const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
  {
    operator: {
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
    trainType: {
      type: String,
      trim: true,
      default: "Premium Sleeper",
    },
    seatsAvailable: {
      type: Number,
      min: 0,
      default: 48,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
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

trainSchema.path("amenities").default(() => [
  "2-Tier Berths",
  "Charging Ports",
  "Wi-Fi",
  "Onboard Meals",
]);

trainSchema.path("tags").default(() => ["transport", "train"]);

module.exports = mongoose.model("Train", trainSchema);