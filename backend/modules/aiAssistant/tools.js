/**
 * AI Tool definitions — each tool queries existing MongoDB collections.
 * These are called by the PlannerAgent during the agentic function-calling loop.
 */

const Hotel = require("../../models/Hotel");
const Bus = require("../../models/Bus");
const Train = require("../../models/Train");
const Flight = require("../../models/Flight");
const Movie = require("../../models/Movie");
const Booking = require("../../models/Booking");
const mongoose = require("mongoose");
const {
  getCityCoordinates,
  distanceBetweenCities,
  distanceBetweenCoordinates,
  getNearbyGooglePlaces,
} = require("./mapService");
const { getRouteByCities } = require("../../services/routeMatrixService");

const toNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeTags = (...parts) =>
  parts
    .flat()
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

const isDbConnected = () => mongoose.connection.readyState === 1;

const DEFAULT_MOVIE_SHOW_TIMES = ["10:00", "13:30", "16:30", "19:30", "22:15"];

const MOVIE_MOOD_PROFILES = {
  sad: {
    preferred: ["feel-good", "uplifting", "heartwarming", "comedy", "family", "hopeful", "fun", "light", "romance"],
    avoid: ["crime", "thriller", "war", "intense", "dark", "violent", "tragic", "horror"],
  },
  tired: {
    preferred: ["feel-good", "light", "comfort", "heartwarming", "comedy", "family", "calm", "fun"],
    avoid: ["intense", "war", "crime", "thriller", "violent", "dark", "heavy"],
  },
  stressed: {
    preferred: ["feel-good", "calm", "comfort", "heartwarming", "comedy", "family", "light", "hopeful"],
    avoid: ["crime", "thriller", "war", "intense", "violent", "dark", "heavy"],
  },
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDateString = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalDate(value);
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(date.getTime()) ? null : formatLocalDate(date);
  }

  const splitMatch = text.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (splitMatch) {
    const first = Number(splitMatch[1]);
    const second = Number(splitMatch[2]);
    const yearToken = splitMatch[3];
    const now = new Date();
    const year = yearToken
      ? (yearToken.length === 2 ? Number(`20${yearToken}`) : Number(yearToken))
      : now.getFullYear();
    const month = Math.max(1, Math.min(12, first));
    const day = Math.max(1, Math.min(31, second));
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : formatLocalDate(date);
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatLocalDate(parsed);
};

const normalizeShowTime = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }

  const text = String(value).trim().toLowerCase();
  if (!text) {
    return null;
  }

  const hhmm = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (hhmm) {
    return `${String(hhmm[1]).padStart(2, "0")}:${hhmm[2]}`;
  }

  const twelveHour = text.match(/\b(1[0-2]|0?[1-9])\s*(am|pm)\b/);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const period = twelveHour[2];
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:00`;
  }

  if (text.includes("morning")) return "10:00";
  if (text.includes("afternoon")) return "13:30";
  if (text.includes("evening")) return "19:30";
  if (text.includes("night")) return "22:15";

  return null;
};

const normalizeMovieAvailableDates = (dates = []) => {
  const normalized = dates
    .map((entry) => normalizeDateString(entry))
    .filter(Boolean);
  return [...new Set(normalized)];
};

const normalizeMovieShowTimes = (times = []) => {
  const normalized = times
    .map((entry) => normalizeShowTime(entry))
    .filter(Boolean);
  return [...new Set(normalized)].sort();
};

const buildMovieSearchableText = (movie = {}) =>
  [movie.title, movie.storyline, movie.description, ...(movie.genre || []), ...(movie.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const ACTIVITY_QUERY_KEYWORDS = [
  "action", "comedy", "drama", "thriller", "horror", "romance", "romantic", "adventure",
  "family", "animation", "sci-fi", "scifi", "crime", "mystery", "fantasy", "tamil", "hindi",
  "english", "telugu", "malayalam", "kannada",
];

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractActivityKeywords = (message = "") => {
  const text = String(message || "").toLowerCase();
  return ACTIVITY_QUERY_KEYWORDS.filter((keyword) => {
    if (keyword === "sci-fi") {
      return /\bsci\s*-?\s*fi\b/.test(text);
    }
    if (keyword === "scifi") {
      return /\bscifi\b/.test(text);
    }
    return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(text);
  });
};

const movieMatchesKeywords = (movie = {}, keywords = []) => {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return true;
  }

  const searchable = buildMovieSearchableText(movie);
  return keywords.every((keyword) => {
    if (keyword === "sci-fi" || keyword === "scifi") {
      return searchable.includes("sci-fi") || searchable.includes("scifi") || searchable.includes("science fiction");
    }
    return searchable.includes(keyword);
  });
};

const getMovieMoodSupportScore = (movie, mood) => {
  const profile = MOVIE_MOOD_PROFILES[String(mood || "").toLowerCase()];
  if (!profile) {
    return 0;
  }

  const searchable = buildMovieSearchableText(movie);
  const preferredMatches = profile.preferred.filter((keyword) => searchable.includes(keyword)).length;
  const avoidMatches = profile.avoid.filter((keyword) => searchable.includes(keyword)).length;

  return preferredMatches * 3 - avoidMatches * 2;
};

const buildInitialSeatLayout = () => {
  const rows = 8;
  const cols = 12;
  const seats = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let colIndex = 0; colIndex < cols; colIndex += 1) {
      seats.push({
        id: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`,
        row: String.fromCharCode(65 + rowIndex),
        number: colIndex + 1,
        price: rowIndex < 3 ? 15 : 10,
      });
    }
  }

  return seats;
};

