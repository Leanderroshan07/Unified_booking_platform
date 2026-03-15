const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");

router.get("/hotel/:hotelId", roomController.getRoomsByHotel);
router.get("/:id", roomController.getRoomById);

// Admin routes
router.post(
    "/",
    protect,
    admin,
    upload.array("roomImages", 5),
    roomController.createRoom
);
router.put(
    "/:id",
    protect,
    admin,
    upload.array("roomImages", 5),
    roomController.updateRoom
);
router.delete("/:id", protect, admin, roomController.deleteRoom);

module.exports = router;
