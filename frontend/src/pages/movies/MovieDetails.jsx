import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieById } from "../../services/movieService";
import { getOptimizedImageUrl, getTrailerSource } from "../../utils/media";
import "../../styles/movieDetails.css";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    getMovieById(id).then((res) => setMovie(res.data));
  }, [id]);

  if (!movie) return <p style={{ color: "white" }}>Loading...</p>;

  const heroBackground = getOptimizedImageUrl(movie.backgroundImage, { width: 1600 });
  const posterImage = getOptimizedImageUrl(movie.poster, { width: 720 });
  const trailer = getTrailerSource(movie.trailerUrl);

  return (
    <div className="movie-details-container">
      <div
        className="movie-hero"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="overlay">
          <div className="movie-content">
            <img
              src={posterImage}
              className="movie-poster"
              alt={movie.title}
              loading="lazy"
              decoding="async"
            />

            <div className="movie-info">
              <h1>
                {movie.title} {movie.releaseYear && <span>({movie.releaseYear})</span>}
              </h1>

              <p className="meta">
                ⭐ {movie.rating} {movie.genre?.length > 0 && `• ${movie.genre.join(", ")}`} {movie.duration && `• ${movie.duration}`}
              </p>

              <h3>Storyline</h3>
              <p>{movie.storyline || movie.description}</p>

              {movie.cast?.length > 0 && (
                <>
                  <h3>Cast</h3>
                  <ul className="cast">
                    {movie.cast.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                onClick={() => navigate(`/booking/${id}`)}
                className="mt-8 px-10 py-4 bg-brand-red text-white font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(255,42,42,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {movie.trailerUrl && (
        <div className="trailer-section">
          <h2>Official Trailer</h2>
          <div className="video-container">
            {trailer.type === "youtube" ? (
              <iframe
                title={`${movie.title} trailer`}
                width="100%"
                height="420"
                src={trailer.url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls width="100%" preload="metadata">
                <source src={trailer.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
