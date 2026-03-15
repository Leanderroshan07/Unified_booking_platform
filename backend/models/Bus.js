const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
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
    busType: {
      type: String,
      trim: true,
      default: "Luxury Sleeper",
    },
    seatsAvailable: {
      type: Number,
      min: 0,
      default: 32,
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

busSchema.path("amenities").default(() => [
  "Recliner Seats",
  "Wi-Fi",
  "Charging Ports",
  "Onboard Refreshments",
]);

busSchema.path("tags").default(() => ["transport", "bus"]);

module.exports = mongoose.model("Bus", busSchema);
