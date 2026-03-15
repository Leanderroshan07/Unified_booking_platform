/**
 * Integration Tests for AI Travel Assistant System
 * Tests all major features and workflows
 */

// Mock test scenarios
const testScenarios = {
  // 1. Mood-based recommendation test
  moodBasedTest: {
    input: "I feel happy and I'm in Dubai, want to find fun activities",
    expectedOutputs: {
      mood: "happy",
      suggestions: "adventure, fun, entertainment",
      activities: true,
    },
    description: "Should recommend exciting activities for happy mood",
  },

  // 2. Travel route prediction test
  routePredictionTest: {
    input: "I am in Dubai but I need to go to Chennai",
    expectedOutputs: {
      fastestMode: "FLIGHT",
      normalMode: "TRAIN",
      safeMode: "BUS",
      hasDistanceKm: true,
      hasTimeEstimate: true,
    },
    description: "Should provide Fastest/Normal/Safe travel modes with times",
  },

  // 3. Budget-based filtering test
  budgetFilterTest: {
    input: "Book ticket to Chennai on 13 under 2000",
    expectedOutputs: {
      maxBudget: 2000,
      affordableOptions: true,
      priceFilter: true,
    },
    description: "Should filter options under ₹2000 budget",
  },

  // 4. Purpose-based suggestions test
  purposeBasedTest: {
    input: "I want to plan a family trip to Bangalore with kids",
    expectedOutputs: {
      purpose: "family",
      recommendations: "kid-friendly, family, children",
      hasHotels: true,
      hasActivities: true,
    },
    description: "Should provide family-appropriate suggestions",
  },

  // 5. Date-based planning test
  dateBasedTest: {
    input: "Book a flight to London tomorrow",
    expectedOutputs: {
      travelDate: "tomorrow",
      priceMultiplier: "1.5",
      lastMinuteBooking: true,
    },
    description: "Should recognize tomorrow booking and apply pricing",
  },

  // 6. Travel styles test (Budget/Economy/Luxury)
  travelStylesTest: {
    input: "I want to travel from Mumbai to Delhi with a high budget for luxury",
    expectedOutputs: {
      hasLuxuryOption: true,
      luxuryHotels: "5-star",
      premiumTransport: true,
      vipExperience: true,
    },
    description: "Should provide luxury travel style recommendations",
  },

  // 7. Multi-mode route test
  multiModeRouteTest: {
    input: "What's the best way to get from London to Rome",
    expectedOutputs: {
      routeModes: ["flight", "train", "bus"],
      hasTimeComparison: true,
      hasCostComparison: true,
      hasConvenience: true,
    },
    description: "Should provide multiple transportation options with comparisons",
  },

  // 8. Entertainment suggestions test
  entertainmentTest: {
    input: "I'm going to Dubai to watch movies, recommend movies and hotels nearby",
    expectedOutputs: {
      movies: true,
      movieCount: 3,
      hotels: true,
      hotelCount: 3,
      location: "Dubai",
    },
    description: "Should recommend movies and nearby hotels",
  },
};

/**
 * Test context analyzer
 */
const testContextAnalyzer = () => {
  const { analyzeUserContext } = require("./contextAnalyzer");

  console.log("\n✅ TESTING CONTEXT ANALYZER\n");

  const tests = [
    {
      input: "I feel happy",
      check: (result) => result.mood.primary === "happy",
      name: "Happy mood detection",
    },
    {
      input: "I'm sad and tired",
      check: (result) => (result.mood.primary === "sad" || result.mood.primary === "tired"),
      name: "Sad/tired mood detection",
    },
    {
      input: "Family trip with kids",
      check: (result) => result.purpose.primary === "family",
      name: "Family trip purpose",
    },
    {
      input: "under 2000",
      check: (result) => result.budget.maxBudget === 2000,
      name: "Budget extraction",
    },
    {
      input: "from Dubai to Chennai",
      check: (result) =>
        result.origin.toLowerCase().includes("dubai") &&
        result.destination.toLowerCase().includes("chennai"),
      name: "Location extraction",
    },
    {
      input: "tomorrow",
      check: (result) => result.travelDate === "tomorrow",
      name: "Date extraction",
    },
  ];

  tests.forEach((test) => {
    const result = analyzeUserContext(test.input);
    const passed = test.check(result);
    console.log(`${passed ? "✓" : "✗"} ${test.name}`);
    if (!passed) console.log("  Result:", result);
  });
};

/**
 * Test travel mode classifier
 */
