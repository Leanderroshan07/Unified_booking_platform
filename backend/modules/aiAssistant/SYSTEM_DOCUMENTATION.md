# AI Travel Assistant - System Documentation

This module contains the live backend logic for the AI assistant exposed by the authenticated route at POST /api/ai-assistant/query.

## Status

- Production runtime is backed by MongoDB models and the planner pipeline.
- The API entry point is aiAgent.js, which delegates to plannerAgent.js.
- The dummy-only local test suite and reference docs were removed to keep this folder aligned with the live implementation.

## Runtime Entry Points

### API route

- backend/routes/aiAssistant.routes.js
- Calls handleQuery from aiAgent.js after auth middleware succeeds.

### Module entry

- aiAgent.js validates the incoming message and delegates to runPlannerAgent.
- plannerAgent.js orchestrates context analysis, recommendation lookup, ranking, routing, and response formatting.

## Core Modules

| Module | Purpose |
|--------|---------|
| aiAgent.js | Stable API-facing wrapper for the assistant |
| plannerAgent.js | Main orchestration pipeline |
| contextAnalyzer.js | Extracts mood, purpose, locations, budget, and date intent |
| enhancedRecommendationEngine.js | Filters and ranks recommendation candidates |
| travelModeClassifier.js | Chooses FASTEST, NORMAL, and SAFE transport modes |
| travelRouteCalculator.js | Builds route comparisons and date-aware pricing |
| responseFormatter.js | Produces the final response payload |
| geminiService.js | Optional Gemini integration for enriched interpretation/replies |
| mapService.js | Builds map-related metadata for results |
| tools.js | Internal helper tools used by the planner |

## Supported Validation

The retained validation entry point is integrationTests.js.

```bash
node backend/modules/aiAssistant/integrationTests.js
```

This verifies the current implementation modules without relying on the removed dummy-data utility layer.

## Request Flow

1. The client calls POST /api/ai-assistant/query with a message.
2. aiAssistant.routes.js validates input and injects authenticated user context.
3. aiAgent.js normalizes the request and calls runPlannerAgent.
4. plannerAgent.js analyzes context, fetches domain data, ranks results, and formats the response.
5. The route returns reply, recommendations, planner steps, detected context, and map markers.

## Response Shape

The route returns a normalized object shaped like this:

```json
{
  "reply": "personalized assistant response",
  "recommendations": [],
  "plannerSteps": [],
  "detectedContext": {},
  "mapMarkers": [],
  "gemini": {
    "configured": true,
    "intentUsed": false,
    "replyUsed": false,
    "fallbackUsed": false
  }
}
```

Exact fields can vary slightly depending on the planner result path, but the live route is centered on that normalized response contract.

## File Structure

```text
backend/modules/aiAssistant/
|-- aiAgent.js
|-- plannerAgent.js
|-- contextAnalyzer.js
|-- enhancedRecommendationEngine.js
|-- travelModeClassifier.js
|-- travelRouteCalculator.js
|-- responseFormatter.js
|-- geminiService.js
|-- mapService.js
|-- tools.js
|-- recommendationEngine.js
|-- integrationTests.js
|-- AI_IMPLEMENTATION_GUIDE.md
|-- FRONTEND_INTEGRATION_GUIDE.md
|-- IMPLEMENTATION_COMPLETE.md
|-- DELIVERY_SUMMARY.md
|-- FILES_CREATED.md
|-- MASTER_RESOURCE_INDEX.md
`-- SYSTEM_DOCUMENTATION.md
```

## Operational Notes

- The assistant depends on MongoDB-backed booking, hotel, flight, train, bus, and movie data.
- If Gemini configuration is missing or unavailable, plannerAgent.js falls back to local behavior.
- Route access is protected by authMiddleware.

## Troubleshooting

### Route returns 500

- Check backend logs for [AI Assistant] errors.
- Verify MongoDB connectivity and required collections.
- Verify Gemini-related environment variables if you expect Gemini-enhanced behavior.

### Empty recommendations

- Confirm the relevant MongoDB collections contain data.
- Check detectedContext values from the response payload to verify parsing.
- Review filter and ranking behavior in enhancedRecommendationEngine.js.

### Module-level debugging

- Run integrationTests.js.
- Trace plannerAgent.js step output and intermediate context.
- Verify route input shape in backend/routes/aiAssistant.routes.js.

## Next Reading

- AI_IMPLEMENTATION_GUIDE.md for technical design details
- FRONTEND_INTEGRATION_GUIDE.md for UI integration
- MASTER_RESOURCE_INDEX.md for a compact module map
