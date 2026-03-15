# AI Travel Assistant - Quick Reference for Frontend Developers

A complete guide for integrating the intelligent travel assistant into the frontend ChatBot component.

---

## What's New? 

The AI system now supports:

✅ **Mood-aware recommendations** - Detects emotions (happy, sad, excited, tired)  
✅ **Smart travel routing** - Shows FASTEST, NORMAL, SAFE options with times & costs  
✅ **Budget filtering** - Respects user budget constraints  
✅ **Purpose-based suggestions** - Family trips, business, vacation, etc.  
✅ **Date-based pricing** - Dynamic prices for different travel dates  
✅ **Travel styles** - Budget/Economy/Luxury categorization  
✅ **Structured responses** - Clean, organized output format  

---

## API Usage Example

### Basic Query

```javascript
// Frontend: services/aiAssistant.js

const queryAI = async (message) => {
  const response = await fetch('/api/ai-assistant/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  
  return response.json();
};

// Usage
const result = await queryAI("I feel happy and I'm in Dubai, want to go to Mumbai");

console.log(result);
// {
//   reply: "Chat-friendly response",
//   response: { /* structured data */ },
//   recommendations: [ /* array */ ],
//   plannerSteps: [ /* progress steps */ ],
//   detectedContext: { /* extracted info */ }
// }
```

---

## Response Structure

### Full Response Object

```javascript
{
  // Human-readable chat response
  reply: "🚀 **Travel Planning Assistant**...",
  
  // Structured data for UI rendering
  response: {
    location: "Dubai",
    destination: "Mumbai",
    distance: { km: 1200, category: "regional" },
    
    context: {
      mood: "happy",
      purpose: "vacation",
      budget: "economy",
      maxBudget: null,
      travelDate: "not specified"
    },
    
    recommendedTravelOptions: {
      fastest: {
        transport: "FLIGHT",
        operator: "Emirates",
        duration: "3.5 hours",
        estimatedPrice: 5000
      },
      normal: { /* ... */ },
      safe: { /* ... */ }
    },
    
    travelStyles: {
      budget: {
        hotels: [ /* 3 hotels */ ],
        transport: [ /* 2 options */ ],
        activities: [ /* activities */ ]
      },
      economy: { /* ... */ },
      luxury: { /* ... */ }
    },
    
    additionalSuggestions: {
      movies: [ /* 3 movies */ ],
      hotels: [ /* 3 hotels */ ],
      attractions: [ /* attractions */ ],
      moodTip: "You're in great spirits! Consider adventure activities..."
    }
  },
  
  // Lists for map/card display
  recommendations: [
    /* 12 items (hotels, transport, activities) */
  ],
  
  // Show progress to user
  plannerSteps: [
    "🔍 Analyzing your travel requirements...",
    "📍 Searching for matching options...",
    "✅ Preparing your travel plan..."
  ],
  
  // What the AI understood
  detectedContext: {
    mood: "happy",
    purpose: "vacation",
    budget: "economy",
    location: "Dubai",
    destination: "Mumbai",
    travelDate: "not specified",
    distance: { km: 1200, category: "regional" }
  },
  
  // For map display
  mapMarkers: [ /* coordinates */ ]
}
```

---

## Frontend Component Updates

### Update ChatBot Component

