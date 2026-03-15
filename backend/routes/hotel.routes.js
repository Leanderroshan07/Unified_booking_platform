const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotel.controller");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");

router.get("/ping", (req, res) => res.json({ message: "Hotel router internal ping ok" }));
router.get("/", hotelController.getHotels);
router.get("/:id", hotelController.getHotelById);
router.post("/", protect, admin, upload.array("hotelImages", 10), hotelController.createHotel);
router.put("/:id", protect, admin, upload.array("hotelImages", 10), hotelController.updateHotel);
router.delete("/:id", protect, admin, hotelController.deleteHotel);
router.post("/:id/reviews", protect, hotelController.addReview);

module.exports = router;
