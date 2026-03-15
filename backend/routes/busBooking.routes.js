const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createBusBooking,
  getMyBusBookings,
} = require("../controllers/busBooking.controller");

const router = express.Router();

router.post("/", authMiddleware, createBusBooking);
router.get("/my-bookings", authMiddleware, getMyBusBookings);

module.exports = router;