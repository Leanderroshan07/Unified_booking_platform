/**
 * Gemini AI Service
 * Uses @google/generative-ai SDK (already installed)
 * Env var: GEMINI_KEY
 *
 * Capabilities:
 *  1. analyzeUserMessage  — extract travel intent from ANY natural language input
 *  2. generateTravelReply — compose a personalized human-like response
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

let _genAI = null;

const getClient = () => {
  if (!_genAI) {
    const key = process.env.GEMINI_KEY;
    if (!key) return null;
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// ─── 1: Analyze user message ──────────────────────────────────────────────────

/**
 * Send the raw user message to Gemini and get structured travel intent.
 * Returns null if Gemini is not configured or fails.
 *
 * @param {string} userMessage
 * @returns {Promise<object|null>}
 */
const analyzeUserMessage = async (userMessage) => {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a smart travel assistant. Analyze the user's message and extract their travel needs.

User message: "${userMessage}"

Return ONLY a valid JSON object — no markdown, no explanation, no code block.
Use this exact schema:
{
  "mood": "happy|sad|tired|stressed|relaxed|romantic|adventurous|excited|bored|neutral",
  "moodIntensity": 1-10,
  "origin": "city name or null",
  "destination": "city name or null",
  "purpose": "vacation|honeymoon|business|family|medical|education|spiritual|entertainment|adventure|relaxation|general",
  "budget": "budget|economy|luxury|any",
  "maxBudget": number or null,
  "preferredTransport": "flight|train|bus|any",
  "intent": "short description of what the user wants in 1 sentence",
  "needsRecommendation": true or false,
  "isEmotional": true or false,
  "suggestedDestinations": ["city1", "city2"] or [],
  "travelDuration": "short|weekend|week|month|unknown",
  "groupType": "solo|couple|family|friends|business|unknown",
  "urgency": "immediate|today|this_week|flexible|unknown"
}

Examples:
- "I feel sad and need a break" → mood:sad, destination:null, suggestedDestinations:["Goa","Coorg","Manali"], isEmotional:true
- "I am in Dubai going to Chennai" → origin:Dubai, destination:Chennai
- "Plan a romantic trip to Jaipur under 20000" → purpose:romantic, destination:Jaipur, maxBudget:20000, budget:economy
- "Show me cheap flights from Mumbai to Delhi" → origin:Mumbai, destination:Delhi, preferredTransport:flight, budget:budget
- "family vacation ideas" → purpose:family, groupType:family, needsRecommendation:true`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();

    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    console.error("[Gemini] analyzeUserMessage failed:", err.message);
    return null;
  }
};

// ─── 2: Generate personalized travel reply ────────────────────────────────────

/**
 * Ask Gemini to write a friendly, helpful travel assistant reply.
 *
 * @param {string} userMessage  — original user message
 * @param {object} context      — extracted intent (from analyzeUserMessage)
 * @param {Array}  recommendations — top items from DB
 * @returns {Promise<string>}   — reply text
 */
const generateTravelReply = async (userMessage, context, recommendations = []) => {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build a compact summary of recommendations
    const topItems = recommendations.slice(0, 6).map((r) => {
      if (r._type === "hotel") return `Hotel: ${r.name} in ${r.location} (₹${r.price}/night, ${r.starCategory}★)`;
      if (r._type === "flight") return `Flight: ${r.airline || r.name} ${r.origin}→${r.destination} (₹${r.price})`;
      if (r._type === "bus") return `Bus: ${r.operator || r.name} ${r.origin}→${r.destination} (₹${r.price})`;
      if (r._type === "train") return `Train: ${r.operator || r.name} ${r.origin}→${r.destination} (₹${r.price})`;
      if (r._type === "activity") return `Activity: ${r.title || r.name} in ${r.location}`;
      return `${r._type}: ${r.name} (₹${r.price})`;
    });

    const prompt = `You are a friendly, enthusiastic travel assistant AI named "TravelBot".

The user said: "${userMessage}"

I detected the following about them:
- Mood: ${context.mood || "neutral"} (intensity: ${context.moodIntensity || 5}/10)
- Purpose: ${context.purpose || "general travel"}
- From: ${context.origin || "not specified"}
- To: ${context.destination || "not specified"}
- Budget: ${context.budget || "any"}${context.maxBudget ? ` (max ₹${context.maxBudget})` : ""}
- Group: ${context.groupType || "unknown"}
- Intent: ${context.intent || "travel planning"}

Available options from our platform:
${topItems.length > 0 ? topItems.join("\n") : "Searching our database for options..."}

Write a warm, helpful 3-4 sentence response:
1. Acknowledge their mood/situation naturally (if emotional, be empathetic)
2. Briefly suggest a destination or travel idea if relevant
3. Reference 1-2 specific options from the list above if available
4. End with an encouraging call to action

Keep it conversational, enthusiastic, and under 150 words. Use Indian Rupee (₹) for prices.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[Gemini] generateTravelReply failed:", err.message);
    return null;
  }
};

// ─── 3: Is Gemini configured? ────────────────────────────────────────────────

const isConfigured = () => !!process.env.GEMINI_KEY;

module.exports = { analyzeUserMessage, generateTravelReply, isConfigured };
