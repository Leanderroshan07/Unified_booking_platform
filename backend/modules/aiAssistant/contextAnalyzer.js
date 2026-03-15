/**
 * Advanced Context Analyzer
 * Detects: mood, travel purpose, budget, date, distance, and emotional context
 */

const MOOD_KEYWORDS = {
  happy: ["happy", "excited", "thrilled", "delighted", "overjoyed", "cheerful", "great", "wonderful", "amazing"],
  sad: ["sad", "depressed", "down", "unhappy", "miserable", "disappointed", "heartbroken", "grief"],
  tired: ["tired", "exhausted", "fatigued", "weary", "sleepy", "drained", "worn out"],
  stressed: ["stressed", "anxious", "worried", "tense", "nervous", "overwhelmed", "pressured"],
  relaxed: ["relaxed", "calm", "peaceful", "serene", "chill", "laid back", "chilled"],
  romantic: ["romantic", "love", "couple", "honeymoon", "date", "special someone", "partner"],
  adventurous: ["adventure", "explore", "discover", "thrill", "exciting", "extreme", "adrenaline"],
};

const TRAVEL_PURPOSE_KEYWORDS = {
  family: ["family", "kids", "children", "baby", "parents", "siblings", "relatives"],
  business: ["business", "work", "meeting", "conference", "corporate", "client", "deal"],
  vacation: ["vacation", "holiday", "break", "getaway", "relax", "chill"],
  medical: ["medical", "doctor", "hospital", "health", "treatment", "surgery"],
  education: ["education", "school", "university", "college", "study", "learn"],
  spiritual: ["spiritual", "pilgrimage", "temple", "church", "mosque", "meditation"],
};

const BUDGET_KEYWORDS = {
  budget: ["budget", "cheap", "affordable", "economical", "low cost", "frugal", "discount"],
  economy: ["economy", "mid range", "moderate", "normal", "standard", "average"],
  luxury: ["luxury", "premium", "high end", "upscale", "exclusive", "first class", "vip"],
};

const DISTANCE_MULTIPLIERS = {
  local: { km: 50, hours: 2 },
  regional: { km: 500, hours: 12 },
  national: { km: 1000, hours: 24 },
  international: { km: 5000, hours: 48 },
};

const DATE_REGEX = {
  today: /\b(today|tonight|now)\b/i,
  tomorrow: /\b(tomorrow)\b/i,
  nextDay: /\b(next day|nextday)\b/i,
  week: /\b(this week|next week|within \d+ (days?|weeks?))\b/i,
  weekend: /\b(weekend|friday|saturday|sunday)\b/i,
};

const TIME_REGEX = {
  hhmm: /\b([01]?\d|2[0-3]):([0-5]\d)\b/i,
  twelveHour: /\b(1[0-2]|0?[1-9])\s*(am|pm)\b/i,
};

const STANDALONE_LOCATION_TRAILERS = [
  "movie", "movies", "film", "cinema", "show", "action", "comedy", "drama", "thriller",
  "romance", "romantic", "horror", "adventure", "family", "animation", "sci-fi", "scifi",
  "hotel", "hotels", "stay", "room", "bus", "buses", "train", "trains", "flight", "flights",
  "ticket", "tickets",
].join("|");

const NON_LOCATION_TERMS = /\b(watch|movie|movies|film|cinema|book|ticket|tickets|see|show|plan|planning|hotel|bus|train|flight|sad|happy|stressed|tired|relaxed|romantic|adventurous|entertainment)\b/i;

/**
 * Detect mood from text
 */
const detectMood = (text) => {
  const lowerText = String(text || "").toLowerCase();
  const moods = {};

  Object.entries(MOOD_KEYWORDS).forEach(([mood, keywords]) => {
    const matches = keywords.filter((k) => lowerText.includes(k)).length;
    if (matches > 0) {
      moods[mood] = matches;
    }
  });

  const dominantMood = Object.entries(moods).length > 0
    ? Object.entries(moods).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return {
    primary: dominantMood,
    all: moods,
    intensity: Math.min(Object.values(moods).reduce((a, b) => a + b, 0) / 3, 10),
  };
};

/**
 * Detect travel purpose
 */