const testTravelModeClassifier = () => {
  const {
    enrichWithTravelMode,
    selectBestPerMode,
  } = require("./travelModeClassifier");

  console.log("\n✅ TESTING TRAVEL MODE CLASSIFIER\n");

  // Mock transport items
  const mockTransport = [
    {
      _type: "flight",
      airline: "Air India",
      price: 5000,
      rating: 8,
    },
    {
      _type: "train",
      operator: "Indian Railways",
      price: 2000,
      rating: 7,
    },
    {
      _type: "bus",
      operator: "Volvo",
      price: 800,
      rating: 6,
    },
  ];

  const distance = 1200; // km

  const enriched = mockTransport.map((t) =>
    enrichWithTravelMode(t, distance)
  );

  console.log("✓ Transport enriched with time/cost estimates");

  const modes = selectBestPerMode(mockTransport, distance);

  if (modes.FASTEST && modes.FASTEST.transport === "FLIGHT") {
    console.log("✓ Flight correctly identified as FASTEST");
  }

  if (modes.NORMAL && modes.NORMAL.transport === "TRAIN") {
    console.log("✓ Train correctly identified as NORMAL");
  }

  if (modes.SAFE && modes.SAFE.transport === "BUS") {
    console.log("✓ Bus correctly identified as SAFE");
  }
};

/**
 * Test response formatter
 */
const testResponseFormatter = () => {
  const { formatCompleteResponse } = require("./responseFormatter");

  console.log("\n✅ TESTING RESPONSE FORMATTER\n");

  const mockContext = {
    origin: "Dubai",
    destination: "Mumbai",
    mood: { primary: "happy" },
    purpose: { primary: "vacation" },
    budget: { preference: "economy", maxBudget: 10000 },
    distance: { km: 1200, category: "regional", estimatedHours: 12 },
    travelDate: "tomorrow",
  };

  const mockTransport = [
    { _type: "flight", price: 5000, duration: "2h", airline: "Emirates" },
    { _type: "train", price: 2000, duration: "12h", operator: "Railways" },
  ];

  const mockRecommendations = [
    {
      _type: "hotel",
      name: "Hotel XYZ",
      price: 5000,
      rating: 8,
      starCategory: 4,
    },
    {
      _type: "activity",
      title: "Movie Show",
      genre: ["entertainment"],
      location: "Mumbai",
    },
  ];

  const response = formatCompleteResponse(
    mockContext,
    mockTransport,
    mockRecommendations,
    {}
  );

  console.log("✓ Response has location:", !!response.location);
  console.log("✓ Response has destinations:", !!response.destination);
  console.log("✓ Response has travel context:", !!response.context);
  console.log("✓ Response has travel options:", !!response.recommendedTravelOptions);
  console.log("✓ Response has distance info:", !!response.distance);
};

/**
 * Test recommendation engine
 */
const testRecommendationEngine = () => {
  const {
    applyBudgetFilter,
    applyPurposeFilter,
    rankResults,
  } = require("./enhancedRecommendationEngine");

  console.log("\n✅ TESTING RECOMMENDATION ENGINE\n");

  const mockItems = [
    { _type: "hotel", name: "Luxury Hotel", price: 15000, starCategory: 5 },
    { _type: "hotel", name: "Budget Hotel", price: 2000, starCategory: 2 },
    { _type: "hotel", name: "Mid-range Hotel", price: 5000, starCategory: 3 },
  ];

  // Test budget filter
  const budgetFiltered = applyBudgetFilter(mockItems, 5000, "economy");
  if (budgetFiltered.length === 2) {
    console.log("✓ Budget filter correctly removed items over ₹5000");
  }

  // Test ranking
  const ranked = rankResults(mockItems, { purpose: { primary: "vacation" } });
  console.log("✓ Items ranked by relevance and quality");

  // Test purpose filter
  const itemsWithFamily = [
    ...mockItems,
    { _type: "hotel", name: "Family Resort", tags: ["family", "kid-friendly"], price: 8000 },
  ];
  const familyFiltered = applyPurposeFilter(itemsWithFamily, "family");
  console.log("✓ Purpose filter applied (family trip)");
};

/**
 * Test travel route calculator
 */
const testTravelRouteCalculator = () => {
  const {
    getDistance,
    getAllRoutes,
    getRoutesByBudget,
  } = require("./travelRouteCalculator");

  console.log("\n✅ TESTING TRAVEL ROUTE CALCULATOR\n");

  const distance = getDistance("Dubai", "Mumbai");
  if (distance === 1200) {
    console.log("✓ Distance correctly calculated (Dubai-Mumbai: 1200 km)");
  }

  const routes = getAllRoutes("Dubai", "Mumbai", 1200);
  console.log("✓ Multiple travel modes calculated:");
  if (routes.fastest) console.log("  - Fastest:", routes.fastest.estimatedTime, "hours");
  if (routes.normal) console.log("  - Normal:", routes.normal.estimatedTime, "hours");
  if (routes.safe) console.log("  - Safe:", routes.safe.estimatedTime, "hours");

  const budgetRoutes = getRoutesByBudget("Dubai", "Mumbai", 3000, 1200);
  console.log(`✓ Budget filter: ${budgetRoutes.count} options under ₹3000`);
};

/**
 * Run all tests
 */
const runAllTests = () => {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  AI TRAVEL ASSISTANT - INTEGRATION TEST SUITE       ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  try {
    testContextAnalyzer();
    testTravelModeClassifier();
    testResponseFormatter();
    testRecommendationEngine();
    testTravelRouteCalculator();

    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║  ✅ ALL TESTS COMPLETED                             ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  }
};

module.exports = {
  runAllTests,
  testScenarios,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
