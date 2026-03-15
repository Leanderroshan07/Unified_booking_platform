const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  lookupRoute,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeMatrix.controller");

const router = express.Router();

router.get("/lookup", lookupRoute);
router.get("/", getRoutes);
router.post("/", adminMiddleware, createRoute);
router.put("/:id", adminMiddleware, updateRoute);
router.delete("/:id", adminMiddleware, deleteRoute);

module.exports = router;
