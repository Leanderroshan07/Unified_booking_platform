const axios = require("axios");

/**
 * Haversine distance formula — works without any API key.
 * Returns distance in kilometres.
 */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const distanceBetweenCoordinates = (coordA, coordB) => {
  if (!coordA || !coordB) {
    return null;
  }
  return haversineKm(coordA.lat, coordA.lng, coordB.lat, coordB.lng);
};

/**
 * Static city coordinate lookup — no API key required.
 * Covers common Indian cities and major international ones.
 */
const CITY_COORDS = {
  mumbai:     { lat: 19.076, lng: 72.877 },
  delhi:      { lat: 28.704, lng: 77.102 },
  "new delhi":{ lat: 28.704, lng: 77.102 },
  bangalore:  { lat: 12.972, lng: 77.594 },
  bengaluru:  { lat: 12.972, lng: 77.594 },
  chennai:    { lat: 13.083, lng: 80.270 },
  kolkata:    { lat: 22.573, lng: 88.363 },
  hyderabad:  { lat: 17.385, lng: 78.487 },
  jaipur:     { lat: 26.912, lng: 75.787 },
  ahmedabad:  { lat: 23.022, lng: 72.571 },
  pune:       { lat: 18.520, lng: 73.855 },
  goa:        { lat: 15.299, lng: 74.124 },
  surat:      { lat: 21.170, lng: 72.831 },
  lucknow:    { lat: 26.847, lng: 80.947 },
  dubai:      { lat: 25.204, lng: 55.270 },
  london:     { lat: 51.507, lng: -0.127 },
  paris:      { lat: 48.856, lng: 2.352  },
  "new york":  { lat: 40.712, lng: -74.006 },
  singapore:  { lat: 1.352,  lng: 103.820},
  bangkok:    { lat: 13.756, lng: 100.502},
};

const normalizeCityKey = (value) => String(value || "").toLowerCase().trim();

/**
 * Attempt to geocode a city name via Google Maps if key is available,
 * otherwise fall back to static lookup.
 */
const getCityCoordinates = async (cityName) => {
  const key = process.env.GOOGLE_MAPS_KEY;
  const normalized = normalizeCityKey(cityName);

  if (!normalized) {
    return null;
  }

  if (key) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${key}`;
      const { data } = await axios.get(url, { timeout: 4000 });
      if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
        return data.results[0].geometry.location; // { lat, lng }
      }
    } catch {
      // fall through to static lookup
    }
  }

  return CITY_COORDS[normalized] || null;
};

const getNearbyGooglePlaces = async ({
  city,
  type = "tourist_attraction",
  keyword = "",
  radius = 5000,
  limit = 5,
} = {}) => {
  const key = process.env.GOOGLE_MAPS_KEY;

  if (!city || !key) {
    return [];
  }

  const center = await getCityCoordinates(city);
  if (!center) {
    return [];
  }

  const params = new URLSearchParams({
    location: `${center.lat},${center.lng}`,
    radius: String(radius),
    key,
  });

  if (type) {
    params.set("type", type);
  }

  if (keyword) {
    params.set("keyword", keyword);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 4500 });

    if (!Array.isArray(data?.results)) {
      return [];
    }

    return data.results.slice(0, Number(limit || 5)).map((place, index) => {
      const location = place?.geometry?.location || null;
      const distanceKm = location
        ? Math.round(distanceBetweenCoordinates(center, location) * 10) / 10
        : null;

      return {
        _type: "place",
        _id: `google-place-${place.place_id || index}`,
        name: place.name,
        location: place.vicinity || city,
        price: typeof place.price_level === "number" ? place.price_level * 1000 : 0,
        rating: Number(place.rating || 0),
        description: place.vicinity || "Nearby place",
        popularityScore: 7,
        recommendationWeight: 5,
        distanceScore: 5,
        travelTime: "",
        tags: place.types || [],
        coordinates: location,
        distanceKm,
        source: "google_maps",
      };
    });
  } catch {
    return [];
  }
};

/**
 * Calculate distance in km between two city name strings.
 * Returns null if coordinates for either city cannot be resolved.
 */
const distanceBetweenCities = async (cityA, cityB) => {
  const [coordsA, coordsB] = await Promise.all([
    getCityCoordinates(cityA),
    getCityCoordinates(cityB),
  ]);

  if (!coordsA || !coordsB) return null;

  return Math.round(distanceBetweenCoordinates(coordsA, coordsB));
};

/**
 * Return map markers payload for frontend rendering.
 * Each marker: { name, lat, lng, type, score }
 */
const buildMapMarkers = (recommendations) => {
  return recommendations
    .filter((r) => r.coordinates)
    .map((r) => ({
      name: r.name || r.operator || r.airline || "Place",
      lat: r.coordinates.lat,
      lng: r.coordinates.lng,
      type: r._type || "place",
      score: r.score || 0,
    }));
};

module.exports = {
  getCityCoordinates,
  getNearbyGooglePlaces,
  distanceBetweenCities,
  distanceBetweenCoordinates,
  buildMapMarkers,
};
