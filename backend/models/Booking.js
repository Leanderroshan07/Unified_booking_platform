const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true,
        },
        seats: [
            {
                id: String,
                row: String,
                number: Number,
                price: Number,
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
