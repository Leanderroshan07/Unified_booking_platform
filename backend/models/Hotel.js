const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    starCategory: {
        type: Number,
        default: 3,
    },
    distanceFromAirport: {
        type: String,
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
    images: [
        {
            type: String,
        },
    ],
    rating: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
            },
            rating: {
                type: Number,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Hotel", hotelSchema);
