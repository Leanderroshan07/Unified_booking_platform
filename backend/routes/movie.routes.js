const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/upload");
const {
  addMovie,
  deleteMovie,
  updateMovie,
  getMovies,
  getMovieById,
} = require("../controllers/movie.controller");

// Admin routes
router.post(
  "/",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
    { name: "trailer", maxCount: 1 },
  ]),
  adminMiddleware,
  addMovie
);

router.delete("/:id", adminMiddleware, deleteMovie);

router.put(
  "/:id",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
    { name: "trailer", maxCount: 1 },
  ]),
  adminMiddleware,
  updateMovie
);

// User routes
router.get("/", getMovies);
router.get("/:id", getMovieById);

module.exports = router;
