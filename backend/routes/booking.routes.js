const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createBooking,
    getBookedSeats,
    getUserBookings,
} = require("../controllers/booking.controller");

// Public routes (to check availability)
router.get("/seats", getBookedSeats);

// Protected routes (user must be logged in)
router.post("/", authMiddleware, createBooking);
router.get("/my-bookings", authMiddleware, getUserBookings);

module.exports = router;
