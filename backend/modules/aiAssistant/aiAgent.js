/**
 * AI Assistant — main entry point.
 * Delegates to the PlannerAgent and returns a normalized API response.
 */

const { runPlannerAgent } = require("./plannerAgent");

/**
 * Handle an incoming user query.
 * @param {string} message
 * @param {object} [context]
 * @returns {Promise<object>} API response payload
 */
const handleQuery = async (message, context = {}) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    return {
      reply: "Please tell me what you'd like to plan!",
      recommendations: [],
      plannerSteps: [],
      detectedContext: {},
      mapMarkers: [],
    };
  }

  const result = await runPlannerAgent(message.trim(), context);
  return result;
};

module.exports = { handleQuery };
