import { useEffect, useState } from "react";
import { addMovie, deleteMovie, getMovies, updateMovie } from "../../services/adminMovieService";
import { AI_MOOD_TAG_OPTIONS, hasTag, toggleTag } from "../../utils/adminAiTags";
import { getOptimizedImageUrl } from "../../utils/media";
import "../../styles/admin.css";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "",
    releaseYear: "",
    cast: "",
    rating: "",
    location: "",
    storyline: "",
    popularityScore: "5",
    recommendationWeight: "5",
    distanceScore: "5",
    travelTime: "",
    tags: "",
  });
  const [files, setFiles] = useState({
    poster: null,
    backgroundImage: null,
    trailer: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadMovies = async () => {
    try {
      const res = await getMovies();
      setMovies(res.data);
    } catch (error) {
      console.error("Failed to load movies", error);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleTagToggle = (tag, checked) => {
    setForm((prev) => ({
      ...prev,
      tags: toggleTag(prev.tags, tag, checked),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("genre", form.genre);
      formData.append("duration", form.duration);
      formData.append("language", form.language);
      if (form.releaseYear) formData.append("releaseYear", form.releaseYear);
      formData.append("cast", form.cast);
      formData.append("rating", form.rating);
      formData.append("location", form.location);
      formData.append("storyline", form.storyline);
      formData.append("popularityScore", form.popularityScore);
      formData.append("recommendationWeight", form.recommendationWeight);
      formData.append("distanceScore", form.distanceScore);
      formData.append("travelTime", form.travelTime);
      formData.append("tags", form.tags);

      if (files.poster) formData.append("poster", files.poster);
      if (files.backgroundImage) formData.append("backgroundImage", files.backgroundImage);
      if (files.trailer) formData.append("trailer", files.trailer);

      if (isEditing && editingMovieId) {
        await updateMovie(editingMovieId, formData);
      } else {
        await addMovie(formData);
      }

      setForm({
        title: "",
        description: "",
        genre: "",
        duration: "",
        language: "",
        releaseYear: "",
        cast: "",
        rating: "",
        location: "",
        storyline: "",
        popularityScore: "5",
        recommendationWeight: "5",
        distanceScore: "5",
        travelTime: "",
        tags: "",
      });
      setFiles({ poster: null, backgroundImage: null, trailer: null });
      setIsEditing(false);
      setEditingMovieId(null);
      setEditingMovie(null);
      e.target.reset();
      loadMovies();
      alert(isEditing ? "Movie updated successfully! Changes saved to Cloudinary." : "Movie added successfully! 🎬");
    } catch (error) {
      console.error("Failed to add movie", error);
      if (error.code === "ERR_NETWORK") {
        alert("Network Error: The backend server seems to be down. Please ensure it is running on port 5000.");
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Authorization Error: You must be logged in as an admin to add movies.");
      } else {
        alert("Error adding movie. Please check all fields and try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (movie) => {
    setForm({
      title: movie.title || "",
      description: movie.description || "",
      genre: movie.genre?.join(", ") || "",
      duration: movie.duration || "",
      language: movie.language || "",
      releaseYear: movie.releaseYear || "",
      cast: movie.cast?.join(", ") || "",
      rating: movie.rating || "",
      location: movie.location || "",
      storyline: movie.storyline || "",
      popularityScore: movie.popularityScore ?? "5",
      recommendationWeight: movie.recommendationWeight ?? "5",
      distanceScore: movie.distanceScore ?? "5",
      travelTime: movie.travelTime || "",
      tags: movie.tags?.join(", ") || "",
    });
    setFiles({ poster: null, backgroundImage: null, trailer: null });
    setIsEditing(true);
    setEditingMovieId(movie._id);
    setEditingMovie(movie);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setForm({
      title: "",
      description: "",
      genre: "",
      duration: "",
      language: "",
      releaseYear: "",
      cast: "",
      rating: "",
      location: "",
      storyline: "",
      popularityScore: "5",
      recommendationWeight: "5",
      distanceScore: "5",
      travelTime: "",
      tags: "",
    });
    setFiles({ poster: null, backgroundImage: null, trailer: null });
    setIsEditing(false);
    setEditingMovieId(null);
    setEditingMovie(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await deleteMovie(id);
        loadMovies();
      } catch (error) {
        console.error("Failed to delete movie", error);
      }
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin – Manage Movies</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        {isEditing && (
          <div style={{ background: "#1a1a2e", border: "1px solid #4a4a8a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <h3 style={{ color: "#a78bfa", marginBottom: 12 }}>Current Media — {editingMovie?.title}</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {editingMovie?.poster && (
                <div style={{ flex: "0 0 auto" }}>
                  <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Current Poster</p>
                  <img
                    src={getOptimizedImageUrl(editingMovie.poster, { width: 120 })}
                    alt="Current poster"
                    style={{ width: 120, height: 170, objectFit: "cover", borderRadius: 4 }}
                  />
                </div>
              )}
              {editingMovie?.backgroundImage && (
                <div style={{ flex: "0 0 auto" }}>
                  <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Current Background</p>
                  <img
                    src={getOptimizedImageUrl(editingMovie.backgroundImage, { width: 200 })}
                    alt="Current background"
                    style={{ width: 200, height: 112, objectFit: "cover", borderRadius: 4 }}
                  />
                </div>
              )}
              {editingMovie?.trailerUrl && (
                <div style={{ flex: "1 1 260px" }}>
                  <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Current Trailer</p>
                  <video
                    src={editingMovie.trailerUrl}
                    controls
                    style={{ width: "100%", maxWidth: 320, height: 180, borderRadius: 4, background: "#000" }}
                  />
                </div>
              )}
              {!editingMovie?.poster && !editingMovie?.backgroundImage && !editingMovie?.trailerUrl && (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>No media files stored yet.</p>
              )}
            </div>
          </div>
        )}
        <input
          name="title"
          placeholder="Movie Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <div className="file-input-group">
          <label>Poster Image{isEditing ? " (leave blank to keep current)" : ""}:</label>
          <input type="file" name="poster" accept="image/*" onChange={handleFileChange} />
          {isEditing && files.poster && (
            <span style={{ color: "#34d399", fontSize: 12 }}>✓ New file selected: {files.poster.name}</span>
          )}
        </div>
        <div className="file-input-group">
          <label>Background Image{isEditing ? " (leave blank to keep current)" : ""}:</label>
          <input
            type="file"
            name="backgroundImage"
            accept="image/*"
            onChange={handleFileChange}
          />
          {isEditing && files.backgroundImage && (
            <span style={{ color: "#34d399", fontSize: 12 }}>✓ New file selected: {files.backgroundImage.name}</span>
          )}
        </div>
        <div className="file-input-group">
          <label>Trailer Video{isEditing ? " (leave blank to keep current)" : ""}:</label>
          <input
            type="file"
            name="trailer"
            accept="video/*"
            onChange={handleFileChange}
          />
          {isEditing && files.trailer && (
            <span style={{ color: "#34d399", fontSize: 12 }}>✓ New trailer selected: {files.trailer.name}</span>
          )}
        </div>
        <textarea
          name="description"
          placeholder="Short Description (e.g. Thrilling adventure movie)"
          value={form.description}
          onChange={handleChange}
          rows={2}
        />
        <input
          name="genre"
          placeholder="Genres (comma separated, e.g. action, adventure)"
          value={form.genre}
          onChange={handleChange}
        />
        <input
          name="duration"
          placeholder="Duration (e.g. 2h 30m)"
          value={form.duration}
          onChange={handleChange}
        />
        <input
          name="language"
          placeholder="Language (e.g. English, Hindi)"
          value={form.language}
          onChange={handleChange}
        />
        <input
          name="releaseYear"
          type="number"
          placeholder="Release Year (e.g. 2024)"
          value={form.releaseYear}
          onChange={handleChange}
        />
        <input
          name="cast"
          placeholder="Cast (comma separated, e.g. Actor 1, Actor 2)"
          value={form.cast}
          onChange={handleChange}
        />
        <input
          name="rating"
          placeholder="Rating (0-10)"
          value={form.rating}
          onChange={handleChange}
        />
        <input
          name="location"
          placeholder="Location (e.g. Chennai)"
          value={form.location}
          onChange={handleChange}
        />
        <textarea
          name="storyline"
          placeholder="Movie Storyline (full plot)"
          value={form.storyline}
          onChange={handleChange}
          required
          rows={4}
        />
        <input
          name="popularityScore"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Popularity Score (0-10)"
          value={form.popularityScore}
          onChange={handleChange}
        />
        <input
          name="recommendationWeight"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Recommendation Weight (0-10)"
          value={form.recommendationWeight}
          onChange={handleChange}
        />
        <input
          name="distanceScore"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Distance Score (0-10)"
          value={form.distanceScore}
          onChange={handleChange}
        />
        <input
          name="travelTime"
          placeholder="Travel Time (e.g. 20 min)"
          value={form.travelTime}
          onChange={handleChange}
        />
        <div className="file-input-group">
          <label>AI Mood Tags:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {AI_MOOD_TAG_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: hasTag(form.tags, option.value) ? "rgba(0, 210, 255, 0.12)" : "rgba(255,255,255,0.04)",
                }}
              >
                <input
                  type="checkbox"
                  checked={hasTag(form.tags, option.value)}
                  onChange={(event) => handleTagToggle(option.value, event.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <input
          name="tags"
          placeholder="Additional AI Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
        />
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Update Movie" : "Add Movie"}
        </button>
        {isEditing && (
          <button type="button" onClick={handleCancelEdit} className="delete-btn">
            Cancel Edit
          </button>
        )}
      </form>

      <div className="admin-movie-list">
        <h2>Existing Movies</h2>
        <div className="movie-grid">
          {movies.map((m) => (
            <div key={m._id} className="admin-movie-card">
              {m.poster && (
                <img
                  src={getOptimizedImageUrl(m.poster, { width: 480 })}
                  alt={m.title}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="movie-info">
                <h3>{m.title}</h3>
                <p>Rating: {m.rating}</p>
                <button className="delete-btn" onClick={() => handleEdit(m)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(m._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMovies;
