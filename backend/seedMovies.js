require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const Movie = require("./models/Movie");

// Keep Atlas SRV resolution stable across environments.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const sampleMovies = [
  {
    title: "Interstellar Rewatch",
    description:
      "A cinematic journey beyond Earth as explorers travel through a wormhole to save humanity.",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backgroundImage:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    genre: ["Sci-Fi", "Adventure"],
    duration: "2h 49m",
    language: "English",
    releaseYear: 2014,
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    rating: 8.6,
    location: "Mumbai",
    storyline:
      "With Earth facing collapse, a team ventures across space and time to find a new home.",
  },
  {
    title: "Skyline Heist",
    description:
      "A high-stakes action thriller where an elite crew attempts an impossible vault break in the clouds.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    backgroundImage:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    genre: ["Action", "Thriller"],
    duration: "2h 12m",
    language: "English",
    releaseYear: 2023,
    cast: ["John David", "Ana Carter", "Liam Stone"],
    rating: 7.8,
    location: "Bengaluru",
    storyline:
      "A precision team races against time to pull off the most daring sky-vault heist ever attempted.",
  },
  {
    title: "Monsoon Melody",
    description:
      "A heartfelt musical drama about dreams, second chances, and a city that never stops singing.",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
    backgroundImage:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=2LqzF5WauAw",
    genre: ["Drama", "Musical", "Romance"],
    duration: "2h 05m",
    language: "Hindi",
    releaseYear: 2024,
    cast: ["Aarav Mehta", "Rhea Kapoor", "Nisha Verma"],
    rating: 8.1,
    location: "Chennai",
    storyline:
      "Two artists reconnect during monsoon season and discover the courage to perform their truth.",
  },
];

async function seedMovies() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Movie.countDocuments();
    if (existing > 0) {
      console.log(`Movies already exist (${existing}). Skipping seed.`);
      process.exit(0);
    }

    await Movie.insertMany(sampleMovies);
    console.log(`Seeded ${sampleMovies.length} movies.`);
    process.exit(0);
  } catch (error) {
    console.error(`Failed to seed movies: ${error.message}`);
    process.exit(1);
  }
}

seedMovies();
