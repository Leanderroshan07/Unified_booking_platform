/**
 * Response Formatter
 * Formats AI responses in the structured format required by the platform
 * Includes travel options, mood-based suggestions, and recommendations
 */

const { selectBestPerMode } = require("./travelModeClassifier");

/**
 * Format travel options by mode
 */
const formatTravelOptions = (transportOptions, distance) => {
  const modes = selectBestPerMode(transportOptions || [], distance || 500);

  return {
    fastest: modes.FASTEST
      ? {
          ...modes.FASTEST,
          label: "FASTEST",
          convenience: "High Speed - Time Priority",
        }
      : null,
    normal: modes.NORMAL
      ? {
          ...modes.NORMAL,
          label: "NORMAL",
          convenience: "Balanced - Time & Cost",
        }
      : null,
    safe: modes.SAFE
      ? {
          ...modes.SAFE,
          label: "SAFE",
          convenience: "Most Reliable - Comfort Priority",
        }
      : null,
  };
};

/**
 * Format travel styles based on purpose
 */
const formatTravelStyles = (purpose, recommendations = {}) => {
  const budgetRecommendations = recommendations.budget || [];
  const economyRecommendations = recommendations.economy || [];
  const luxuryRecommendations = recommendations.luxury || [];

  return {
    budget: {
      label: "BUDGET",
      description: "Most Economical Option",
      hotels: budgetRecommendations
        .filter((r) => r._type === "hotel" && r.starCategory <= 3)
        .slice(0, 3)
        .map((h) => ({
          name: h.name,
          price: h.price,
          rating: h.rating,
          location: h.location,
        })),
      transport: budgetRecommendations
        .filter((r) => r._type === "bus")
        .slice(0, 2)
        .map((t) => ({
          name: t.operator,
          type: t._type,
          price: t.price,
          time: t.duration,
        })),
      activities: budgetRecommendations
        .filter((r) => r._type === "activity" || r._type === "movie")
        .slice(0, 2)
        .map((a) => ({
          name: a.title || a.name,
          type: "movie",
          venue: a.location,
        })),
    },
    economy: {
      label: "ECONOMY",
      description: "Comfortable Mid-Range Option",
      hotels: economyRecommendations
        .filter((r) => r._type === "hotel" && r.starCategory >= 3 && r.starCategory <= 4)
        .slice(0, 3)
        .map((h) => ({
          name: h.name,
          price: h.price,
          rating: h.rating,
          location: h.location,
        })),
      transport: economyRecommendations
        .filter((r) => r._type === "train" || r._type === "bus")
        .slice(0, 2)
        .map((t) => ({
          name: t.operator,
          type: t._type,
          price: t.price,
          time: t.duration,
        })),
      activities: economyRecommendations
        .filter((r) => r._type === "activity" || r._type === "movie")
        .slice(0, 2)
        .map((a) => ({
          name: a.title || a.name,
          type: "movie",
          venue: a.location,
        })),
    },
    luxury: {
      label: "LUXURY",
      description: "Premium First-Class Experience",
      hotels: luxuryRecommendations
        .filter((r) => r._type === "hotel" && r.starCategory >= 4)
        .slice(0, 3)
        .map((h) => ({
          name: h.name,
          price: h.price,
          rating: h.rating,
          location: h.location,
        })),
      transport: luxuryRecommendations
        .filter((r) => r._type === "flight")
        .slice(0, 2)
        .map((t) => ({
          name: t.airline,
          type: t._type,
          price: t.price,
          time: t.duration,
        })),
      activities: luxuryRecommendations
        .filter((r) => r._type === "activity" || r._type === "movie")
        .slice(0, 2)
        .map((a) => ({
          name: a.title || a.name,
          type: "movie",
          venue: a.location,
        })),
    },
  };
};

/**
 * Format additional suggestions based on mood and purpose
 */
