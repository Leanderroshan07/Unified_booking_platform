const { executeTool } = require("./tools");
const { buildMapMarkers } = require("./mapService");
const { analyzeUserContext, estimateDistance } = require("./contextAnalyzer");
const {
  analyzeUserMessage,
  generateTravelReply,
  isConfigured: isGeminiConfigured,
} = require("./geminiService");
const { selectBestPerMode } = require("./travelModeClassifier");
const {
  filterRecommendrations,
  rankResults,
  selectTopRecommendations,
  getRecommendationsByBudget,
} = require("./enhancedRecommendationEngine");
const {
  formatCompleteResponse,
  formatChatResponse,
  formatTravelStyles,
} = require("./responseFormatter");
const {
  getAllRoutes,
  getRoutesByBudget,
} = require("./travelRouteCalculator");
const { getRouteByCities } = require("../../services/routeMatrixService");

const SYSTEM_INSTRUCTION = `You are an intelligent travel assistant. Understand user intent, mood, budget, and travel needs. Provide smart predictions and recommendations for travel modes, transport options, accommodations, and activities.`;

let cachedLangChain = null;

const loadLangChain = async () => {
  // Kept for backward compatibility
  return null;
};

const normalizeCategory = (type) => {
  if (["bus", "train", "flight"].includes(type)) return "transport";
  if (type === "activity" || type === "movie") return "activity";
  if (type === "hotel") return "hotel";
  if (type === "place" || type === "attraction") return "place";
  return "other";
};

const BOOKING_KEYWORDS = /\b(book|booking|reserve|buy|get me|confirm)\b/i;
const MOVIE_KEYWORDS = /\b(movie|movies|film|cinema|show|ticket|tickets|seat|seats)\b/i;
const GEMINI_FALLBACK_NOTE = "Note: Gemini is unavailable, so I used deterministic mode.";

const normalizeIntentText = (value) => {
  const text = String(value || "").toLowerCase();
  const replacements = [
    [/\bhotle\b|\bhotal\b|\bhotl\b/g, "hotel"],
    [/\bflite\b|\bfligt\b|\bfliy?ght\b/g, "flight"],
    [/\btrian\b|\btraiin\b|\btrainn\b/g, "train"],
    [/\bmoive\b|\bmvoie\b|\bmovi\b/g, "movie"],
    [/\bbokking\b|\bboooking\b|\bresrv\b/g, "booking"],
  ];

  return replacements.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
};