```jsx
// components/ChatBot.jsx

import { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState(null);

  const sendMessage = async (userMessage) => {
    // Add user message
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage 
    }]);

    try {
      // Call AI API
      const response = await fetch('/api/ai-assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      // Store detected context
      setContext(data.detectedContext);

      // Add AI response
      setMessages(prev => [...prev, {
        type: 'ai',
        content: data.reply,
        plannerSteps: data.plannerSteps,
        response: data.response
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Error processing request'
      }]);
    }
  };

  return (
    <div className="chatbot">
      {/* Messages display */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            {msg.content}
            
            {/* Show planner steps */}
            {msg.plannerSteps && (
              <div className="planner-steps">
                {msg.plannerSteps.map((step, j) => (
                  <div key={j}>{step}</div>
                ))}
              </div>
            )}

            {/* Show travel recommendations */}
            {msg.response?.recommendedTravelOptions && (
              <TravelOptions {...msg.response} />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <input 
        onKeyPress={e => {
          if(e.key === 'Enter') sendMessage(e.target.value);
        }}
        placeholder="Ask me about travel..."
      />
    </div>
  );
}

// Component to display travel options
function TravelOptions({ recommendedTravelOptions, context }) {
  return (
    <div className="travel-options">
      <div className="card">
        <h3>⚡ FASTEST</h3>
        <p>{recommendedTravelOptions.fastest?.transport}</p>
        <p>⏱️ {recommendedTravelOptions.fastest?.duration}</p>
        <p>💰 ₹{recommendedTravelOptions.fastest?.estimatedPrice}</p>
      </div>

      <div className="card">
        <h3>⭐ NORMAL</h3>
        <p>{recommendedTravelOptions.normal?.transport}</p>
        <p>⏱️ {recommendedTravelOptions.normal?.duration}</p>
        <p>💰 ₹{recommendedTravelOptions.normal?.estimatedPrice}</p>
      </div>

      <div className="card">
        <h3>🛡️ SAFE</h3>
        <p>{recommendedTravelOptions.safe?.transport}</p>
        <p>⏱️ {recommendedTravelOptions.safe?.duration}</p>
        <p>💰 ₹{recommendedTravelOptions.safe?.estimatedPrice}</p>
      </div>
    </div>
  );
}
```

---

## Example Queries & Responses

### 1. Mood-Based Query

**Input:**
```
"I'm feeling happy and excited. I'm in Dubai."
```

**Output:**
```json
{
  "detectedContext": {
    "mood": "happy",
    "moodIntensity": 9.2,
    "location": "Dubai"
  },
  "additionalSuggestions": {
    "moodTip": "You're in great spirits! Consider adventure activities like paragliding, theme parks, or extreme sports!"
  }
}
```

---

### 2. Travel Route Query

**Input:**
```
"How do I get from Dubai to Mumbai?"
```

**Output:**
```json
{
  "distance": { "km": 1200, "category": "regional" },
  "recommendedTravelOptions": {
    "fastest": {
      "transport": "FLIGHT",
      "duration": "3.5 hours",
      "estimatedPrice": 5000
    },
    "normal": {
      "transport": "TRAIN",
      "duration": "15 hours",
      "estimatedPrice": 2000
    },
    "safe": {
      "transport": "BUS",
      "duration": "20 hours",
      "estimatedPrice": 800
    }
  }
}
```

---

### 3. Budget Query

**Input:**
```
"Find me a hotel in Mumbai under 3000"
```

**Output:**
```json
{
  "detectedContext": {
    "maxBudget": 3000,
    "budget": "budget"
  },
  "travelStyles": {
    "budget": {
      "hotels": [
        { "name": "Hotel A", "price": 2500, "rating": 3.8 },
        { "name": "Hotel B", "price": 2800, "rating": 3.9 }
      ]
    }
  }
}
```

---

### 4. Purpose-Based Query

**Input:**
```
"I'm planning a family trip to Bangalore with kids"
```

**Output:**
```json
{
  "detectedContext": {
    "purpose": "family"
  },
  "travelStyles": {
    "budget": {
      "activities": [
        { "name": "Adventure Park", "type": "activity" },
        { "name": "Animated Movie", "genre": "Family" }
      ]
    }
  }
}
```

---

### 5. Date-Based Query

**Input:**
```
"I need to book a flight to London tomorrow"
```

**Output:**
```json
{
  "detectedContext": {
    "travelDate": "tomorrow"
  },
  "response": {
    "recommendedTravelOptions": {
      "fastest": {
        "baseCost": 8000,
        "dynamicPrice": 12000,
        "priceMultiplier": 1.5
      }
    }
  }
}
```

---

## UI Components to Display

### Travel Modes Card