const resolveBookingDate = (travelDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!travelDate || travelDate === "not specified") {
    return formatLocalDate(today);
  }

  const normalizedTravelDate = String(travelDate).trim().toLowerCase();

  if (normalizedTravelDate === "today") {
    return formatLocalDate(today);
  }

  if (normalizedTravelDate === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return formatLocalDate(tomorrow);
  }

  if (normalizedTravelDate === "weekend") {
    const weekendDate = new Date(today);
    const day = weekendDate.getDay();
    const daysUntilSaturday = day === 6 ? 0 : (6 - day + 7) % 7;
    weekendDate.setDate(weekendDate.getDate() + daysUntilSaturday);
    return formatLocalDate(weekendDate);
  }

  if (normalizedTravelDate === "this week") {
    return formatLocalDate(today);
  }

  const parsed = normalizeDateString(normalizedTravelDate);
  if (parsed) {
    return parsed;
  }

  return formatLocalDate(today);
};

const resolveShowTime = (message = "") => {
  const explicitTime = String(message).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (explicitTime) {
    return `${explicitTime[1].padStart(2, "0")}:${explicitTime[2]}`;
  }

  if (/\bmorning\b/i.test(message)) return "10:00";
  if (/\bafternoon\b/i.test(message)) return "13:30";
  if (/\bevening\b/i.test(message)) return "19:30";
  if (/\bnight\b/i.test(message)) return "22:15";

  return "19:30";
};

const parseRequestedSeatCount = (message = "") => {
  const explicit = String(message).match(/\b(\d+)\s+(ticket|tickets|seat|seats)\b/i);
  if (!explicit) {
    return 1;
  }

  const count = Number(explicit[1]);
  return Number.isFinite(count) && count > 0 ? Math.min(count, 6) : 1;
};

const buildMovieSearchQuery = ({ city, title } = {}) => {
  const query = {};

  if (city) {
    query.location = { $regex: `^${String(city).trim()}$`, $options: "i" };
  }

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  return query;
};

