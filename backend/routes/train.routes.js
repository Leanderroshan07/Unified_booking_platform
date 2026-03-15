const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");
const {
  getTrains,
  getTrainById,
  createTrain,
  updateTrain,
  deleteTrain,
} = require("../controllers/train.controller");

const router = express.Router();

router.get("/", getTrains);
router.get("/:id", getTrainById);

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  createTrain
);

router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  adminMiddleware,
  updateTrain
);

router.delete("/:id", adminMiddleware, deleteTrain);

module.exports = router;