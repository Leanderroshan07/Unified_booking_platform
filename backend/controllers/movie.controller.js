const Movie = require("../models/Movie");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const parseListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeMoviePayload = (payload = {}) => ({
  ...payload,
  rating: payload.rating === undefined ? undefined : Number(payload.rating),
  releaseYear: payload.releaseYear === undefined ? undefined : Number(payload.releaseYear),
  popularityScore: payload.popularityScore === undefined ? undefined : Number(payload.popularityScore),
  recommendationWeight:
    payload.recommendationWeight === undefined ? undefined : Number(payload.recommendationWeight),
  distanceScore: payload.distanceScore === undefined ? undefined : Number(payload.distanceScore),
  tags: payload.tags === undefined ? undefined : parseListField(payload.tags),
  availableDates: payload.availableDates === undefined ? undefined : parseListField(payload.availableDates),
  showTimes: payload.showTimes === undefined ? undefined : parseListField(payload.showTimes),
  genre: payload.genre === undefined ? undefined : parseListField(payload.genre),
  cast: payload.cast === undefined ? undefined : parseListField(payload.cast),
  travelTime: payload.travelTime === undefined ? undefined : String(payload.travelTime).trim(),
});

// Admin: Add movie
exports.addMovie = async (req, res) => {
  try {
    const movieData = normalizeMoviePayload(req.body);

    Object.keys(movieData).forEach((key) => {
      if (movieData[key] === undefined || Number.isNaN(movieData[key])) {
        delete movieData[key];
      }
    });

    if (req.files) {
      if (req.files.poster) {
        const posterUpload = await uploadToCloudinary(req.files.poster[0], {
          folder: "unified-booking/movies/posters",
          resourceType: "image",
        });
        movieData.poster = posterUpload.secure_url;
      }

      if (req.files.backgroundImage) {
        const backgroundUpload = await uploadToCloudinary(
          req.files.backgroundImage[0],
          {
            folder: "unified-booking/movies/backgrounds",
            resourceType: "image",
          }
        );
        movieData.backgroundImage = backgroundUpload.secure_url;
      }

      if (req.files.trailer) {
        const trailerUpload = await uploadToCloudinary(req.files.trailer[0], {
          folder: "unified-booking/movies/trailers",
          resourceType: "video",
        });
        movieData.trailerUrl = trailerUpload.secure_url;
      }
    }

    const movie = await Movie.create(movieData);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get single movie
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete movie
exports.deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update movie
exports.updateMovie = async (req, res) => {
  try {
    const movieData = normalizeMoviePayload(req.body);

    Object.keys(movieData).forEach((key) => {
      if (movieData[key] === undefined || Number.isNaN(movieData[key])) {
        delete movieData[key];
      }
    });

    if (req.files) {
      if (req.files.poster) {
        const posterUpload = await uploadToCloudinary(req.files.poster[0], {
          folder: "unified-booking/movies/posters",
          resourceType: "image",
        });
        movieData.poster = posterUpload.secure_url;
      }

      if (req.files.backgroundImage) {
        const backgroundUpload = await uploadToCloudinary(
          req.files.backgroundImage[0],
          {
            folder: "unified-booking/movies/backgrounds",
            resourceType: "image",
          }
        );
        movieData.backgroundImage = backgroundUpload.secure_url;
      }

      if (req.files.trailer) {
        const trailerUpload = await uploadToCloudinary(req.files.trailer[0], {
          folder: "unified-booking/movies/trailers",
          resourceType: "video",
        });
        movieData.trailerUrl = trailerUpload.secure_url;
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, movieData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get movies (with optional location filter)
exports.getMovies = async (req, res) => {
  try {
    const { location } = req.query;
    let movies;

    if (location) {
      // Partial, case-insensitive matching gives better UX for free-text search.
      movies = await Movie.find({
        location: { $regex: new RegExp(location.trim(), "i") },
      });

      // If no location match is found, return all movies instead of a blank page.
      if (movies.length === 0) {
        movies = await Movie.find({});
      }
    } else {
      movies = await Movie.find({});
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};