const FALLBACK_TRANSPORT_OPTIONS = [
  {
    _type: "bus",
    _id: "fallback-bus-mum-goa-1",
    name: "VRL Travels",
    operator: "VRL Travels",
    origin: "Mumbai",
    destination: "Goa",
    price: 900,
    rating: 4.2,
    duration: "10h 30m",
    busType: "AC Sleeper",
    amenities: ["AC", "sleeper", "charging-point"],
    description: "Overnight AC sleeper service from Mumbai to Goa.",
    popularityScore: 8,
    recommendationWeight: 8,
    distanceScore: 8,
    travelTime: "overnight",
    tags: ["overnight", "sleeper", "beach", "vacation"],
    seatsAvailable: 18,
    distanceKm: 590,
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "bus",
    _id: "fallback-bus-mum-goa-2",
    name: "Neeta Tours",
    operator: "Neeta Tours",
    origin: "Mumbai",
    destination: "Goa",
    price: 700,
    rating: 3.9,
    duration: "10h",
    busType: "Non-AC Sleeper",
    amenities: ["sleeper", "charging-point"],
    description: "Budget overnight bus from Mumbai to Goa.",
    popularityScore: 7,
    recommendationWeight: 7,
    distanceScore: 8,
    travelTime: "overnight",
    tags: ["budget", "overnight", "beach"],
    seatsAvailable: 25,
    distanceKm: 590,
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "train",
    _id: "fallback-train-mum-goa-1",
    name: "Konkan Kanya Express",
    operator: "Konkan Kanya Express",
    origin: "Mumbai",
    destination: "Goa",
    price: 800,
    rating: 4.4,
    duration: "9h 50m",
    trainType: "Express",
    amenities: ["charging", "pantry", "scenic-route"],
    description: "Scenic Konkan route from Mumbai to Goa.",
    popularityScore: 9,
    recommendationWeight: 8.5,
    distanceScore: 9,
    travelTime: "overnight",
    tags: ["scenic", "beach", "vacation", "affordable"],
    seatsAvailable: 90,
    distanceKm: 590,
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "train",
    _id: "fallback-train-mum-goa-2",
    name: "Mandovi Express",
    operator: "Mandovi Express",
    origin: "Mumbai",
    destination: "Goa",
    price: 950,
    rating: 4.1,
    duration: "11h 15m",
    trainType: "Express",
    amenities: ["AC", "pantry", "scenic-route"],
    description: "Daytime express with coastal views from Mumbai to Goa.",
    popularityScore: 8,
    recommendationWeight: 8,
    distanceScore: 8.5,
    travelTime: "daytime",
    tags: ["scenic", "daytime", "beach", "vacation"],
    seatsAvailable: 75,
    distanceKm: 590,
    coordinates: null,
    source: "fallback",
  },
];

const FALLBACK_HOTEL_OPTIONS = [
  {
    _type: "hotel",
    _id: "fallback-hotel-goa-1",
    name: "Taj Exotica Goa",
    location: "Goa",
    price: 16000,
    rating: 4.9,
    starCategory: 5,
    description: "Luxury beachfront resort ideal for romantic and relaxing trips.",
    popularityScore: 9.8,
    recommendationWeight: 9.5,
    distanceScore: 9,
    travelTime: "",
    tags: ["luxury", "beach", "romantic", "resort"],
    amenities: ["spa", "pool", "beach-access"],
    coordinates: null,
    distanceKm: 0,
    source: "fallback",
  },
  {
    _type: "hotel",
    _id: "fallback-hotel-goa-2",
    name: "OYO Townhouse Goa Beach",
    location: "Goa",
    price: 1500,
    rating: 3.5,
    starCategory: 2,
    description: "Affordable stay near Goa beaches for budget travelers.",
    popularityScore: 6,
    recommendationWeight: 5,
    distanceScore: 8,
    travelTime: "",
    tags: ["budget", "beach", "backpacker"],
    amenities: ["wifi", "ac"],
    coordinates: null,
    distanceKm: 0,
    source: "fallback",
  },
  {
    _type: "hotel",
    _id: "fallback-hotel-mumbai-1",
    name: "The Oberoi Mumbai",
    location: "Mumbai",
    price: 9500,
    rating: 4.8,
    starCategory: 5,
    description: "Premium sea-view stay in Nariman Point.",
    popularityScore: 9,
    recommendationWeight: 8.5,
    distanceScore: 7,
    travelTime: "",
    tags: ["luxury", "business", "sea-view"],
    amenities: ["pool", "spa", "gym"],
    coordinates: null,
    distanceKm: 0,
    source: "fallback",
  },
  {
    _type: "hotel",
    _id: "fallback-hotel-mumbai-2",
    name: "Hotel Residency Fort",
    location: "Mumbai",
    price: 3800,
    rating: 4.0,
    starCategory: 3,
    description: "Comfortable city-center hotel with good value.",
    popularityScore: 7,
    recommendationWeight: 6,
    distanceScore: 8,
    travelTime: "",
    tags: ["economy", "business", "central"],
    amenities: ["wifi", "restaurant"],
    coordinates: null,
    distanceKm: 0,
    source: "fallback",
  },
];

