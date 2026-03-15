const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");
const {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require("../controllers/bus.controller");

const router = express.Router();

router.get("/", getBuses);
router.get("/:id", getBusById);

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  createBus
);

router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  updateBus
);

router.delete("/:id", adminMiddleware, deleteBus);

module.exports = router;
