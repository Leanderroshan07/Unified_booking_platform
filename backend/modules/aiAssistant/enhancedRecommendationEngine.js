/**
 * Enhanced Recommendation Engine
 * Filters and ranks recommendations by budget, purpose, mood, and preferences
 */

const KEYWORD_GROUPS = {
  fun: ["fun", "adventure", "entertainment", "exciting", "experience", "active", "thrilling"],
  comfort: ["comfort", "cozy", "relaxed", "peaceful", "quiet", "spa", "resort", "luxury"],
  luxury: ["luxury", "premium", "exclusive", "upscale", "high-end", "elegant", "vip"],
  budget: ["budget", "affordable", "cheap", "economical", "value", "discount"],
  family: ["family", "kids", "children", "baby", "parents", "kid-friendly"],
  business: ["business", "work", "meeting", "conference", "corporate"],
};

const isTransportType = (type) => ["flight", "train", "bus"].includes(String(type || "").toLowerCase());

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const parseFlexibleDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dmYMatch = text.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (dmYMatch) {
    const first = Number(dmYMatch[1]);
    const second = Number(dmYMatch[2]);
    const yearToken = dmYMatch[3];
    const now = new Date();
    const year = yearToken
      ? (yearToken.length === 2 ? Number(`20${yearToken}`) : Number(yearToken))
      : now.getFullYear();
    const month = Math.max(1, Math.min(12, first));
    const day = Math.max(1, Math.min(31, second));
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getDayDiff = (a, b) => Math.round((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));

const isWeekendDate = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const parseTimeToMinutes = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getHours() * 60 + value.getMinutes();
  }

  const text = String(value).trim().toLowerCase();
  if (!text) {
    return null;
  }

  const hhmm = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  const twelveHour = text.match(/\b(1[0-2]|0?[1-9])\s*(am|pm)\b/);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const period = twelveHour[2];
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return hour * 60;
  }

  if (text.includes("morning")) return 10 * 60;
  if (text.includes("afternoon")) return 13 * 60 + 30;
  if (text.includes("evening")) return 19 * 60 + 30;
  if (text.includes("night")) return 22 * 60 + 15;

  return null;
};

const matchesCity = (value, target) => {
  const a = normalizeText(value);
  const b = normalizeText(target);
  if (!a || !b) {
    return false;
  }
  return a === b || a.includes(b) || b.includes(a);
};

const getLocationSignalScore = (item, context) => {
  const desiredOrigin = normalizeText(context.origin) === "current location" ? "" : normalizeText(context.origin);
  const desiredDestination = normalizeText(context.destination || context.origin);

  if (!desiredOrigin && !desiredDestination) {
    return 0;
  }

  if (isTransportType(item._type)) {
    const origin = item.origin || item.location;
    const destination = item.destination || item.location;
    const originMatch = desiredOrigin && matchesCity(origin, desiredOrigin);
    const destinationMatch = desiredDestination && matchesCity(destination, desiredDestination);

    let score = 0;
    if (originMatch) score += 1.8;
    if (destinationMatch) score += 2.2;
    if (originMatch && destinationMatch) score += 1.2;
    return score;
  }

  const itemCity = item.location || item.destination || item.origin;
  if (desiredDestination && matchesCity(itemCity, desiredDestination)) {
    return 2.6;
  }
  if (desiredOrigin && matchesCity(itemCity, desiredOrigin)) {
    return 1.4;
  }

  return desiredDestination ? -0.5 : 0;
};

const getItemDateCandidates = (item) => {
  const candidates = [];
  const add = (value) => {
    const parsed = parseFlexibleDate(value);
    if (parsed) {
      candidates.push(parsed);
    }
  };

  add(item.departureTime);
  add(item.arrivalTime);
  add(item.date);

  if (Array.isArray(item.availableDates)) {
    item.availableDates.forEach(add);
  }

  const unique = [];
  const seen = new Set();
  candidates.forEach((date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(date);
    }
  });

  return unique;
};