const formatAdditionalSuggestions = (context = {}, recommendations = []) => {
  const movies = recommendations.filter((r) => r._type === "activity" || r._type === "movie");
  const hotels = recommendations.filter((r) => r._type === "hotel");
  const attractions = recommendations.filter((r) => r._type === "place" || r._type === "attraction");

  const suggestions = {
    movies: movies.slice(0, 3).map((m) => ({
      name: m.title || m.name,
      genre: m.genre ? m.genre.join(", ") : "General",
      rating: m.rating,
      location: m.location,
    })),
    hotels: hotels.slice(0, 3).map((h) => ({
      name: h.name,
      rating: h.rating,
      price: h.price,
      location: h.location,
      highlights: h.amenities ? h.amenities.slice(0, 2) : [],
    })),
    attractions: attractions.slice(0, 3).map((a) => ({
      name: a.name,
      type: a.type || "Attraction",
      location: a.location,
      description: a.description || "",
    })),
  };

  // Add mood-based suggestions
  if (context.mood?.primary) {
    const mood = context.mood.primary;
    suggestions.moodTip = getMoodBasedTip(mood);
  }

  return suggestions;
};

/**
 * Get mood-based travel tips
 */
const getMoodBasedTip = (mood) => {
  const tips = {
    happy: "You're in great spirits. A high-energy movie or lively city plan would fit you well.",
    sad: "A comforting movie can help lift the mood. I will focus on emotionally supportive movie picks from your database.",
    tired: "You need rest! Book a relaxing spa resort with gentle activities and peaceful surroundings.",
    stressed: "Stress relief is key. Look for meditation centers, yoga retreats, or nature sanctuaries.",
    relaxed: "Perfect mood for leisurely exploration. Consider sightseeing at your own pace, local cuisine tours.",
    romantic: "Plan a memorable journey! Consider sunset cruises, candlelit dinners, luxury hotels with couples packages.",
    adventurous: "Time for excitement! Seek extreme sports, trekking, jungle expeditions, or cultural explorations.",
  };

  return tips[mood] || tips.relaxed;
};

/**
 * Format complete AI response
 */
const formatCompleteResponse = (userContext, transportOptions, recommendations, travelStyles) => {
  const { origin, destination, mood, purpose, budget, distance } = userContext;

  const travelOptions = formatTravelOptions(
    transportOptions || [],
    distance?.km || 500
  );

  const additionalSuggestions = formatAdditionalSuggestions(
    userContext,
    recommendations || []
  );

  const response = {
    // Basic Information
    location: origin || "Current Location",
    destination: destination || "Not Specified",
    distance: distance
      ? {
          km: distance.km,
          category: distance.category,
          estimatedHours: distance.estimatedHours,
        }
      : null,

    // Travel Context
    context: {
      mood: mood?.primary || "neutral",
      moodIntensity: mood?.intensity || 0,
      purpose: purpose?.primary || "vacation",
      budget: budget?.preference || "economy",
      maxBudget: budget?.maxBudget || null,
      travelDate: userContext.travelDate || "Not specified",
    },

    // Core Travel Options
    recommendedTravelOptions: {
      fastest: travelOptions.fastest
        ? {
            transport: travelOptions.fastest.transport,
            operator: travelOptions.fastest.operator,
            duration: travelOptions.fastest.duration,
            estimatedPrice: travelOptions.fastest.estimatedPrice,
            convenience: travelOptions.fastest.convenience,
            rating: travelOptions.fastest.rating,
          }
        : null,
      normal: travelOptions.normal
        ? {
            transport: travelOptions.normal.transport,
            operator: travelOptions.normal.operator,
            duration: travelOptions.normal.duration,
            estimatedPrice: travelOptions.normal.estimatedPrice,
            convenience: travelOptions.normal.convenience,
            rating: travelOptions.normal.rating,
          }
        : null,
      safe: travelOptions.safe
        ? {
            transport: travelOptions.safe.transport,
            operator: travelOptions.safe.operator,
            duration: travelOptions.safe.duration,
            estimatedPrice: travelOptions.safe.estimatedPrice,
            convenience: travelOptions.safe.convenience,
            rating: travelOptions.safe.rating,
          }
        : null,
    },

    // Travel Styles
    travelStyles: travelStyles || {
      budget: { label: "BUDGET", hotels: [], transport: [], activities: [] },
      economy: { label: "ECONOMY", hotels: [], transport: [], activities: [] },
      luxury: { label: "LUXURY", hotels: [], transport: [], activities: [] },
    },

    // Additional Suggestions
    additionalSuggestions,

    // Metadata
    generatedAt: new Date().toISOString(),
  };

  return response;
};