const FALLBACK_ACTIVITY_OPTIONS = [
  {
    _type: "activity",
    _id: "fallback-activity-movie-1",
    name: "Laapataa Ladies",
    title: "Laapataa Ladies",
    genre: ["Comedy", "Drama", "Feel-good"],
    rating: 7.8,
    duration: "2h 1m",
    language: "Hindi",
    location: "Mumbai",
    description: "Gentle social comedy with uplifting emotional tone.",
    popularityScore: 8.5,
    recommendationWeight: 8.5,
    distanceScore: 8,
    travelTime: "",
    tags: ["feel-good", "comedy", "uplifting", "family"],
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "activity",
    _id: "fallback-activity-movie-2",
    name: "Jawan",
    title: "Jawan",
    genre: ["Action", "Thriller"],
    rating: 7.8,
    duration: "2h 49m",
    language: "Hindi",
    location: "Mumbai",
    description: "High-energy action entertainer for exciting moods.",
    popularityScore: 9.5,
    recommendationWeight: 9,
    distanceScore: 8,
    travelTime: "",
    tags: ["action", "thrilling", "exciting"],
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "activity",
    _id: "fallback-activity-movie-3",
    name: "Romantic Getaway",
    title: "Romantic Getaway",
    genre: ["Romance", "Drama"],
    rating: 4.3,
    duration: "2h 15m",
    language: "English",
    location: "Goa",
    description: "Relaxed romantic story with scenic coastal visuals.",
    popularityScore: 7,
    recommendationWeight: 6,
    distanceScore: 7,
    travelTime: "",
    tags: ["romantic", "couple", "calm", "beach"],
    coordinates: null,
    source: "fallback",
  },
  {
    _type: "activity",
    _id: "fallback-activity-movie-4",
    name: "Meditation Retreat",
    title: "Meditation Retreat",
    genre: ["Wellness", "Documentary"],
    rating: 4.1,
    duration: "1h 45m",
    language: "English",
    location: "Bangalore",
    description: "Peaceful mindfulness watch for stress relief.",
    popularityScore: 6,
    recommendationWeight: 7,
    distanceScore: 6,
    travelTime: "",
    tags: ["peaceful", "wellness", "relax", "meditation"],
    coordinates: null,
    source: "fallback",
  },
];

const matchesText = (text = "", value = "") =>
  String(text).toLowerCase().includes(String(value).toLowerCase());

const minutesToDuration = (minutes) => {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const hours = Math.floor(value / 60);
  const mins = Math.round(value % 60);
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
};

const getFallbackTransportOptions = ({ origin, destination, type, limit = 5 } = {}) => {
  const normalizedType = type && String(type).toLowerCase();

  const strictRows = FALLBACK_TRANSPORT_OPTIONS.filter((item) => {
    if (normalizedType && item._type !== normalizedType) {
      return false;
    }
    if (origin && !matchesText(item.origin, origin)) {
      return false;
    }
    if (destination && !matchesText(item.destination, destination)) {
      return false;
    }
    return true;
  });

  if (strictRows.length > 0) {
    return strictRows.slice(0, Number(limit || 5));
  }

  // Relax matching when origin extraction is imperfect.
  const destinationRows = FALLBACK_TRANSPORT_OPTIONS.filter((item) => {
    if (normalizedType && item._type !== normalizedType) {
      return false;
    }
    if (destination && !matchesText(item.destination, destination)) {
      return false;
    }
    return true;
  });

  if (destinationRows.length > 0) {
    return destinationRows.slice(0, Number(limit || 5));
  }

  const originRows = FALLBACK_TRANSPORT_OPTIONS.filter((item) => {
    if (normalizedType && item._type !== normalizedType) {
      return false;
    }
    if (origin && !matchesText(item.origin, origin)) {
      return false;
    }
    return true;
  });

  if (originRows.length > 0) {
    return originRows.slice(0, Number(limit || 5));
  }

  return FALLBACK_TRANSPORT_OPTIONS.filter((item) =>
    normalizedType ? item._type === normalizedType : true
  ).slice(0, Number(limit || 5));
};

const getFallbackHotels = ({ city, maxPrice, minRating, limit = 5 } = {}) => {
  const rows = FALLBACK_HOTEL_OPTIONS.filter((item) => {
    if (city && !matchesText(item.location, city)) {
      return false;
    }
    if (maxPrice && Number(item.price) > Number(maxPrice)) {
      return false;
    }
    if (minRating && Number(item.rating) < Number(minRating)) {
      return false;
    }
    return true;
  });

  if (rows.length > 0) {
    return rows.slice(0, Number(limit || 5));
  }

  return FALLBACK_HOTEL_OPTIONS.slice(0, Number(limit || 5));
};

