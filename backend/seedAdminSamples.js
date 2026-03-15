const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./config/db");
const Movie = require("./models/Movie");
const Hotel = require("./models/Hotel");
const Bus = require("./models/Bus");
const Train = require("./models/Train");
const Flight = require("./models/Flight");

const plusHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

async function upsertSamples() {
  await connectDB();

  const movie = await Movie.findOneAndUpdate(
    { title: "Atlas Sample Movie" },
    {
      $set: {
        title: "Atlas Sample Movie",
        description: "Feel-good adventure sample for admin verification.",
        poster:
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
        backgroundImage:
          "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80",
        trailerUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        genre: ["adventure", "family"],
        duration: "2h 14m",
        language: "English",
        releaseYear: 2025,
        cast: ["Actor One", "Actor Two"],
        rating: 8.4,
        location: "Dubai",
        storyline: "A bright and uplifting cinematic journey used to verify manual admin entry.",
        travelTime: "18 min",
        popularityScore: 8.8,
        recommendationWeight: 8.5,
        distanceScore: 7.2,
        tags: ["happy", "family", "uplifting"],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const hotel = await Hotel.findOneAndUpdate(
    { name: "Atlas Sample Hotel" },
    {
      $set: {
        name: "Atlas Sample Hotel",
        location: "Dubai Marina",
        price: 12500,
        description: "Luxury sample hotel for admin verification and user listing checks.",
        starCategory: 5,
        rating: 4.7,
        distanceFromAirport: "14 km",
        travelTime: "22 min",
        popularityScore: 8.9,
        recommendationWeight: 8.4,
        distanceScore: 7.5,
        tags: ["relaxed", "romantic", "luxury"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const bus = await Bus.findOneAndUpdate(
    { operator: "Atlas Sample Bus", origin: "Dubai", destination: "Abu Dhabi" },
    {
      $set: {
        operator: "Atlas Sample Bus",
        origin: "Dubai",
        destination: "Abu Dhabi",
        price: 1499,
        departureTime: plusHours(6),
        arrivalTime: plusHours(8.5),
        duration: "02h 30m",
        busType: "Executive Seater",
        seatsAvailable: 28,
        amenities: ["Wi-Fi", "Charging Ports", "Water Bottle"],
        description: "Sample bus route for admin verification.",
        travelTime: "35 min to terminal",
        popularityScore: 7.8,
        recommendationWeight: 7.4,
        distanceScore: 6.9,
        tags: ["happy", "transport", "bus"],
        image:
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        isFeatured: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const train = await Train.findOneAndUpdate(
    { operator: "Atlas Sample Express", origin: "Dubai", destination: "Sharjah" },
    {
      $set: {
        operator: "Atlas Sample Express",
        origin: "Dubai",
        destination: "Sharjah",
        price: 999,
        departureTime: plusHours(4),
        arrivalTime: plusHours(5.25),
        duration: "01h 15m",
        trainType: "Premium Sleeper",
        seatsAvailable: 52,
        amenities: ["Wi-Fi", "Onboard Meals", "Charging Ports"],
        description: "Sample train route for admin verification.",
        travelTime: "28 min to station",
        popularityScore: 7.6,
        recommendationWeight: 7.1,
        distanceScore: 6.7,
        tags: ["relaxed", "transport", "train"],
        image:
          "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
        isFeatured: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const flight = await Flight.findOneAndUpdate(
    { airline: "Atlas Sample Air", origin: "Dubai", destination: "Doha" },
    {
      $set: {
        airline: "Atlas Sample Air",
        origin: "Dubai",
        destination: "Doha",
        price: 18999,
        departureTime: plusHours(10),
        arrivalTime: plusHours(11.5),
        duration: "01h 30m",
        cabinClasses: ["Economy", "Business"],
        luggageAllowance: "25kg check-in + 7kg cabin",
        mealOptions: ["Veg Meal", "Continental"],
        amenities: ["Priority Check-in", "In-Flight Wi-Fi"],
        aircraft: "Airbus A320 Neo",
        description: "Sample flight route for admin verification.",
        travelTime: "40 min to airport",
        popularityScore: 8.1,
        recommendationWeight: 7.9,
        distanceScore: 8.6,
        tags: ["happy", "transport", "flight"],
        image:
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
        isFeatured: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(
    JSON.stringify(
      {
        movieId: movie._id.toString(),
        hotelId: hotel._id.toString(),
        busId: bus._id.toString(),
        trainId: train._id.toString(),
        flightId: flight._id.toString(),
      },
      null,
      2
    )
  );
}

upsertSamples()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.stack || error.message || error);
    process.exit(1);
  });