/**
 * Format simple text response for chat display
 */
const formatChatResponse = (userContext, travelOptions, recommendations = []) => {
  const { origin, destination, purpose, requestedCategories = [] } = userContext;
  const fastest = travelOptions.fastest;
  const normal = travelOptions.normal;
  const safe = travelOptions.safe;
  const moodTip = getMoodBasedTip(userContext?.mood?.primary);

  const topHotels = recommendations
    .filter((r) => r._type === "hotel")
    .slice(0, 3);

  const topMovies = recommendations
    .filter((r) => r._type === "activity" || r._type === "movie")
    .slice(0, 3);

  const wantsTransport = requestedCategories.length === 0 || requestedCategories.includes("transport");
  const wantsHotels = requestedCategories.includes("hotel");
  const wantsMovies = requestedCategories.includes("activity");

  let response = `🚀 **Travel Planning Assistant**\n\n`;

  if (userContext?.mood?.primary === "sad") {
    response += `I hear you. Let me keep this simple and gentle for you.\n\n`;
  } else if (userContext?.mood?.primary === "stressed") {
    response += `You sound overloaded. I will focus on the calmest and easiest options from your database.\n\n`;
  } else if (userContext?.mood?.primary === "tired") {
    response += `You need something light and easy. I will keep the suggestions comfortable and low effort.\n\n`;
  }

  response += `📍 **From:** ${origin}\n`;
  response += `🎯 **To:** ${destination || "Not specified"}\n`;
  response += `📖 **Purpose:** ${purpose?.primary || "General travel"}\n\n`;

  if (userContext?.mood?.primary) {
    response += `💡 **Mood Tip:** ${moodTip}\n\n`;
  }

  response += `**Recommended Options:**\n\n`;

  if (wantsTransport && fastest) {
    response += `⚡ **FASTEST**\n`;
    response += `→ ${fastest.transport} via ${fastest.operator}\n`;
    response += `⏱️ ${fastest.duration}\n`;
    response += `💰 ₹${fastest.estimatedPrice}\n\n`;
  }

  if (wantsTransport && normal) {
    response += `⭐ **NORMAL** (Balanced)\n`;
    response += `→ ${normal.transport} via ${normal.operator}\n`;
    response += `⏱️ ${normal.duration}\n`;
    response += `💰 ₹${normal.estimatedPrice}\n\n`;
  }

  if (wantsTransport && safe) {
    response += `🛡️ **SAFE** (Most Comfortable)\n`;
    response += `→ ${safe.transport} via ${safe.operator}\n`;
    response += `⏱️ ${safe.duration}\n`;
    response += `💰 ₹${safe.estimatedPrice}\n`;
  }

  if ((wantsHotels || (!wantsTransport && !wantsMovies)) && topHotels.length > 0) {
    response += `\n🏨 **Top Hotels**\n`;
    topHotels.forEach((h) => {
      response += `→ ${h.name} (${h.location}) • ₹${h.price} • ⭐${h.rating || 0}\n`;
    });
  }

  if ((wantsMovies || (!wantsTransport && !wantsHotels)) && topMovies.length > 0) {
    response += `\n🎬 **Top Movies**\n`;
    topMovies.forEach((m) => {
      const genreText = Array.isArray(m.genre) && m.genre.length > 0 ? m.genre.join(", ") : "General";
      response += `→ ${m.title || m.name} (${genreText}) • ${m.location || "Unknown city"} • ⭐${m.rating || 0}\n`;
    });
  }

  if (!fastest && !normal && !safe && topHotels.length === 0 && topMovies.length === 0) {
    response += `I could not find matching records in your MongoDB data. Add or update movies, hotels, buses, trains, or flights for the cities you want to support.`;
  }

  return response.replace(/\*/g, "");
};

module.exports = {
  formatTravelOptions,
  formatTravelStyles,
  formatAdditionalSuggestions,
  getMoodBasedTip,
  formatCompleteResponse,
  formatChatResponse,
};
