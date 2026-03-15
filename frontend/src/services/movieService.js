import api from "./api";

// user: get all movies

// user: get single movie
export const getMovieById = (id) => api.get(`/movies/${id}`);
export const getMovies = (location) =>
  api.get(`/movies${location ? `?location=${location}` : ""}`);
