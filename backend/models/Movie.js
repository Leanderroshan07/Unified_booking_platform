const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    poster: String,
    backgroundImage: String,
    trailerUrl: String,
    genre: [String],
    duration: String,
    language: String,
    releaseYear: Number,
    cast: [String],
    rating: Number,
    location: String,
    availableDates: [String],
    showTimes: [String],
    storyline: String,
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
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
