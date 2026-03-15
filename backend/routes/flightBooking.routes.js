const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createFlightBooking,
  getMyFlightBookings,
} = require("../controllers/flightBooking.controller");

router.post("/", authMiddleware, createFlightBooking);
router.get("/my-bookings", authMiddleware, getMyFlightBookings);

module.exports = router;