const getDatePreferenceScore = (item, context) => {
  const travelDate = normalizeText(context.travelDate);
  if (!travelDate || travelDate === "not specified") {
    return 0;
  }

  const candidates = getItemDateCandidates(item);
  if (candidates.length === 0) {
    return -0.2;
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (travelDate === "today") {
    const minDiff = Math.min(...candidates.map((date) => Math.abs(getDayDiff(date, todayMidnight))));
    if (minDiff === 0) return 2;
    if (minDiff <= 1) return 0.8;
    return -0.3;
  }

  if (travelDate === "tomorrow") {
    const tomorrow = new Date(todayMidnight);
    tomorrow.setDate(todayMidnight.getDate() + 1);
    const minDiff = Math.min(...candidates.map((date) => Math.abs(getDayDiff(date, tomorrow))));
    if (minDiff === 0) return 2;
    if (minDiff <= 1) return 0.8;
    return -0.3;
  }

  if (travelDate === "weekend") {
    return candidates.some(isWeekendDate) ? 1.3 : -0.2;
  }

  if (travelDate === "this week") {
    return candidates.some((date) => {
      const dayDiff = getDayDiff(date, todayMidnight);
      return dayDiff >= 0 && dayDiff <= 7;
    })
      ? 1.1
      : -0.2;
  }

  const requested = parseFlexibleDate(travelDate);
  if (!requested) {
    return 0;
  }

  const minDiff = Math.min(...candidates.map((date) => Math.abs(getDayDiff(date, requested))));
  if (minDiff === 0) return 2.3;
  if (minDiff <= 1) return 1.2;
  if (minDiff <= 2) return 0.5;
  return -0.4;
};

const getItemTimeCandidates = (item) => {
  const values = [];
  const add = (value) => {
    const parsed = parseTimeToMinutes(value);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
    }
  };

  add(item.departureTime);
  add(item.arrivalTime);
  add(item.time);
  add(item.travelTime);

  if (Array.isArray(item.showTimes)) {
    item.showTimes.forEach(add);
  }

  return [...new Set(values)];
};

const getTimePreferenceScore = (item, context) => {
  const requestedMinutes = parseTimeToMinutes(context.travelTime);
  if (!Number.isFinite(requestedMinutes)) {
    return 0;
  }

  const candidates = getItemTimeCandidates(item);
  if (candidates.length === 0) {
    return -0.2;
  }

  const minDelta = Math.min(...candidates.map((value) => Math.abs(value - requestedMinutes)));
  if (minDelta <= 30) return 1.8;
  if (minDelta <= 90) return 1.2;
  if (minDelta <= 180) return 0.6;
  if (minDelta <= 360) return 0.2;
  return -0.2;
};

const MOOD_PROFILES = {
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
  happy: {
    preferred: ["adventure", "fun", "exciting", "thrilling", "entertainment", "party"],
    avoid: [],
  },
  romantic: {
    preferred: ["romantic", "couple", "honeymoon", "dinner", "sunset"],
    avoid: [],
  },
  adventurous: {
    preferred: ["adventure", "trekking", "extreme", "activity", "sports"],
    avoid: [],
  },
};

const buildSearchText = (item) =>
  [
    item.name || "",
    item.title || "",
    item.description || "",
    item.location || "",
    item.tags?.join(" ") || "",
    item.amenities?.join(" ") || "",
    item.genre?.join(" ") || "",
  ]
    .join(" ")
    .toLowerCase();

const getMoodScore = (item, context) => {
  const mood = context?.mood?.primary;
  if (!mood) {
    return 0;
  }

  const profile = MOOD_PROFILES[mood];
  if (!profile) {
    return 0;
  }

  const searchText = buildSearchText(item);
  const preferredMatches = profile.preferred.filter((keyword) => searchText.includes(keyword)).length;
  const avoidMatches = profile.avoid.filter((keyword) => searchText.includes(keyword)).length;

  let score = preferredMatches * 1.2 - avoidMatches * 1.4;

  if ((item._type === "movie" || item._type === "activity") && ["sad", "stressed", "tired"].includes(mood)) {
    score += preferredMatches > 0 ? 2.5 : -2;
  }

  return Math.max(-4.5, Math.min(score, 6));
};

/**
 * Apply budget filters
 */
const applyBudgetFilter = (items, maxBudget, budgetPreference) => {
  if (!maxBudget && !budgetPreference) {
    return items;
  }

  return items.filter((item) => {
    const price = item.price || 0;

    // Hard budget limit
    if (maxBudget && price > maxBudget) {
      return false;
    }

    // Soft filtering by preference (don't exclude, just lower rank)
    if (budgetPreference) {
      if (budgetPreference === "budget" && price > 5000) return false;
      if (budgetPreference === "economy" && price > 15000) return false;
      if (budgetPreference === "luxury" && price < 8000) return false;
    }

    return true;
  });
};

/**
 * Apply purpose-based filtering
 */
