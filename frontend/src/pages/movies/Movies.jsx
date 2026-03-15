import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMovies } from "../../services/movieService";

// Cinematic Components
import Navbar from "../../components/cinematic/Navbar";
import HeroBanner from "../../components/cinematic/HeroBanner";
import DateTimeSelector from "../../components/cinematic/DateTimeSelector";
import MovieCardGrid from "../../components/cinematic/MovieCardGrid";
import TrailerModal from "../../components/cinematic/TrailerModal";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedMovieForTrailer, setSelectedMovieForTrailer] = useState(null);
  const navigate = useNavigate();

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const locationParam = queryParams.get("location");

  useEffect(() => {
    getMovies(locationParam).then((res) => {
      setMovies(res.data);
      if (res.data.length > 0) {
        // Set first movie with a background as featured
        const featured = res.data.find(m => m.backgroundImage) || res.data[0];
        setFeaturedMovie(featured);
      }
    });
  }, [locationParam]);

  const handleWatchTrailer = (movie) => {
    setSelectedMovieForTrailer(movie || featuredMovie);
    setIsTrailerOpen(true);
  };

  const handleMovieClick = (movie) => {
    navigate(`/movies/${movie._id}`);
  };

  const handleBuyTicket = () => {
    // Navigate to first movie details or let user select
    if (featuredMovie) navigate(`/movies/${featuredMovie._id}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-brand-red selection:text-white">
      <Navbar />

      <main>
        {/* Cinematic Hero */}
        <HeroBanner
          movie={featuredMovie}
          onWatchTrailer={() => handleWatchTrailer(featuredMovie)}
        />

        {/* Date/Time Filter Sticky Bar */}
        <DateTimeSelector onBuyTicket={handleBuyTicket} />

        {/* Dynamic Movie Grid */}
        <MovieCardGrid
          movies={movies}
          onMovieClick={handleMovieClick}
        />
      </main>

      {/* Overlays */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={selectedMovieForTrailer?.trailerUrl}
        movieTitle={selectedMovieForTrailer?.title}
      />
    </div>
  );
};

export default Movies;