```jsx
<div className="travel-modes-card">
  <div className="mode fastest">
    <h3>⚡ FASTEST</h3>
    <svg>🛫</svg>
    <p>FLIGHT</p>
    <p>3.5 hours</p>
    <price>₹5000</price>
  </div>
  
  <div className="mode normal">
    <h3>⭐ NORMAL</h3>
    <svg>🚂</svg>
    <p>TRAIN</p>
    <p>15 hours</p>
    <price>₹2000</price>
  </div>
  
  <div className="mode safe">
    <h3>🛡️ SAFE</h3>
    <svg>🚌</svg>
    <p>BUS</p>
    <p>20 hours</p>
    <price>₹800</price>
  </div>
</div>
```

### Travel Styles Selector

```jsx
<div className="travel-styles">
  <button className="budget-tab">💰 BUDGET</button>
  <button className="economy-tab">⭐ ECONOMY</button>
  <button className="luxury-tab">👑 LUXURY</button>
</div>

{/* Show hotels, transport, activities for selected style */}
```

### Mood Badge

```jsx
<div className="mood-badge">
  {mood === 'happy' && '😊 Happy'}
  {mood === 'sad' && '😢 Sad'}
  {mood === 'excited' && '🤩 Excited'}
  {mood === 'tired' && '😴 Tired'}
  <p className="mood-tip">{moodTip}</p>
</div>
```

---

## Testing the Integration

### Test Scenario 1: Happy Traveler

```javascript
queryAI("I'm so excited! I'm in Dubai and want to explore Mumbai!")
.then(result => {
  assert(result.detectedContext.mood === 'happy');
  assert(result.additionalSuggestions.moodTip.includes('adventure'));
});
```

### Test Scenario 2: Budget Conscious

```javascript
queryAI("Book ticket to Chennai under 2000")
.then(result => {
  assert(result.detectedContext.maxBudget === 2000);
  assert(all prices <= 2000);
});
```

### Test Scenario 3: Family Trip

```javascript
queryAI("Family trip to Bangalore with kids, need kid-friendly options")
.then(result => {
  assert(result.detectedContext.purpose === 'family');
  assert(activities are 'kid-friendly');
});
```

---

## CSS Styling Tips

```css
/* Travel modes */
.travel-modes-card {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.mode {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.mode.fastest {
  border-left: 4px solid #FF6B6B;
  background: linear-gradient(135deg, #FFE5E5, #FFF);
}

.mode.normal {
  border-left: 4px solid #4ECDC4;
  background: linear-gradient(135deg, #E0F7F6, #FFF);
}

.mode.safe {
  border-left: 4px solid #95E1D3;
  background: linear-gradient(135deg, #F0FDF9, #FFF);
}

/* Mood badge */
.mood-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  background: #F0F0F0;
  margin: 10px 0;
}

.mood-badge .mood-tip {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
```

---

## Error Handling

```javascript
try {
  const result = await queryAI(message);
  
  // Check for errors
  if (!result || !result.reply) {
    showError("Could not process request");
    return;
  }
  
  // Validate response structure
  if (result.response && !result.response.recommendedTravelOptions) {
    console.warn("No travel options available");
  }
  
  // Display with fallback
  displayResponse(result.reply || "Something went wrong");
  
} catch (error) {
  console.error("API Error:", error);
  showError("Connection error. Please try again.");
}
```

---

## Performance Tips

1. **Debounce rapid queries** - Wait 500ms before sending
2. **Cache responses** - Store for same queries
3. **Lazy load recommendations** - Show first 3, load more on scroll
4. **Show loading states** - Use planner steps for feedback
5. **Optimize bundle** - Split large response objects

---

## Summary

The AI system is production-ready with:
- ✅ Full mood detection
- ✅ Smart travel routing
- ✅ Budget filtering
- ✅ Purpose-aware suggestions
- ✅ Structured responses
- ✅ Real database integration

**Just integrate the response into your ChatBot UI and you're done!**

Questions? Check `AI_IMPLEMENTATION_GUIDE.md` for detailed documentation.