const applyPurposeFilter = (items, purpose) => {
  if (!purpose) return items;

  const purposeKeywords = {
    family: ["kid-friendly", "family", "children", "park", "entertainment"],
    business: ["conference", "meeting", "corporate", "wifi", "business center"],
    romantic: ["couple", "romantic", "honeymoon", "dinner", "spa"],
    vacation: ["beach", "resort", "relaxation", "adventure", "scenic"],
    medical: ["hospital", "health", "clinic", "wellness", "medical"],
  };

  const keywords = purposeKeywords[purpose] || [];

  return items
    .map((item) => {
      const searchText = [
        item.name || "",
        item.title || "",
        item.description || "",
        item.tags?.join(" ") || "",
        item.amenities?.join(" ") || "",
        item.genre?.join(" ") || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchCount = keywords.filter((k) => searchText.includes(k)).length;
      return { ...item, purposeMatch: matchCount };
    })
    .sort((a, b) => b.purposeMatch - a.purposeMatch);
};

/**
 * Apply mood-based filtering
 */
const applyMoodFilter = (items, mood) => {
  if (!mood) return items;

  const profile = MOOD_PROFILES[mood] || { preferred: [] };
  const keywords = profile.preferred;

  return items
    .map((item) => {
      const searchText = buildSearchText(item);

      const matchCount = keywords.filter((k) => searchText.includes(k)).length;
      return { ...item, moodMatch: matchCount };
    })
    .sort((a, b) => b.moodMatch - a.moodMatch);
};

/**
 * Calculate quality score (0-10)
 */
const getQualityScore = (item) => {
  const rating = Number(item.rating || item.starCategory || 0);
  const normalized = Math.min(rating, 10);
  const adminBoost = Number(item.recommendationWeight || 5) / 5;
  return Math.min((normalized + adminBoost) / 1.2, 10);
};

/**
 * Calculate relevance score (0-10)
 */
const getRelevanceScore = (item, context) => {
  const searchText = buildSearchText(item);

  let relevance = 4.5;

  relevance += getLocationSignalScore(item, context);
  relevance += getDatePreferenceScore(item, context);
  relevance += getTimePreferenceScore(item, context);

  if (context.mood?.primary && ["sad", "stressed", "tired"].includes(context.mood.primary) && (item._type === "movie" || item._type === "activity")) {
    relevance += 1.5;
  }

  relevance += getMoodScore(item, context);

  // Check keyword matches
  Object.values(KEYWORD_GROUPS).forEach((keywords) => {
    const matches = keywords.filter((k) => searchText.includes(k)).length;
    if (matches > 0) {
      relevance += matches * 0.25;
    }
  });

  return Math.max(0, Math.min(relevance, 10));
};

/**
 * Score item for ranking
 */
const scoreItem = (item, context = {}) => {
  const quality = getQualityScore(item);
  const relevance = getRelevanceScore(item, context);
  const score = Math.round((quality * 0.35 + relevance * 0.65) * 10) / 10;

  return { score };
};

/**
 * Rank results by score
 */
const rankResults = (items, userContext = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items
    .map((item) => {
      const { score } = scoreItem(item, userContext);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
};

/**
 * Filter recommendations by budget, purpose, and mood
 */
const filterRecommendrations = (items, context = {}) => {
  const { budget, purpose, mood } = context;

  let filtered = items;

  // Apply budget filter
  if (budget) {
    filtered = applyBudgetFilter(filtered, budget.maxBudget, budget.preference);
  }

  // Apply purpose filter
  if (purpose?.primary) {
    filtered = applyPurposeFilter(filtered, purpose.primary);
  }

  // Apply mood filter
  if (mood?.primary) {
    filtered = applyMoodFilter(filtered, mood.primary);
  }

  return filtered;
};

/**
 * Organize recommendations by type
 */
const organizeByType = (items) => {
  const organized = {
    transport: [],
    hotels: [],
    activities: [],
    attractions: [],
    other: [],
  };

  items.forEach((item) => {
    if (item._type === "flight" || item._type === "bus" || item._type === "train") {
      organized.transport.push(item);
    } else if (item._type === "hotel") {
      organized.hotels.push(item);
    } else if (item._type === "activity" || item._type === "movie") {
      organized.activities.push(item);
    } else if (item._type === "place" || item._type === "attraction") {
      organized.attractions.push(item);
    } else {
      organized.other.push(item);
    }
  });

  return organized;
};

/**
 * Select top recommendations balanced across types
 */
const selectTopRecommendations = (ranked, limit = 6) => {
  const byType = organizeByType(ranked);
  const result = [];

  // Add items in a balanced way across types
  const maxPerType = Math.ceil(limit / Object.keys(byType).length);

  Object.values(byType).forEach((typeItems) => {
    result.push(...typeItems.slice(0, maxPerType));
  });

  return result.slice(0, limit);
};

/**
 * Get recommendations by budget level
 */
const getRecommendationsByBudget = (items, context = {}) => {
  const categories = {
    budget: [],
    economy: [],
    luxury: [],
  };

  items.forEach((item) => {
    const price = item.price || 0;

    if (item._type === "hotel") {
      if (item.starCategory <= 2 || price <= 3000) {
        categories.budget.push(item);
      } else if (item.starCategory <= 3 || price <= 8000) {
        categories.economy.push(item);
      } else {
        categories.luxury.push(item);
      }
    } else if (item._type === "flight" || item._type === "bus" || item._type === "train") {
      if (price <= 2000) {
        categories.budget.push(item);
      } else if (price <= 8000) {
        categories.economy.push(item);
      } else {
        categories.luxury.push(item);
      }
    } else {
      categories.economy.push(item);
    }
  });

  return categories;
};

module.exports = {
  applyBudgetFilter,
  applyPurposeFilter,
  applyMoodFilter,
  getQualityScore,
  getRelevanceScore,
  scoreItem,
  rankResults,
  filterRecommendrations,
  organizeByType,
  selectTopRecommendations,
  getRecommendationsByBudget,
};
