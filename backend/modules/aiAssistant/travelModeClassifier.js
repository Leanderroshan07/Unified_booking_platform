/**
 * Travel Mode Classifier
 * Categorizes routes into FASTEST, NORMAL, and SAFE modes
 * Each mode considers time, cost, comfort, and reliability
 */

const TRANSPORT_METRICS = {
  flight: {
    avgSpeed: 900, // km/h
    timeMultiplier: 1.0, // Fastest
    costMultiplier: 2.5,
    comfortScore: 7,
    reliabilityScore: 8,
  },
  train: {
    avgSpeed: 80, // km/h
    timeMultiplier: 1.5,
    costMultiplier: 1.0,
    comfortScore: 6,
    reliabilityScore: 7,
  },
  bus: {
    avgSpeed: 60, // km/h
    timeMultiplier: 2.0,
    costMultiplier: 0.5,
    comfortScore: 4,
    reliabilityScore: 5,
  },
};

/**
 * Calculate travel time in hours
 */
const calculateTravelTime = (distance, transportType) => {
  const metrics = TRANSPORT_METRICS[transportType.toLowerCase()] || { avgSpeed: 60 };
  const baseTime = distance / metrics.avgSpeed;
  return Math.ceil(baseTime * 10) / 10; // Round to 1 decimal
};

/**
 * Classify transport mode into FASTEST/NORMAL/SAFE
 */
const classifyTransportMode = (item, distanceKm) => {
  const type = item._type;

  if (type === "flight") return "FASTEST";
  if (type === "train") return "NORMAL";
  if (type === "bus") return "SAFE";

  // For other modes, use distance as heuristic
  if (distanceKm > 1000) return "FASTEST"; // For long distances, flights are best
  if (distanceKm > 200) return "NORMAL"; // Medium distances: trains/buses okay
  return "SAFE"; // Short distances: buses/cars
};

/**
 * Score transport by convenience
 */
const calculateConvenience = (item, mode) => {
  const baseScore = {
    FASTEST: 9,
    NORMAL: 7,
    SAFE: 5,
  }[mode] || 5;

  const { comfortScore, reliabilityScore } = TRANSPORT_METRICS[item._type] || {};
  const comfort = comfortScore || 5;
  const reliability = reliabilityScore || 5;

  return Math.round(((baseScore + comfort + reliability) / 3) * 10) / 10;
};

/**
 * Estimate cost with adjustments
 */
const estimateCost = (item, mode, distance) => {
  const basePrice = item.price || 0;
  const multipliers = {
    FASTEST: 2.0,
    NORMAL: 1.0,
    SAFE: 0.6,
  };

  const multiplier = multipliers[mode] || 1.0;
  return Math.ceil(basePrice * multiplier);
};

/**
 * Enrich transport item with travel mode classification
 */
const enrichWithTravelMode = (item, distance) => {
  const travelTime = calculateTravelTime(distance, item._type);
  const mode = classifyTransportMode(item, distance);
  const convenience = calculateConvenience(item, mode);
  const estimatedCost = estimateCost(item, mode, distance);

  return {
    ...item,
    travelMode: mode,
    estimatedTime: `${travelTime} hours`,
    estimatedTimeMinutes: Math.round(travelTime * 60),
    estimatedCost,
    convenience,
    distance,
    travelSummary: `${item._type === "flight"
      ? `${item.airline || "Flight"}`
      : item._type === "train"
        ? `${item.operator || "Train"}`
        : `${item.operator || "Bus"}`
      } - ${travelTime}h - ₹${estimatedCost}`,
  };
};

/**
 * Organize multiple transport options into travel modes
 */
const organizeTravelModes = (transportOptions, distance) => {
  const enriched = transportOptions
    .map((item) => enrichWithTravelMode(item, distance))
    .sort((a, b) => {
      // Sort by estimated time
      return a.estimatedTimeMinutes - b.estimatedTimeMinutes;
    });

  const modeGroups = {
    FASTEST: enriched.filter((item) => item.travelMode === "FASTEST"),
    NORMAL: enriched.filter((item) => item.travelMode === "NORMAL"),
    SAFE: enriched.filter((item) => item.travelMode === "SAFE"),
  };

  return {
    byMode: modeGroups,
    allEnriched: enriched,
    recommendations: {
      FASTEST: modeGroups.FASTEST[0] || null,
      NORMAL: modeGroups.NORMAL[0] || null,
      SAFE: modeGroups.SAFE[0] || null,
    },
  };
};

/**
 * Get best option for each travel mode
 */
const selectBestPerMode = (transportOptions, distance) => {
  const organized = organizeTravelModes(transportOptions, distance);

  const fastest = organized.recommendations.FASTEST;
  const normal = organized.recommendations.NORMAL || organized.recommendations.FASTEST;
  const safe = organized.recommendations.SAFE || fastest;

  return {
    FASTEST: fastest
      ? {
          transport: fastest._type.toUpperCase(),
          operator: fastest.airline || fastest.operator || fastest.name,
          duration: fastest.estimatedTime,
          durationMinutes: fastest.estimatedTimeMinutes,
          distance: fastest.distance,
          estimatedPrice: fastest.estimatedCost,
          convenience: fastest.convenience,
          rating: fastest.rating,
        }
      : null,
    NORMAL: normal
      ? {
          transport: normal._type.toUpperCase(),
          operator: normal.airline || normal.operator || normal.name,
          duration: normal.estimatedTime,
          durationMinutes: normal.estimatedTimeMinutes,
          distance: normal.distance,
          estimatedPrice: normal.estimatedCost,
          convenience: normal.convenience,
          rating: normal.rating,
        }
      : null,
    SAFE: safe
      ? {
          transport: safe._type.toUpperCase(),
          operator: safe.airline || safe.operator || safe.name,
          duration: safe.estimatedTime,
          durationMinutes: safe.estimatedTimeMinutes,
          distance: safe.distance,
          estimatedPrice: safe.estimatedCost,
          convenience: safe.convenience,
          rating: safe.rating,
        }
      : null,
  };
};

module.exports = {
  calculateTravelTime,
  classifyTransportMode,
  calculateConvenience,
  estimateCost,
  enrichWithTravelMode,
  organizeTravelModes,
  selectBestPerMode,
  TRANSPORT_METRICS,
};
