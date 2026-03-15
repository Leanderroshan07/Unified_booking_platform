import api from "./api";

export const addMovie = (movie) =>
  api.post("/movies", movie, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const deleteMovie = (id) =>
  api.delete(`/movies/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateMovie = (id, movie) =>
  api.put(`/movies/${id}`, movie, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getMovies = () => api.get("/movies");
