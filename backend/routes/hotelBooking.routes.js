const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createHotelBooking,
  getMyHotelBookings,
} = require("../controllers/hotelBooking.controller");

router.post("/", authMiddleware, createHotelBooking);
router.get("/my-bookings", authMiddleware, getMyHotelBookings);

module.exports = router;
