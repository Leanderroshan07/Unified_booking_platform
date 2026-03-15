const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { handleQuery } = require("../modules/aiAssistant/aiAgent");

const router = express.Router();

/**
 * POST /api/ai-assistant/query
 * Body: { message: string }
 * Auth: required (JWT)
 */
router.post("/query", authMiddleware, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const result = await handleQuery(message, {
      ...(context && typeof context === "object" ? context : {}),
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    return res.json(result);
  } catch (err) {
    console.error("[AI Assistant] Error:", err.message);
    return res.status(500).json({
      error: "AI assistant is temporarily unavailable",
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      recommendations: [],
      plannerSteps: ["Error occurred"],
      detectedContext: {},
      mapMarkers: [],
    });
  }
});

module.exports = router;