const getFallbackActivities = ({ city, mood, limit = 5 } = {}) => {
  const moodText = String(mood || "").toLowerCase();
  let rows = FALLBACK_ACTIVITY_OPTIONS.filter((item) => {
    if (city && !matchesText(item.location, city)) {
      return false;
    }
    return true;
  });

  if (moodText) {
    const moodRows = rows.filter((item) => {
      const searchable = [
        item.description,
        ...(Array.isArray(item.tags) ? item.tags : []),
        ...(Array.isArray(item.genre) ? item.genre : []),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(moodText);
    });
    if (moodRows.length > 0) {
      rows = moodRows;
    }
  }

  if (rows.length > 0) {
    return rows.slice(0, Number(limit || 5));
  }

  return FALLBACK_ACTIVITY_OPTIONS.slice(0, Number(limit || 5));
};

/* ─── Tool: getHotels ─────────────────────────────────────────────────────── */

const getHotels = async ({ city, maxPrice, minRating, limit = 5 } = {}) => {
  if (!isDbConnected()) {
    return [];
  }

  try {
    const query = {};
    if (city) query.location = { $regex: city, $options: "i" };
    if (maxPrice) query.price = { $lte: Number(maxPrice) };
    if (minRating) query.rating = { $gte: Number(minRating) };

    const hotels = await Hotel.find(query).limit(Number(limit || 5)).lean();

    const cityCoords = city ? await getCityCoordinates(city) : null;

    const normalized = await Promise.all(
      hotels.map(async (hotel) => {
        const itemCoords = await getCityCoordinates(hotel.location || city || "");
        const distanceKm =
          cityCoords && itemCoords
            ? Math.round(distanceBetweenCoordinates(cityCoords, itemCoords) * 10) / 10
            : toNum(hotel.distanceScore, 0);

        return {
          _type: "hotel",
          _id: String(hotel._id),
          name: hotel.name,
          location: hotel.location,
          price: toNum(hotel.price),
          rating: toNum(hotel.rating || hotel.starCategory),
          starCategory: toNum(hotel.starCategory, 3),
          description: hotel.description || "",
          popularityScore: toNum(hotel.popularityScore, 5),
          recommendationWeight: toNum(hotel.recommendationWeight, 5),
          distanceScore: toNum(hotel.distanceScore, 5),
          travelTime: hotel.travelTime || "",
          tags: normalizeTags(hotel.tags),
          amenities: [],
          coordinates: itemCoords || cityCoords,
          distanceKm,
          source: "db",
        };
      })
    );

    return normalized;
  } catch (err) {
    return [];
  }
};

/* ─── Tool: getTransportOptions ───────────────────────────────────────────── */

const getTransportOptions = async ({ origin, destination, type, limit = 5 } = {}) => {
  if (!isDbConnected()) {
    return [];
  }

  try {
    const results = [];

    const routeQuery = {};
    if (origin) routeQuery.origin = { $regex: origin, $options: "i" };
    if (destination) routeQuery.destination = { $regex: destination, $options: "i" };

    const routeMatrix = origin && destination ? await getRouteByCities(origin, destination) : null;
    const routeDistance = routeMatrix?.distanceKm
      || (origin && destination ? await distanceBetweenCities(origin, destination) : null);

    if (!type || type === "bus") {
      const buses = await Bus.find(routeQuery)
        .limit(Number(limit || 5))
        .lean();
      results.push(
        ...buses.map((b) => ({
          _type: "bus",
          _id: String(b._id),
          name: b.operator,
          operator: b.operator,
          origin: b.origin,
          destination: b.destination,
          departureTime: b.departureTime || null,
          arrivalTime: b.arrivalTime || null,
          price: toNum(b.price),
          rating: toNum(b.popularityScore ? b.popularityScore / 2 : 5),
          duration: b.duration || minutesToDuration(routeMatrix?.travelMinutes?.bus),
          busType: b.busType,
          amenities: b.amenities || [],
          description: b.description || "",
          popularityScore: toNum(b.popularityScore, 5),
          recommendationWeight: toNum(b.recommendationWeight, 5),
          distanceScore: toNum(b.distanceScore, 5),
          travelTime: b.travelTime || "",
          tags: normalizeTags(b.tags, b.busType),
          seatsAvailable: b.seatsAvailable || 0,
          distanceKm: routeDistance,
          routeMeta: routeMatrix
            ? {
                distanceKm: routeMatrix.distanceKm,
                travelMinutes: routeMatrix.travelMinutes,
                fastestMode: routeMatrix.fastestMode,
              }
            : null,
          coordinates: null,
          source: "db",
        }))
      );
    }

    if (!type || type === "train") {
      const trains = await Train.find(routeQuery)
        .limit(Number(limit || 5))
        .lean();
      results.push(
        ...trains.map((t) => ({
          _type: "train",
          _id: String(t._id),
          name: t.operator,
          operator: t.operator,
          origin: t.origin,
          destination: t.destination,
          departureTime: t.departureTime || null,
          arrivalTime: t.arrivalTime || null,
          price: toNum(t.price),
          rating: toNum(t.popularityScore ? t.popularityScore / 2 : 5),
          duration: t.duration || minutesToDuration(routeMatrix?.travelMinutes?.train),
          trainType: t.trainType,
          amenities: t.amenities || [],
          description: t.description || "",
          popularityScore: toNum(t.popularityScore, 5),
          recommendationWeight: toNum(t.recommendationWeight, 5),
          distanceScore: toNum(t.distanceScore, 5),
          travelTime: t.travelTime || "",
          tags: normalizeTags(t.tags, t.trainType),
          seatsAvailable: t.seatsAvailable || 0,
          distanceKm: routeDistance,
          routeMeta: routeMatrix
            ? {
                distanceKm: routeMatrix.distanceKm,
                travelMinutes: routeMatrix.travelMinutes,
                fastestMode: routeMatrix.fastestMode,
              }
            : null,
          coordinates: null,
          source: "db",
        }))
      );
    }

    if (!type || type === "flight") {
      const flights = await Flight.find(routeQuery)
        .limit(Number(limit || 5))
        .lean();
      results.push(
        ...flights.map((f) => ({
          _type: "flight",
          _id: String(f._id),
          name: f.airline,
          airline: f.airline,
          origin: f.origin,
          destination: f.destination,
          departureTime: f.departureTime || null,
          arrivalTime: f.arrivalTime || null,
          price: toNum(f.price),
          rating: toNum(f.popularityScore ? f.popularityScore / 2 : 7),
          duration: f.duration || minutesToDuration(routeMatrix?.travelMinutes?.flight),
          aircraft: f.aircraft,
          amenities: f.amenities || [],
          description: f.description || "",
          popularityScore: toNum(f.popularityScore, 5),
          recommendationWeight: toNum(f.recommendationWeight, 5),
          distanceScore: toNum(f.distanceScore, 5),
          travelTime: f.travelTime || "",
          tags: normalizeTags(f.tags, f.aircraft),
          distanceKm: routeDistance,
          routeMeta: routeMatrix
            ? {
                distanceKm: routeMatrix.distanceKm,
                travelMinutes: routeMatrix.travelMinutes,
                fastestMode: routeMatrix.fastestMode,
              }
            : null,
          coordinates: null,
          source: "db",
        }))
      );
    }

    return results;
  } catch (err) {
    return [];
  }
};

/* ─── Tool: getActivities ─────────────────────────────────────────────────── */

const getActivities = async ({ city, mood, message, limit = 5 } = {}) => {
  if (!isDbConnected()) {
    return [];
  }

  try {
    const query = {};
    if (city) query.location = { $regex: city, $options: "i" };

    const candidateLimit = Math.max(Number(limit || 5) * 4, 20);
    const activityKeywords = extractActivityKeywords(message);

    let movies = await Movie.find(query).sort({ recommendationWeight: -1, popularityScore: -1, rating: -1 }).limit(candidateLimit).lean();

    if (activityKeywords.length > 0) {
      movies = movies.filter((movie) => movieMatchesKeywords(movie, activityKeywords));
    }

    const sourceRows = mood
      ? [...movies].sort((a, b) => {
          const moodDelta = getMovieMoodSupportScore(b, mood) - getMovieMoodSupportScore(a, mood);
          if (moodDelta !== 0) {
            return moodDelta;
          }

          return toNum(b.recommendationWeight, 5) - toNum(a.recommendationWeight, 5)
            || toNum(b.popularityScore, 5) - toNum(a.popularityScore, 5)
            || toNum(b.rating, 5) - toNum(a.rating, 5);
        })
      : movies;

    const normalized = await Promise.all(
      sourceRows.slice(0, Number(limit || 5)).map(async (movie) => {
        const coords = await getCityCoordinates(movie.location || city || "");
        return {
          _type: "movie",
          _id: String(movie._id),
          name: movie.title,
          title: movie.title,
          genre: movie.genre || [],
          rating: toNum(movie.rating, 5),
          duration: movie.duration,
          language: movie.language,
          location: movie.location,
          description: movie.storyline || movie.description || "",
          popularityScore: toNum(movie.popularityScore, 5),
          recommendationWeight: toNum(movie.recommendationWeight, 5),
          distanceScore: toNum(movie.distanceScore, 5),
          travelTime: movie.travelTime || "",
          availableDates: normalizeMovieAvailableDates(movie.availableDates || []),
          showTimes: normalizeMovieShowTimes(movie.showTimes || DEFAULT_MOVIE_SHOW_TIMES),
          tags: normalizeTags(movie.genre, movie.tags),
          coordinates: coords,
          source: "db",
        };
      })
    );

    return normalized;
  } catch (err) {
    return [];
  }
};

/* ─── Tool: getNearbyPlaces ───────────────────────────────────────────────── */

const getNearbyPlaces = async ({ city, type = "tourist_attraction", keyword = "", radius = 5000, limit = 5 } = {}) => {
  try {
    if (!city || !isDbConnected()) {
      return [];
    }

    const [cityCoords, googleRows, dbHotels, dbMovies] = await Promise.all([
      getCityCoordinates(city),
      getNearbyGooglePlaces({
        city,
        type,
        keyword,
        radius: Number(radius || 5000),
        limit: Number(limit || 5),
      }),
      Hotel.find({ location: { $regex: city, $options: "i" } }).limit(Number(limit || 5)).lean(),
      Movie.find({ location: { $regex: city, $options: "i" } }).limit(Number(limit || 5)).lean(),
    ]);

    const localHotels = dbHotels.map((hotel) => ({
      _type: "hotel",
      _id: String(hotel._id),
      name: hotel.name,
      location: hotel.location,
      price: toNum(hotel.price),
      rating: toNum(hotel.rating || hotel.starCategory, 5),
      description: hotel.description || "",
      popularityScore: toNum(hotel.popularityScore, 5),
      recommendationWeight: toNum(hotel.recommendationWeight, 5),
      distanceScore: toNum(hotel.distanceScore, 5),
      travelTime: hotel.travelTime || "",
      tags: normalizeTags(hotel.tags),
      coordinates: cityCoords,
      distanceKm: 0,
      source: "db",
    }));

    const localActivities = dbMovies.map((movie) => ({
      _type: "activity",
      _id: String(movie._id),
      name: movie.title,
      location: movie.location,
      price: 0,
      rating: toNum(movie.rating, 5),
      description: movie.storyline || movie.description || "",
      popularityScore: toNum(movie.popularityScore, 5),
      recommendationWeight: toNum(movie.recommendationWeight, 5),
      distanceScore: toNum(movie.distanceScore, 5),
      travelTime: movie.travelTime || "",
      availableDates: normalizeMovieAvailableDates(movie.availableDates || []),
      showTimes: normalizeMovieShowTimes(movie.showTimes || DEFAULT_MOVIE_SHOW_TIMES),
      tags: normalizeTags(movie.genre, movie.tags),
      coordinates: cityCoords,
      distanceKm: 0,
      source: "db",
    }));

    const merged = [...googleRows, ...localHotels, ...localActivities];
    const deduped = [];
    const seen = new Set();

    for (const item of merged) {
      const key = `${String(item.name || "").toLowerCase()}|${String(item.location || city).toLowerCase()}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(item);
    }

    return deduped.slice(0, Number(limit || 5));
  } catch (err) {
    return { error: err.message };
  }
};

const findMovieCandidates = async ({ city, title, limit = 10 } = {}) => {
  if (!isDbConnected()) {
    return [];
  }

  const primaryQuery = buildMovieSearchQuery({ city, title });
  const fallbackQuery = !city && title ? buildMovieSearchQuery({ title }) : {};

  const sortOrder = { recommendationWeight: -1, popularityScore: -1, rating: -1, createdAt: -1 };

  let movies = await Movie.find(primaryQuery).sort(sortOrder).limit(Number(limit || 10)).lean();
  if (movies.length === 0 && Object.keys(fallbackQuery).length > 0) {
    movies = await Movie.find(fallbackQuery).sort(sortOrder).limit(Number(limit || 10)).lean();
  }

  return movies;
};

const createMovieTicketBooking = async ({ userId, message, city, title, travelDate } = {}) => {
  if (!isDbConnected() || !userId) {
    return null;
  }

  const movies = await findMovieCandidates({ city, title, limit: 10 });
  if (movies.length === 0) {
    return null;
  }

  const normalizedMessage = String(message || "").toLowerCase();
  const selectedMovie = movies.find((movie) =>
    normalizedMessage.includes(String(movie.title || "").toLowerCase())
  ) || movies[0];

  const bookingDate = resolveBookingDate(travelDate);
  const requestedTime = resolveShowTime(message);

  const existingDates = normalizeMovieAvailableDates(selectedMovie.availableDates || []);
  const existingTimes = normalizeMovieShowTimes(selectedMovie.showTimes || DEFAULT_MOVIE_SHOW_TIMES);

  const bookingDateMissingInAdmin = !existingDates.includes(bookingDate);
  const bookingTimeMissingInAdmin = !existingTimes.includes(requestedTime);

  const effectiveDates = bookingDateMissingInAdmin ? [...existingDates, bookingDate] : existingDates;
  const effectiveTimes = bookingTimeMissingInAdmin ? [...existingTimes, requestedTime] : existingTimes;
  const bookingTime = effectiveTimes.includes(requestedTime)
    ? requestedTime
    : (effectiveTimes[0] || requestedTime);

  const addToSet = {};
  if (bookingDateMissingInAdmin) {
    addToSet.availableDates = bookingDate;
  }
  if (bookingTimeMissingInAdmin) {
    addToSet.showTimes = requestedTime;
  }

  if (Object.keys(addToSet).length > 0) {
    await Movie.updateOne({ _id: selectedMovie._id }, { $addToSet: addToSet });
  }

  selectedMovie.availableDates = normalizeMovieAvailableDates(effectiveDates);
  selectedMovie.showTimes = normalizeMovieShowTimes(effectiveTimes);
  const requestedSeats = parseRequestedSeatCount(message);

  const existingBookings = await Booking.find({
    movie: selectedMovie._id,
    date: bookingDate,
    time: bookingTime,
    status: "confirmed",
  }).lean();

  const bookedSeatIds = new Set(
    existingBookings.flatMap((booking) =>
      Array.isArray(booking.seats) ? booking.seats.map((seat) => seat.id) : []
    )
  );

  const availableSeats = buildInitialSeatLayout().filter((seat) => !bookedSeatIds.has(seat.id));
  if (availableSeats.length < requestedSeats) {
    return {
      status: "unavailable",
      movie: selectedMovie,
      date: bookingDate,
      time: bookingTime,
      remainingSeats: availableSeats.length,
      scheduleUpdated: bookingDateMissingInAdmin || bookingTimeMissingInAdmin,
      bookingDateMissingInAdmin,
      bookingTimeMissingInAdmin,
    };
  }

  const seats = availableSeats.slice(0, requestedSeats);
  const totalPrice = seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);

  const booking = await Booking.create({
    user: userId,
    movie: selectedMovie._id,
    seats,
    totalPrice,
    date: bookingDate,
    time: bookingTime,
    status: "confirmed",
  });

  return {
    status: "confirmed",
    bookingId: String(booking._id),
    movie: selectedMovie,
    seats,
    totalPrice,
    date: bookingDate,
    time: bookingTime,
    scheduleUpdated: bookingDateMissingInAdmin || bookingTimeMissingInAdmin,
    bookingDateMissingInAdmin,
    bookingTimeMissingInAdmin,
  };
};

/**
 * Execute a named tool with given arguments.
 */
const executeTool = async (name, args = {}) => {
  switch (name) {
    case "getHotels":          return getHotels(args);
    case "getTransportOptions":return getTransportOptions(args);
    case "getActivities":      return getActivities(args);
    case "getNearbyPlaces":    return getNearbyPlaces(args);
    case "findMovieCandidates": return findMovieCandidates(args);
    case "createMovieTicketBooking": return createMovieTicketBooking(args);
    default:                   return { error: `Unknown tool: ${name}` };
  }
};

module.exports = {
  executeTool,
  getHotels,
  getTransportOptions,
  getActivities,
  getNearbyPlaces,
  findMovieCandidates,
  createMovieTicketBooking,
};