const detectTravelPurpose = (text) => {
  const lowerText = String(text || "").toLowerCase();
  const purposes = {};

  Object.entries(TRAVEL_PURPOSE_KEYWORDS).forEach(([purpose, keywords]) => {
    const matches = keywords.filter((k) => lowerText.includes(k)).length;
    if (matches > 0) {
      purposes[purpose] = matches;
    }
  });

  const dominantPurpose = Object.entries(purposes).length > 0
    ? Object.entries(purposes).sort((a, b) => b[1] - a[1])[0][0]
    : "vacation";

  return {
    primary: dominantPurpose,
    all: purposes,
  };
};

/**
 * Detect budget preference
 */
const detectBudgetPreference = (text) => {
  const lowerText = String(text || "").toLowerCase();

  // Extract numeric amount if present
  const amountMatch = text.match(/(?:under|below|within|budget|Rs|₹|\$)\s*[\d,]+/i);
  const amount = amountMatch
    ? parseInt(amountMatch[0].replace(/[^0-9]/g, "")) || null
    : null;

  let preference = "economy";

  Object.entries(BUDGET_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some((k) => lowerText.includes(k))) {
      preference = type;
    }
  });

  return {
    preference,
    maxBudget: amount,
    description: `${preference.charAt(0).toUpperCase() + preference.slice(1)} ${amount ? `(₹${amount})` : ""}`,
  };
};

/**
 * Extract travel date reference
 */
const extractTravelDate = (text) => {
  const when = "not specified";

  if (DATE_REGEX.today.test(text)) return "today";
  if (DATE_REGEX.tomorrow.test(text)) return "tomorrow";
  if (DATE_REGEX.nextDay.test(text)) return "tomorrow";
  if (DATE_REGEX.weekend.test(text)) return "weekend";
  if (DATE_REGEX.week.test(text)) return "this week";

  // Try to extract specific date
  const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/);
  if (dateMatch) return dateMatch[1];

  return when;
};

/**
 * Extract travel time reference
 */
