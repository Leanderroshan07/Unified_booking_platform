const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    taxes: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
    images: [
        {
            type: String,
        },
    ],
    size: {
        type: String,
    },
    bedType: {
        type: String,
    },
    bathroomCount: {
        type: Number,
        default: 1,
    },
    view: {
        type: String,
    },
    freeCancellationDate: {
        type: Date,
    },
    coupleFriendly: {
        type: Boolean,
        default: true,
    },
    mealPlans: [
        {
            type: String,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
