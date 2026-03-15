const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");
const {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require("../controllers/flight.controller");

const router = express.Router();

router.get("/", getFlights);
router.get("/:id", getFlightById);

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  createFlight
);

router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  updateFlight
);

router.delete("/:id", adminMiddleware, deleteFlight);

module.exports = router;