const extractMovieTitleHint = (message) => {
  const quoted = String(message || "").match(/["']([^"']+)["']/);
  if (quoted) {
    return quoted[1].trim();
  }

  const namedMovie = String(message || "").match(/\b(?:movie|film)\s+([a-z0-9][a-z0-9\s:&'-]{1,60})/i);
  if (!namedMovie) {
    return null;
  }

  const candidate = namedMovie[1].trim();
  if (/^(in|at|from|to|for)\b/i.test(candidate)) {
    return null;
  }

  return candidate;
};

const buildMovieBookingReply = (bookingResult) => {
  if (!bookingResult) {
    return "I could not create a movie booking from your database because no matching movie was found.";
  }

  const scheduleNote = bookingResult.scheduleUpdated
    ? ` I also added ${bookingResult.bookingDateMissingInAdmin ? "the requested date" : ""}${bookingResult.bookingDateMissingInAdmin && bookingResult.bookingTimeMissingInAdmin ? " and " : ""}${bookingResult.bookingTimeMissingInAdmin ? "the requested time" : ""} to admin movie schedule for future bookings.`
    : "";

  if (bookingResult.status === "unavailable") {
    return `I found ${bookingResult.movie.title}, but there are only ${bookingResult.remainingSeats} seats left for ${bookingResult.date} at ${bookingResult.time}.${scheduleNote}`;
  }

  const seatLabel = bookingResult.seats.map((seat) => seat.id).join(", ");
  return `Your movie ticket is confirmed for ${bookingResult.movie.title} in ${bookingResult.movie.location} on ${bookingResult.date} at ${bookingResult.time}. Seats: ${seatLabel}. Total: ₹${bookingResult.totalPrice}. Booking ID: ${bookingResult.bookingId}.${scheduleNote}`;
};

const isMovieBookingRequest = (message) =>
  BOOKING_KEYWORDS.test(String(message || "")) && MOVIE_KEYWORDS.test(String(message || ""));

const normalizeGeminiText = (value) => {
  const text = String(value || "").trim();
  return text ? text : null;
};

const mergeGeminiContext = (baseContext = {}, gemini = {}) => {
  const merged = {
    ...baseContext,
    mood: { ...(baseContext.mood || {}) },
    purpose: { ...(baseContext.purpose || {}) },
    budget: { ...(baseContext.budget || {}) },
  };

  const mood = normalizeGeminiText(gemini.mood);
  if (mood && mood !== "neutral") {
    merged.mood.primary = mood.toLowerCase();
  }

  const moodIntensity = Number(gemini.moodIntensity);
  if (Number.isFinite(moodIntensity) && moodIntensity > 0) {
    merged.mood.intensity = Math.max(1, Math.min(10, moodIntensity));
  }

  const purpose = normalizeGeminiText(gemini.purpose);
  if (purpose) {
    merged.purpose.primary = purpose.toLowerCase();
  }

  const budget = normalizeGeminiText(gemini.budget);
  if (budget && budget !== "any") {
    merged.budget.preference = budget.toLowerCase();
  }

  const maxBudget = Number(gemini.maxBudget);
  if (Number.isFinite(maxBudget) && maxBudget > 0) {
    merged.budget.maxBudget = maxBudget;
  }

  const origin = normalizeGeminiText(gemini.origin);
  const destination = normalizeGeminiText(gemini.destination);

  if (origin) {
    merged.origin = origin;
  }

  if (destination) {
    merged.destination = destination;
  }

  if (merged.origin && merged.destination) {
    merged.distance = estimateDistance(merged.origin, merged.destination);
  }

  return merged;
};

const applyGeminiIntentHints = (intent = {}, gemini = {}) => {
  const categories = new Set(intent.requestedCategories || []);
  const transportTypes = new Set(intent.requestedTransportTypes || []);

  const preferredTransport = String(gemini.preferredTransport || "").toLowerCase();
  if (["flight", "train", "bus"].includes(preferredTransport)) {
    categories.add("transport");
    transportTypes.add(preferredTransport);
  }

  if (gemini.isEmotional === true && categories.size === 0) {
    categories.add("activity");
  }

  return {
    ...intent,
    requestedCategories: [...categories],
    requestedTransportTypes: [...transportTypes],
  };
};

const markGeminiUnavailable = (state, plannerSteps) => {
  state.unavailable = true;
  if (!state.fallbackNoted) {
    plannerSteps.push("⚠️ Gemini is unavailable, switching to deterministic mode.");
    state.fallbackNoted = true;
  }
};

const appendGeminiFallbackNote = (reply, geminiState) => {
  if (!geminiState.unavailable) {
    return reply;
  }

  const current = String(reply || "").trim();
  if (current.toLowerCase().includes("gemini is unavailable")) {
    return current;
  }

  return `${current}\n\n${GEMINI_FALLBACK_NOTE}`;
};

const stripAsterisksForVoice = (text) => String(text || "").replace(/\*/g, "").trim();

const finalizeReply = (reply, geminiState) =>
  stripAsterisksForVoice(appendGeminiFallbackNote(reply, geminiState));

const MOOD_HINTS = {
  happy: ["fun", "adventure", "exciting", "entertainment"],
  sad: ["feel-good", "uplifting", "comfort", "hopeful", "heartwarming"],
  tired: ["relax", "spa", "resort", "comfort"],
  stressed: ["relax", "calm", "meditation", "wellness"],
  romantic: ["romantic", "couple", "honeymoon", "sunset"],
  adventurous: ["adventure", "thrill", "trek", "extreme"],
};

const parseDurationToMinutes = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const text = String(value).toLowerCase();

  const hourMatch = text.match(/(\d+)\s*h/);
  const minuteMatch = text.match(/(\d+)\s*m/);

  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return hours * 60 + minutes;
  }

  const hhmm = text.match(/(\d{1,2}):(\d{2})/);
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  const raw = Number(text.replace(/[^0-9.]/g, ""));
  return Number.isFinite(raw) && raw > 0 ? raw : Number.POSITIVE_INFINITY;
};

const getTransportMinutes = (item) => {
  const mode = String(item?._type || "").toLowerCase();
  const routeMinutes = item?.routeMeta?.travelMinutes?.[mode];
  if (Number.isFinite(Number(routeMinutes)) && Number(routeMinutes) > 0) {
    return Number(routeMinutes);
  }

  const durationMinutes = parseDurationToMinutes(item?.duration || item?.travelTime);
  return Number.isFinite(durationMinutes) ? durationMinutes : Number.POSITIVE_INFINITY;
};

const formatMinutes = (minutes) => {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  const hours = Math.floor(value / 60);
  const mins = Math.round(value % 60);
  return `${hours}h ${mins}m`;
};

const inferUserIntent = (userMessage, existingContext = {}) => {
  const text = normalizeIntentText(userMessage);
  const hasOnlyModifier = /\bonly\b|\bjust\b|\bstrictly\b/.test(text);
  const hasPlanningSignal = /\b(plan|planning|trip|travel|vacation|holiday|go|visit)\b/.test(text);
  const hasMovieSignal = /\bmovie\b|\bmovies\b|\bfilm\b|\bcinema\b|\bshow\b/.test(text);
  const hasHotelSignal = /\bhotel\b|\bhotels\b|\bstay\b|\broom\b|\bresort\b|\baccommodation\b/.test(text);
  const hasRouteSignal = /\bfrom\b|\bto\b|\bflight\b|\bflights\b|\btrain\b|\btrains\b|\bbus\b|\bbuses\b|\bplane\b|\bplanes\b/.test(text);
  const hasTravelSignal = /\btravel\b|\bjourney\b|\broute\b|\bcommute\b|\breach\b/.test(text);
  const isEmotionalQuery = /\bfeel\b|\bfeeling\b|\bsad\b|\bhappy\b|\bstressed\b|\btired\b|\brelaxed\b|\bromantic\b/.test(text);
  const preferFastest = /\bfastest\b|\bquickest\b|\bshortest\s+time\b|\basap\b|\bsoonest\b/.test(text);
  const isDistanceQuery = /\bdistance\b|\bhow\s+far\b/.test(text);

  const hasCategorySignals = /\bmovie\b|\bmovies\b|\bfilm\b|\bcinema\b|\bshow\b|\bhotel\b|\bhotels\b|\bstay\b|\broom\b|\bresort\b|\baccommodation\b|\bbus\b|\bbuses\b|\btrain\b|\btrains\b|\bflight\b|\bflights\b|\bplane\b|\bplanes\b/.test(text);

  const categories = new Set(
    hasCategorySignals
      ? []
      : Array.isArray(existingContext.requestedCategories)
      ? existingContext.requestedCategories
      : []
  );

  const requestedTransportTypes = new Set(
    hasCategorySignals
      ? []
      : Array.isArray(existingContext.requestedTransportTypes)
      ? existingContext.requestedTransportTypes
      : []
  );

  if (hasMovieSignal) {
    categories.add("activity");
  }

  if (hasHotelSignal) {
    categories.add("hotel");
  }

  if (/\bbus\b|\bbuses\b/.test(text)) {
    categories.add("transport");
    requestedTransportTypes.add("bus");
  }

  if (/\btrain\b|\btrains\b/.test(text)) {
    categories.add("transport");
    requestedTransportTypes.add("train");
  }

  if (/\bflight\b|\bflights\b|\bplane\b|\bplanes\b/.test(text)) {
    categories.add("transport");
    requestedTransportTypes.add("flight");
  }

  if (hasRouteSignal || hasTravelSignal || isDistanceQuery || preferFastest) {
    categories.add("transport");
  }

  if (!hasCategorySignals && isEmotionalQuery && !hasRouteSignal) {
    categories.add("activity");
  }

  if (hasHotelSignal && !hasMovieSignal && !hasRouteSignal) {
    categories.add("hotel");
  }

  if (hasPlanningSignal && !hasCategorySignals && !isEmotionalQuery) {
    categories.add("hotel");
    categories.add("transport");
  }

  const categoryList = [...categories];
  const strictCategoryMatch = hasOnlyModifier || categoryList.length === 1;

  return {
    requestedCategories: categoryList,
    requestedTransportTypes: [...requestedTransportTypes],
    strictCategoryMatch,
    preferFastest,
    isDistanceQuery,
  };
};

const buildFetchPlan = (intent) => {
  const requested = intent.requestedCategories || [];

  const includeTransport = requested.length === 0 || requested.includes("transport");
  const includeHotels = requested.length === 0 || requested.includes("hotel");
  const includeActivities = requested.length === 0 || requested.includes("activity");
  const includePlaces = false;

  return {
    includeTransport,
    includeHotels,
    includeActivities,
    includePlaces,
    requestedTransportTypes: intent.requestedTransportTypes || [],
  };
};

const applyIntentAndMoodAdjustments = (items, context, intent) => {
  const mood = context?.mood?.primary;
  const moodHints = MOOD_HINTS[mood] || [];
  const requestedCategories = intent?.requestedCategories || [];
  const requestedTransportTypes = intent?.requestedTransportTypes || [];

  return items
    .map((item) => {
      let adjustedScore = Number(item.score || 0);

      const category = normalizeCategory(item._type);
      if (requestedCategories.length > 0) {
        if (requestedCategories.includes(category)) {
          adjustedScore += 2.2;
        } else if (intent.strictCategoryMatch) {
          adjustedScore -= 1.8;
        }
      }

      if (requestedTransportTypes.length > 0 && ["bus", "train", "flight"].includes(item._type)) {
        adjustedScore += requestedTransportTypes.includes(item._type) ? 1.8 : -1.2;
      }

      if (moodHints.length > 0) {
        const searchable = [
          item.name,
          item.title,
          item.description,
          Array.isArray(item.tags) ? item.tags.join(" ") : "",
          Array.isArray(item.genre) ? item.genre.join(" ") : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matches = moodHints.filter((hint) => searchable.includes(hint)).length;
        adjustedScore += Math.min(matches * 0.6, 2.4);
      }

      return {
        ...item,
        score: Math.round(adjustedScore * 10) / 10,
      };
    })
    .sort((a, b) => b.score - a.score);
};

const normalizeCityValue = (value) => String(value || "").trim().toLowerCase();

const cityMatches = (a, b) => {
  const x = normalizeCityValue(a);
  const y = normalizeCityValue(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
};

const applyStrictLocationFilter = (items = [], context = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  if (!context?.hasExplicitLocation) {
    return items;
  }

  const targetDestination = normalizeCityValue(context.destination);
  const targetOrigin = normalizeCityValue(context.origin) !== "current location"
    ? normalizeCityValue(context.origin)
    : "";
  const targetCity = targetDestination || targetOrigin;

  if (!targetCity) {
    return items;
  }

  return items.filter((item) => {
    if (["bus", "train", "flight"].includes(item?._type)) {
      const hasDestination = cityMatches(item.destination || item.location, targetDestination || targetCity);

      if (context.hasExplicitRoute && targetOrigin && targetDestination) {
        const hasOrigin = cityMatches(item.origin || item.location, targetOrigin);
        return hasOrigin && hasDestination;
      }

      const hasOrigin = targetOrigin ? cityMatches(item.origin || item.location, targetOrigin) : false;
      return hasDestination || hasOrigin;
    }

    return cityMatches(item.location || item.destination || item.origin, targetCity);
  });
};

const NO_DB_DATA_REPLY = "I could not find matching records in your MongoDB data for this request. Please add the required city/category data in admin (movies, hotels, trains, buses, or flights).";

const runFallbackToolPass = async (context, collectedItems, fetchPlan = {}, userMessage = "") => {
  const { origin, destination } = context;
  const localLocation = origin !== "current location" ? origin : undefined;
  const transportOrigin = origin !== "current location" ? origin : undefined;
  const {
    includeTransport = true,
    includeHotels = true,
    includeActivities = true,
    includePlaces = true,
    requestedTransportTypes = [],
  } = fetchPlan;

  // Fetch transport options if destination is mentioned
  if (includeTransport && destination) {
    try {
      if (requestedTransportTypes.length > 0) {
        for (const type of requestedTransportTypes) {
          const rows = await executeTool("getTransportOptions", {
            origin: transportOrigin,
            destination,
            type,
            limit: 8,
          });
          if (Array.isArray(rows)) {
            collectedItems.push(...rows);
          }
        }
      } else {
        const transportRows = await executeTool("getTransportOptions", {
          origin: transportOrigin,
          destination,
          limit: 8,
        });
        if (Array.isArray(transportRows)) collectedItems.push(...transportRows);
      }
    } catch (e) {
      console.error("Error fetching transport:", e);
    }
  }

  // Fetch hotels
  if (includeHotels) {
    try {
      const hotelRows = await executeTool("getHotels", {
        city: destination || localLocation,
        limit: 6,
      });
      if (Array.isArray(hotelRows)) collectedItems.push(...hotelRows);
    } catch (e) {
      console.error("Error fetching hotels:", e);
    }
  }

  // Fetch activities and movies
  if (includeActivities) {
    try {
      const activityRows = await executeTool("getActivities", {
        city: destination || localLocation,
        mood: context.mood?.primary,
        message: userMessage,
        limit: 6,
      });
      if (Array.isArray(activityRows)) collectedItems.push(...activityRows);
    } catch (e) {
      console.error("Error fetching activities:", e);
    }
  }

  // Fetch nearby places
  if (includePlaces && localLocation) {
    try {
      const placeRows = await executeTool("getNearbyPlaces", {
        city: localLocation,
        limit: 4,
      });
      if (Array.isArray(placeRows)) collectedItems.push(...placeRows);
    } catch (e) {
      console.error("Error fetching nearby places:", e);
    }
  }
};

const runPlannerAgent = async (userMessage, context = {}) => {
  const plannerSteps = [];
  const collectedItems = [];

  try {
    const geminiState = {
      configured: isGeminiConfigured(),
      intentUsed: false,
      replyUsed: false,
      unavailable: false,
      fallbackNoted: false,
    };

    let geminiIntent = null;

    // Step 1: Analyze user context
    plannerSteps.push("🔍 Analyzing your travel requirements...");
    let userContext = analyzeUserContext(userMessage, context);

    if (geminiState.configured) {
      plannerSteps.push("🧠 Understanding intent with Gemini...");
      geminiIntent = await analyzeUserMessage(userMessage);

      if (geminiIntent) {
        userContext = mergeGeminiContext(userContext, geminiIntent);
        geminiState.intentUsed = true;
      } else {
        markGeminiUnavailable(geminiState, plannerSteps);
      }
    } else {
      markGeminiUnavailable(geminiState, plannerSteps);
    }

    let intent = inferUserIntent(userMessage, context);
    intent = applyGeminiIntentHints(intent, geminiIntent || {});
    userContext.requestedCategories = intent.requestedCategories;
    userContext.requestedTransportTypes = intent.requestedTransportTypes;
    userContext.strictCategoryMatch = intent.strictCategoryMatch;

    let routeMatrix = null;
    if (userContext.origin && userContext.destination) {
      try {
        routeMatrix = await getRouteByCities(userContext.origin, userContext.destination);
      } catch (routeError) {
        console.error("[AI Assistant] Route matrix lookup failed:", routeError?.message || routeError);
      }
    }

    if (routeMatrix) {
      userContext.distance = {
        km: routeMatrix.distanceKm,
        category: routeMatrix.distanceKm > 4000 ? "international" : routeMatrix.distanceKm > 1000 ? "national" : routeMatrix.distanceKm > 80 ? "regional" : "local",
        estimatedHours: Math.ceil(routeMatrix.distanceKm / 80),
      };
    }

    if (intent.isDistanceQuery && routeMatrix) {
      const fastest = routeMatrix.fastestMode ? `${routeMatrix.fastestMode} (${formatMinutes(routeMatrix.fastestMinutes)})` : "N/A";
      return {
        reply: finalizeReply(
          `Distance from ${routeMatrix.from} to ${routeMatrix.to} is about ${routeMatrix.distanceKm} km. Estimated travel times: Flight ${formatMinutes(routeMatrix.travelMinutes?.flight)}, Train ${formatMinutes(routeMatrix.travelMinutes?.train)}, Bus ${formatMinutes(routeMatrix.travelMinutes?.bus)}. Fastest option: ${fastest}.`,
          geminiState
        ),
        response: null,
        recommendations: [],
        plannerSteps,
        detectedContext: {
          mood: userContext.mood?.primary,
          purpose: userContext.purpose?.primary,
          budget: userContext.budget?.preference,
          maxBudget: userContext.budget?.maxBudget,
          location: userContext.origin,
          destination: userContext.destination,
          travelDate: userContext.travelDate,
          distance: userContext.distance,
          requestedCategories: userContext.requestedCategories || [],
          requestedTransportTypes: userContext.requestedTransportTypes || [],
          strictCategoryMatch: userContext.strictCategoryMatch || false,
          geminiUnavailable: geminiState.unavailable,
        },
        mapMarkers: [],
        gemini: {
          configured: geminiState.configured,
          intentUsed: geminiState.intentUsed,
          replyUsed: geminiState.replyUsed,
          fallbackUsed: geminiState.unavailable,
        },
      };
    }

    if (isMovieBookingRequest(userMessage)) {
      plannerSteps.push("🎟️ Creating your movie ticket booking from MongoDB...");
      const bookingResult = await executeTool("createMovieTicketBooking", {
        userId: context.userId,
        message: userMessage,
        city: userContext.destination || userContext.origin,
        title: extractMovieTitleHint(userMessage),
        travelDate: userContext.travelDate,
      });

      if (bookingResult && bookingResult.movie) {
        const bookingRecommendation = {
          _type: "movie",
          _id: String(bookingResult.movie._id),
          name: bookingResult.movie.title,
          title: bookingResult.movie.title,
          location: bookingResult.movie.location,
          rating: bookingResult.movie.rating,
          genre: bookingResult.movie.genre || [],
          description: bookingResult.movie.storyline || bookingResult.movie.description || "",
          score: bookingResult.movie.recommendationWeight || bookingResult.movie.popularityScore || bookingResult.movie.rating || 0,
          source: "db",
        };

        return {
          reply: finalizeReply(buildMovieBookingReply(bookingResult), geminiState),
          response: {
            bookingConfirmation: {
              status: bookingResult.status,
              bookingId: bookingResult.bookingId || null,
              movieTitle: bookingResult.movie.title,
              location: bookingResult.movie.location,
              date: bookingResult.date,
              time: bookingResult.time,
              seats: bookingResult.seats ? bookingResult.seats.map((seat) => seat.id) : [],
              totalPrice: bookingResult.totalPrice || null,
              scheduleUpdated: Boolean(bookingResult.scheduleUpdated),
              bookingDateMissingInAdmin: Boolean(bookingResult.bookingDateMissingInAdmin),
              bookingTimeMissingInAdmin: Boolean(bookingResult.bookingTimeMissingInAdmin),
            },
          },
          recommendations: [bookingRecommendation],
          plannerSteps,
          detectedContext: {
            mood: userContext.mood?.primary,
            purpose: userContext.purpose?.primary,
            budget: userContext.budget?.preference,
            maxBudget: userContext.budget?.maxBudget,
            location: userContext.origin,
            destination: userContext.destination,
            travelDate: userContext.travelDate,
            distance: userContext.distance,
            requestedCategories: userContext.requestedCategories || [],
            requestedTransportTypes: userContext.requestedTransportTypes || [],
            strictCategoryMatch: true,
          },
          mapMarkers: buildMapMarkers([bookingRecommendation]),
          gemini: {
            configured: geminiState.configured,
            intentUsed: geminiState.intentUsed,
            replyUsed: geminiState.replyUsed,
            fallbackUsed: geminiState.unavailable,
          },
        };
      }

      return {
        reply: finalizeReply("I could not find matching movie records in your MongoDB data. Please add the movie in admin for this city and try again.", geminiState),
        response: null,
        recommendations: [],
        plannerSteps,
        detectedContext: {
          mood: userContext.mood?.primary,
          purpose: userContext.purpose?.primary,
          budget: userContext.budget?.preference,
          maxBudget: userContext.budget?.maxBudget,
          location: userContext.origin,
          destination: userContext.destination,
          travelDate: userContext.travelDate,
          distance: userContext.distance,
          requestedCategories: userContext.requestedCategories || [],
          requestedTransportTypes: userContext.requestedTransportTypes || [],
          strictCategoryMatch: true,
          hasExplicitLocation: Boolean(userContext.hasExplicitLocation),
        },
        mapMarkers: [],
        gemini: {
          configured: geminiState.configured,
          intentUsed: geminiState.intentUsed,
          replyUsed: geminiState.replyUsed,
          fallbackUsed: geminiState.unavailable,
        },
      };
    }

    // Step 2: Fetch recommendations from database
    plannerSteps.push("📍 Searching for matching options...");
    await runFallbackToolPass(userContext, collectedItems, buildFetchPlan(intent), userMessage);

    // Step 3: Filter recommendations based on user context
    plannerSteps.push("🎯 Filtering options by your preferences...");
    let filtered = filterRecommendrations(collectedItems, userContext);

    // Step 4: Rank and select top recommendations
    plannerSteps.push("⭐ Ranking options by relevance...");
    let ranked = rankResults(filtered, userContext);
    ranked = applyIntentAndMoodAdjustments(ranked, userContext, intent);
    ranked = applyStrictLocationFilter(ranked, userContext);

    let recommendationPool = ranked;
    if (intent.requestedCategories.length > 0) {
      const byCategory = ranked.filter((item) =>
        intent.requestedCategories.includes(normalizeCategory(item._type))
      );
      if (byCategory.length > 0) {
        recommendationPool = byCategory;
      }
    }

    if (intent.requestedTransportTypes.length > 0) {
      const byTransportType = recommendationPool.filter((item) =>
        intent.requestedTransportTypes.includes(item._type)
      );
      if (byTransportType.length > 0) {
        recommendationPool = byTransportType;
      }
    }

    if (intent.preferFastest) {
      const transportItems = recommendationPool.filter((item) => ["flight", "train", "bus"].includes(item._type));
      const nonTransportItems = recommendationPool.filter((item) => !["flight", "train", "bus"].includes(item._type));

      if (transportItems.length > 0) {
        const fastestTransport = [...transportItems].sort((a, b) => getTransportMinutes(a) - getTransportMinutes(b));
        recommendationPool = intent.requestedCategories.includes("transport")
          ? fastestTransport
          : [...fastestTransport, ...nonTransportItems];
      }
    }

    const recommendations = intent.strictCategoryMatch
      ? recommendationPool.slice(0, 12)
      : selectTopRecommendations(recommendationPool, 12);

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return {
        reply: finalizeReply(NO_DB_DATA_REPLY, geminiState),
        response: null,
        recommendations: [],
        plannerSteps,
        detectedContext: {
          mood: userContext.mood?.primary,
          purpose: userContext.purpose?.primary,
          budget: userContext.budget?.preference,
          maxBudget: userContext.budget?.maxBudget,
          location: userContext.origin,
          destination: userContext.destination,
          travelDate: userContext.travelDate,
          distance: userContext.distance,
          requestedCategories: userContext.requestedCategories || [],
          requestedTransportTypes: userContext.requestedTransportTypes || [],
          strictCategoryMatch: userContext.strictCategoryMatch || false,
          hasExplicitLocation: Boolean(userContext.hasExplicitLocation),
          geminiUnavailable: geminiState.unavailable,
        },
        mapMarkers: [],
        gemini: {
          configured: geminiState.configured,
          intentUsed: geminiState.intentUsed,
          replyUsed: geminiState.replyUsed,
          fallbackUsed: geminiState.unavailable,
        },
      };
    }

    // Step 5: Calculate travel routes and modes
    let transportOptions = [];
    let travelRoutes = null;

    if (userContext.destination) {
      plannerSteps.push("🚗 Calculating travel routes...");
      const transportItems = recommendations.filter(
        (r) => r._type === "flight" || r._type === "bus" || r._type === "train"
      );
      transportOptions = transportItems;

      if (userContext.distance?.km) {
        travelRoutes = getAllRoutes(
          userContext.origin,
          userContext.destination,
          userContext.distance.km
        );
      }
    }

    // Step 6: Get recommendations by budget level
    plannerSteps.push("💰 Organizing by budget levels...");
    const travelStyles = formatTravelStyles(
      userContext.purpose?.primary,
      getRecommendationsByBudget(recommendations, userContext)
    );

    // Step 7: Generate structured response
    plannerSteps.push("✅ Preparing your travel plan...");
    const completeResponse = formatCompleteResponse(
      userContext,
      transportOptions,
      recommendations,
      travelStyles
    );

    // Generate chat-friendly text response
    let chatReply = formatChatResponse(
      userContext,
      completeResponse.recommendedTravelOptions,
      recommendations
    );

    if (geminiState.configured) {
      const generatedReply = await generateTravelReply(
        userMessage,
        geminiIntent || {
          mood: userContext.mood?.primary,
          moodIntensity: userContext.mood?.intensity,
          purpose: userContext.purpose?.primary,
          origin: userContext.origin,
          destination: userContext.destination,
          budget: userContext.budget?.preference,
          maxBudget: userContext.budget?.maxBudget,
          intent: "travel planning",
        },
        recommendations
      );

      if (generatedReply) {
        chatReply = generatedReply;
        geminiState.replyUsed = true;
      } else {
        markGeminiUnavailable(geminiState, plannerSteps);
      }
    }

    chatReply = finalizeReply(chatReply, geminiState);

    return {
      // Chat response
      reply: chatReply,
      
      // Structured response
      response: completeResponse,
      
      // Recommendations
      recommendations,
      
      // Planner steps
      plannerSteps,
      
      // User context
      detectedContext: {
        mood: userContext.mood?.primary,
        purpose: userContext.purpose?.primary,
        budget: userContext.budget?.preference,
        maxBudget: userContext.budget?.maxBudget,
        location: userContext.origin,
        destination: userContext.destination,
        travelDate: userContext.travelDate,
        distance: userContext.distance,
        requestedCategories: userContext.requestedCategories || [],
        requestedTransportTypes: userContext.requestedTransportTypes || [],
        strictCategoryMatch: userContext.strictCategoryMatch || false,
        hasExplicitLocation: Boolean(userContext.hasExplicitLocation),
        geminiUnavailable: geminiState.unavailable,
      },
      
      // Map markers
      mapMarkers: buildMapMarkers(recommendations),

      gemini: {
        configured: geminiState.configured,
        intentUsed: geminiState.intentUsed,
        replyUsed: geminiState.replyUsed,
        fallbackUsed: geminiState.unavailable,
      },
    };
  } catch (error) {
    console.error("[AI Assistant] Error:", error);
    plannerSteps.push("⚠️ Encountered an issue, trying alternative search...");
    
    // Fallback response on error
    return {
      reply: stripAsterisksForVoice("I'm having trouble processing your request. Let me try a simpler search..."),
      response: null,
      recommendations: [],
      plannerSteps,
      detectedContext: context,
      mapMarkers: [],
    };
  }
};

module.exports = { runPlannerAgent };
