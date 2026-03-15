const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Movie = require("../models/Movie");

const router = express.Router();

// Initialize Gemini AI
const geminiKey = (process.env.GEMINI_KEY || "").trim();
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

router.post("/", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({ error: "GEMINI_KEY is not configured" });
    }

    const { message } = req.body;

    // 🔹 Get movie names from MongoDB for RAG
    const movies = await Movie.find({});
    const movieNames = movies.length > 0
      ? movies.map((m) => m.title).join(", ")
      : "No movies currently in the database.";

    // 🔹 Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a premium, emotionally-intelligent movie booking assistant and reviwer 🎬

RESOURCES (RAG):
The following movies are currently screening in our cinema:
${movieNames}

User's Request: "${message}"

CORE DIRECTIVES:
1. IDENTIFY: Check if the user is asking about any of the movies listed above.
2. SUPPLEMENT: If the user asks for details like "Who acted in this movie?", "What's the vibe?", or "Is it a tear-jerker?", use your external Gemini knowledge to provide those details for the movies we have in our database.
3. EMOTIONAL TONE: Don't just give facts. Provide an emotional, cinematic response. Use words that evoke feelings (e.g., "breathtaking", "heart-wrenching", "electrifying"). Make the user feel the magic of the movies.
4. RECOMMEND: If they are looking for a specific feeling, suggest one of our movies that fits that emotion.
5. CONSTRAIN: If they ask about a movie NOT in our list, politely mention we don't have it yet, but suggest one of our current "masterpieces" instead.

Style: Passionate, sophisticated, and deeply helpful. Use emojis to add flair. be in 8 lines.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text() || "I'm sorry, I'm having a bit of trouble processing that request right now. 😔";

    res.json({ reply });
  } catch (err) {
    console.error("AI SDK Error:", err);
    res.status(500).json({ error: "AI service is temporarily unavailable" });
  }
});

module.exports = router;
