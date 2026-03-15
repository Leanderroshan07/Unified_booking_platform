/**
 * Travel Route Calculator
 * Calculates routes, distances, times, and costs for travel planning
 */

const CITY_DISTANCES = {
  "dubai-mumbai": 1200,
  "dubai-bangalore": 1400,
  "dubai-hyderabad": 1350,
  "dubai-london": 5500,
  "dubai-paris": 5600,
  "mumbai-bangalore": 800,
  "mumbai-hyderabad": 650,
  "mumbai-delhi": 1400,
  "bangalore-hyderabad": 600,
  "new-york-los-angeles": 3900,
  "london-paris": 340,
  "london-amsterdam": 350,
  "paris-rome": 1400,
};

const TRANSPORT_SPEEDS = {
  flight: 900, // km/h
  express_train: 160, // km/h
  train: 80, // km/h
  bus: 60, // km/h
  car: 100, // km/h
};

const COST_PER_KM = {
  flight: 2.0,
  train: 0.3,
  bus: 0.15,
  car: 0.05,
};

/**
 * Get approximate distance between cities
 */
const getDistance = (origin, destination) => {
  if (!origin || !destination) return null;

  const key1 = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const key2 = `${destination.toLowerCase()}-${origin.toLowerCase()}`;

  return CITY_DISTANCES[key1] || CITY_DISTANCES[key2] || null;
};

/**
 * Calculate travel time for a transport mode
 */