const extractTravelTime = (text) => {
  const message = String(text || "").toLowerCase();

  const hhmmMatch = message.match(TIME_REGEX.hhmm);
  if (hhmmMatch) {
    return `${String(hhmmMatch[1]).padStart(2, "0")}:${hhmmMatch[2]}`;
  }

  const twelveHourMatch = message.match(TIME_REGEX.twelveHour);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const period = twelveHourMatch[2].toLowerCase();

    if (period === "pm" && hour !== 12) {
      hour += 12;
    }
    if (period === "am" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:00`;
  }

  if (/\bmorning\b/.test(message)) return "10:00";
  if (/\bafternoon\b/.test(message)) return "13:30";
  if (/\bevening\b/.test(message)) return "19:30";
  if (/\bnight\b/.test(message)) return "22:15";

  return "not specified";
};

/**
 * Estimate distance category and travel time
 */
const estimateDistance = (origin, destination) => {
  // Rough estimates - in production use real distance API
  const cityPairs = {
    "dubai-mumbai": 1200,
    "dubai-bangalore": 1400,
    "dubai-london": 5500,
    "mumbai-bangalore": 800,
    "new-york-los-angeles": 3900,
  };

  const key = [origin, destination].sort().join("-").toLowerCase();
  const km = cityPairs[key] || 500; // Default to regional

  let category = "local";
  if (km > 4000) category = "international";
  else if (km > 1000) category = "national";
  else if (km > 50) category = "regional";

  return {
    km,
    category,
    estimatedHours: Math.ceil(km / 80), // Rough average
  };
};

/**
 * Comprehensive context analysis
 */
const analyzeUserContext = (message, existingContext = {}) => {
  const mood = detectMood(message);
  const purpose = detectTravelPurpose(message);
  const budget = detectBudgetPreference(message);
  const travelDate = extractTravelDate(message);
  const travelTime = extractTravelTime(message);

  const cleanLocation = (value) =>
    String(value || "")
      .replace(/^(show|find|give|suggest|recommend|book|need|want)(\s+me)?\s+/i, "")
      .replace(/\b(for|with|during|while|because|about|regarding|under|within|near|watch|book|see|enjoy|get)\b.*$/i, "")
      .replace(/\b(action|comedy|drama|thriller|horror|romance|romantic|adventure|family|animation|sci\s*-?\s*fi|scifi)\b\s*$/i, "")
      .replace(/\b(next\s+day|next|today|tomorrow|weekend|this\s+week)\b.*$/i, "")
      .replace(/\bto\b\s*$/i, "")
      .replace(/\bi\b\s*$/i, "")
      .replace(/[.,!?]+$/g, "")
      .trim();

  const isLikelyLocation = (value) => {
    const cleaned = cleanLocation(value);
    return Boolean(cleaned) && !NON_LOCATION_TERMS.test(cleaned);
  };

  const fromToMatch = String(message || "").match(
    /\bfrom\s+([a-z]+(?:\s+[a-z]+){0,2})\s+to\s+([a-z]+(?:\s+[a-z]+){0,2})\b/i
  );
  const visitMatch = String(message || "").match(
    /\b(?:go|travel|visit|trip)\s+(?:to\s+)?([a-z]+(?:\s+[a-z]+){0,2})(?=\s+(?:from|for|with|on|next|this|today|tomorrow|weekend|and|but|to\s+(?:watch|book|see|enjoy))|\s*[,.!?]|$)/i
  );
  const forToMatch = String(message || "").match(
    /\bfor\s+([a-z]+(?:\s+[a-z]+){0,2})\s+to\s+([a-z]+(?:\s+[a-z]+){0,2})\b/i
  );
  const standaloneLocationMatch = String(message || "").match(
    new RegExp(`\\b(?:show|find|give|suggest|recommend|book|need|want)?\\s*(?:me\\s+)?([a-z]+(?:\\s+[a-z]+){0,2})\\s+(?:${STANDALONE_LOCATION_TRAILERS})\\b`, "i")
  );

  // Extract locations
  const cityRegex = /\b(?:in|at|from|to)\s+([a-z]+(?:\s+[a-z]+)*?)(?:\s+(?:and|or|but|want|have|with|for|during|while|because|about|looking|seeking|need|needs|please|watch|book|see|movie|movies|film|ticket|tickets|feel|feeling|i|are|is|this|next|today|tomorrow|weekend)|\s*[,.!?]|$)/gi;
  const locations = [];
  let match;
  while ((match = cityRegex.exec(message)) !== null) {
    if (isLikelyLocation(match[1])) {
      locations.push(cleanLocation(match[1]));
    }
  }

  let origin = locations[0] || existingContext.location || "current location";
  let destination = locations[1] || existingContext.destination || null;

  // Prefer explicit route patterns when present.
  if (fromToMatch) {
    if (isLikelyLocation(fromToMatch[1])) {
      origin = cleanLocation(fromToMatch[1]);
    }
    if (isLikelyLocation(fromToMatch[2])) {
      destination = cleanLocation(fromToMatch[2]);
    }
  } else if (forToMatch) {
    if (isLikelyLocation(forToMatch[1])) {
      origin = cleanLocation(forToMatch[1]);
    }
    if (isLikelyLocation(forToMatch[2])) {
      destination = cleanLocation(forToMatch[2]);
    }
  }

  if (visitMatch && isLikelyLocation(visitMatch[1]) && (!destination || destination === origin)) {
    destination = cleanLocation(visitMatch[1]);
  }

  if (standaloneLocationMatch && isLikelyLocation(standaloneLocationMatch[1])) {
    const inferredCity = cleanLocation(standaloneLocationMatch[1]);
    if (!destination || destination === "current location") {
      destination = inferredCity;
    }
    if (origin === "current location" && !destination) {
      origin = inferredCity;
    }
  }

  const hasExplicitLocation = Boolean(fromToMatch || forToMatch || visitMatch || standaloneLocationMatch || locations.length > 0);
  const hasExplicitRoute = Boolean(fromToMatch || forToMatch);

  const distance = destination ? estimateDistance(origin, destination) : null;

  return {
    mood,
    purpose,
    budget,
    travelDate,
    travelTime,
    origin,
    destination,
    hasExplicitLocation,
    hasExplicitRoute,
    distance,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  detectMood,
  detectTravelPurpose,
  detectBudgetPreference,
  extractTravelDate,
  extractTravelTime,
  estimateDistance,
  analyzeUserContext,
  MOOD_KEYWORDS,
  TRAVEL_PURPOSE_KEYWORDS,
  BUDGET_KEYWORDS,
};
