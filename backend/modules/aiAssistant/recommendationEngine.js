/**
 * Simplified Recommendation Engine
 * 
 * Simple 2-factor scoring: Quality + Relevance
 * Score range: 0-10
 */

const KEYWORD_GROUPS = {
  fun: ["fun", "adventure", "entertainment", "exciting", "experience", "active"],
  comfort: ["comfort", "cozy", "relaxed", "peaceful", "quiet", "spa", "resort"],
  luxury: ["luxury", "premium", "exclusive", "upscale", "high-end", "elegant"],
  budget: ["budget", "affordable", "cheap", "economical", "value", "discount"],
};

const INTENT_KEYWORDS = {
  activity: ["fun", "activity", "movie", "entertainment", "do", "plan", "action"],
  hotel: ["hotel", "stay", "resort", "accommodation", "sleep"],
  transport: ["travel", "transport", "flight", "train", "bus", "route", "go"],
};

const CITY_REGEX = /\b(?:in|at|from|to)\s+(\w+(?:\s+\w+)?)\b/i;

const asNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const inferContextFromMessage = (message = "") => {
  const text = String(message || "").toLowerCase();

  // Extract location (city) - match single or compound city names, stop at conjunctions
  let location = "local area";
  const cityMatch = text.match(/\b(?:in|at|from|to)\s+([a-z]+(?:\s+[a-z]+)*?)(?:\s+(?:and|or|but|want|have|with|are|is)|\s*[,.!?]|$)/i);
  if (cityMatch?.[1]) {
    location = cityMatch[1].trim();
  }

  // Detect intent
  let intent = "general";
  if (INTENT_KEYWORDS.hotel.some((w) => text.includes(w))) {
    intent = "hotel";
  } else if (INTENT_KEYWORDS.transport.some((w) => text.includes(w))) {
    intent = "transport";
  } else if (INTENT_KEYWORDS.activity.some((w) => text.includes(w))) {
    intent = "activity";
  }

  return { location, intent };
};

/**
 * Calculate quality score (0-10)
 * Based on rating and admin boost
 */
const getQualityScore = (item) => {
  const rating = asNumber(item.rating || item.starCategory, 0);
  const normalizedRating = Math.min(rating, 10); // Cap at 10
  const adminBoost = asNumber(item.recommendationWeight, 5) / 5; // 0-2 boost

  const quality = normalizedRating + adminBoost;
  return clamp(quality / 1.2, 0, 10); // Scale to 0-10
};

/**
 * Calculate relevance score (0-10)
 * Based on content matching and intent alignment
 */
const getRelevanceScore = (item, context) => {
  const searchText = [
    item.name || "",
    item.title || "",
    item.description || "",
    item.storyline || "",
    item.location || "",
    ...(item.tags || []),
    ...(item.amenities || []),
    item.genre?.join(" ") || "",
  ]
    .join(" ")
    .toLowerCase();

  const intentText = String(context.intent || "").toLowerCase();

  // Check keyword groups for relevance
  let relevance = 5; // Base relevance
  
  Object.values(KEYWORD_GROUPS).forEach((keywords) => {
    const matches = keywords.filter((k) => searchText.includes(k)).length;
    if (matches > 0) {
      relevance += matches * 0.5;
    }
  });

  // Boost relevance if intent matches
  if (intentText && searchText.includes(intentText)) {
    relevance += 2;
  }

  return clamp(relevance, 0, 10);
};

/**
 * Simple score: Average of quality and relevance
 * Result: 0-10 rating
 */
const scoreItem = (item, context = {}) => {
  const quality = getQualityScore(item);
  const relevance = getRelevanceScore(item, context);
  const score = Math.round((quality + relevance) / 2 * 10) / 10;

  return { score };
};

/**
 * Rank items by score, highest first
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
 * Select top N items, balanced across types
 */
const selectTopRecommendations = (ranked, limit = 6) => {
  const byType = {};
  
  for (const item of ranked) {
    const type = item._type || "general";
    if (!byType[type]) byType[type] = [];
    byType[type].push(item);
  }

  const result = [];
  let keepAdding = true;
  
  while (result.length < limit && keepAdding) {
    keepAdding = false;
    const types = Object.keys(byType);
    
    for (const type of types) {
      if (byType[type].length > 0) {
        result.push(byType[type].shift());
        keepAdding = true;
        if (result.length >= limit) break;
      }
    }
  }

  return result;
};

module.exports = {
  scoreItem,
  rankResults,
  selectTopRecommendations,
  inferContextFromMessage,
};
