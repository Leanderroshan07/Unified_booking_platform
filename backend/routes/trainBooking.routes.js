const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTrainBooking,
  getMyTrainBookings,
} = require("../controllers/trainBooking.controller");

const router = express.Router();

router.post("/", authMiddleware, createTrainBooking);
router.get("/my-bookings", authMiddleware, getMyTrainBookings);

module.exports = router;