const calculateTravelTime = (distance, transportType) => {
  const speed = TRANSPORT_SPEEDS[transportType] || 80;
  const baseTime = distance / speed;

  // Add overhead time (booking, boarding, etc.)
  const overhead = {
    flight: 3,
    train: 1,
    bus: 0.5,
    car: 0,
  }[transportType] || 0;

  const totalTime = baseTime + overhead;
  return Math.ceil(totalTime * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate approximate cost
 */
const calculateCost = (distance, transportType, classType = "standard") => {
    
  const baseRate = COST_PER_KM[transportType] || 0.2;
  const baseCost = distance * baseRate;

  const classMultiplier = {
    budget: 0.7,
    standard: 1.0,
    premium: 1.8,
    luxury: 3.0,
  }[classType] || 1.0;

  return Math.ceil(baseCost * classMultiplier);
};

/**
 * Generate single transport route
 */
const generateRoute = (origin, destination, transportType, classType = "standard", distanceKm = null) => {
  const distance = distanceKm || getDistance(origin, destination) || 500;
  const time = calculateTravelTime(distance, transportType);
  const cost = calculateCost(distance, transportType, classType);

  return {
    origin,
    destination,
    transportType,
    class: classType,
    distance,
    estimatedTime: time,
    estimatedTimeMinutes: Math.round(time * 60),
    estimatedCost: cost,
    convenience: calculateConvenience(transportType, classType),
    comfort: calculateComfort(transportType, classType),
    speed: TRANSPORT_SPEEDS[transportType] / 100, // Normalized speed score
  };
};

/**
 * Calculate convenience score (1-10)
 */
const calculateConvenience = (transportType, classType) => {
  const baseScores = {
    flight: 8,
    train: 6,
    bus: 4,
    car: 5,
  };

  const classBonus = {
    budget: 0,
    standard: 1,
    premium: 2,
    luxury: 3,
  }[classType] || 0;

  return (baseScores[transportType] || 5) + classBonus;
};

/**
 * Calculate comfort score (1-10)
 */
const calculateComfort = (transportType, classType) => {
  const baseScores = {
    flight: 6,
    train: 5,
    bus: 3,
    car: 7,
  };

  const classBonus = {
    budget: 0,
    standard: 1,
    premium: 2,
    luxury: 4,
  }[classType] || 0;

  return Math.min((baseScores[transportType] || 4) + classBonus, 10);
};

/**
 * Generate combined route (multi-leg journey)
 */
const generateCombinedRoute = (origin, destination, legs, distanceKm = null) => {
  const distance = distanceKm || getDistance(origin, destination) || 500;
  let totalTime = 0;
  let totalCost = 0;
  const legDetails = [];

  legs.forEach((leg) => {
    const legDist = leg.distance || distance / legs.length;
    const time = calculateTravelTime(legDist, leg.transport);
    const cost = calculateCost(legDist, leg.transport, leg.class || "standard");

    totalTime += time;
    totalCost += cost;

    legDetails.push({
      origin: leg.origin || origin,
      destination: leg.destination,
      transport: leg.transport,
      distance: legDist,
      time,
      cost,
    });
  });

  return {
    route: legs.map((l) => l.transport).join(" + "),
    legs: legDetails,
    totalDistance: distance,
    totalTime,
    totalTimeMinutes: Math.round(totalTime * 60),
    totalCost,
    description: `${legs.map((l) => l.transport.toUpperCase()).join(" → ")}`,
  };
};

/**
 * Get all possible routes for a journey
 */
const getAllRoutes = (origin, destination, distanceKm = null) => {
  const distance = distanceKm || getDistance(origin, destination) || 500;

  const routes = {
    fastest: generateRoute(origin, destination, "flight", "standard", distance),
    normal: generateRoute(origin, destination, "train", "standard", distance),
    safe: generateRoute(origin, destination, "bus", "standard", distance),
    combined: generateCombinedRoute(origin, destination, [
      { transport: "train", class: "standard" },
      { transport: "bus", class: "standard" },
    ], distance),
  };

  // Sort by time
  const sorted = [routes.fastest, routes.normal, routes.safe].sort(
    (a, b) => a.estimatedTime - b.estimatedTime
  );

  return {
    distance,
    fastest: sorted[0],
    normal: sorted[1],
    safe: sorted[2],
    combined: routes.combined,
    allRoutes: sorted,
  };
};

/**
 * Get routes by budget
 */
const getRoutesByBudget = (origin, destination, maxBudget, distanceKm = null) => {
  const distance = distanceKm || getDistance(origin, destination) || 500;

  const allRoutes = [];

  // Generate routes with different transport and class options
  ["bus", "train", "flight"].forEach((transport) => {
    ["budget", "standard", "premium", "luxury"].forEach((classType) => {
      const route = generateRoute(origin, destination, transport, classType, distance);
      allRoutes.push(route);
    });
  });

  // Filter by budget
  const affordable = allRoutes.filter((r) => r.estimatedCost <= maxBudget);

  return {
    maxBudget,
    affordable: affordable.sort((a, b) => a.estimatedTime - b.estimatedTime),
    count: affordable.length,
  };
};

/**
 * Get date-based availability and pricing
 */
const getDateBasedPricing = (origin, destination, travelDate, distanceKm = null) => {
  const distance = distanceKm || getDistance(origin, destination) || 500;

  // Simulate dynamic pricing based on date
  const dateMultiplier = calculateDateMultiplier(travelDate);

  const routes = getAllRoutes(origin, destination, distance);

  // Apply date-based pricing
  const pricedRoutes = {};
  Object.entries(routes).forEach(([key, route]) => {
    if (route.estimatedCost) {
      pricedRoutes[key] = {
        ...route,
        baseCost: route.estimatedCost,
        dynamicPrice: Math.ceil(route.estimatedCost * dateMultiplier),
        savings: key !== "fastest" ? Math.ceil(routes.fastest.estimatedCost - (route.estimatedCost * dateMultiplier)) : 0,
      };
    } else {
      pricedRoutes[key] = route;
    }
  });

  return {
    origin,
    destination,
    date: travelDate,
    priceMultiplier: dateMultiplier,
    routes: pricedRoutes,
  };
};

/**
 * Calculate price multiplier based on travel date
 */
const calculateDateMultiplier = (travelDate) => {
  // Simple logic: higher prices for weekends/holidays
  const daysFromNow = calculateDaysFromNow(travelDate);

  if (daysFromNow <= 3) return 1.5; // Last-minute booking premium
  if (daysFromNow <= 7) return 1.2; // Short notice
  if (daysFromNow <= 30) return 1.0; // Normal
  return 0.85; // Advance booking discount
};

/**
 * Calculate days from now
 */
const calculateDaysFromNow = (dateStr) => {
  if (!dateStr || dateStr === "today") return 0;
  if (dateStr === "tomorrow") return 1;
  if (dateStr === "this week") return 3;
  if (dateStr === "weekend") return 6;

  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 30; // Default to normal pricing
  }
};

module.exports = {
  getDistance,
  calculateTravelTime,
  calculateCost,
  generateRoute,
  generateCombinedRoute,
  getAllRoutes,
  getRoutesByBudget,
  getDateBasedPricing,
  calculateDateMultiplier,
  calculateDaysFromNow,
  CITY_DISTANCES,
  TRANSPORT_SPEEDS,
  COST_PER_KM,
};
