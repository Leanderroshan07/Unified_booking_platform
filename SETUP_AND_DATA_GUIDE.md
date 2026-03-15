# Backend & Frontend Setup Guide

## ✅ Current Status

### Servers Running:
- **Backend API**: http://localhost:5000
- **Frontend UI**: http://localhost:5174
- **Database**: MongoDB Atlas (unified-booking-platform)

### What's Synced:
✓ API endpoints connected to frontend  
✓ Authentication (JWT tokens)  
✓ AI Assistant fully integrated  
✓ Styling & theme unified  
✓ Data contracts aligned  

---

## 🗑️ Clear Database

All existing test data (movies, buses, flights, trains, hotels) can be removed:

```bash
cd backend
node clearDatabase.js
```

This will remove all documents from:
- movies
- buses
- flights
- trains
- hotels
- rooms

---

## 📝 Add Your Own Data

### Option 1: API Endpoints (Recommended)

**Create a Movie:**
```javascript
POST http://localhost:5000/api/movies
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "My Movie",
  "description": "Description",
  "location": "City Name",
  "genre": ["action", "drama"],
  "rating": 8.5,
  "storyline": "Plot here",
  "tags": ["tag1", "tag2"]
}
```

**Create a Hotel:**
```javascript
POST http://localhost:5000/api/hotels
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Hotel Name",
  "location": "City Name",
  "price": 5000,
  "rating": 4.5,
  "description": "Hotel details",
  "amenities": ["WiFi", "Pool", "AC"]
}
```

**Create a Bus:**
```javascript
POST http://localhost:5000/api/buses
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Bus Line Name",
  "origin": "City A",
  "destination": "City B",
  "price": 500,
  "rating": 4.0,
  "arrivalTime": "2 hours"
}
```

Similar patterns for:
- `/api/flights` - Flight bookings
- `/api/trains` - Train bookings

---

### Option 2: Seed Script

Create a `seedNewData.js` file:

```javascript
const Movie = require('./models/Movie');
const Hotel = require('./models/Hotel');
require('./config/db');

const movies = [
  {
    title: "Movie 1",
    location: "Mumbai",
    genre: ["drama"],
    rating: 8,
    description: "...",
    storyline: "...",
    tags: []
  }
  // Add more...
];

setTimeout(async () => {
  await Movie.insertMany(movies);
  console.log('✅ Data seeded');
  process.exit(0);
}, 2000);
```

Run: `node seedNewData.js`

---

## 🔄 How Backend & Frontend Work Together

### Authentication Flow:
1. User logs in on **frontend** → `/api/auth/login`
2. Backend returns **JWT token**
3. Frontend stores token in localStorage
4. Frontend sends token in `Authorization: Bearer {token}` header for all requests

### AI Assistant Flow:
1. User types message in **frontend** widget
2. Frontend calls **backend** `/api/ai-assistant/query`
3. Backend processes with Gemini AI + LangChain
4. Backend queries **database** for recommendations
5. Returns results to **frontend**
6. **Frontend** displays large cards with recommendations

### Data Sync:
- **Frontend** (`frontend/.env`) and **Backend** (`backend/.env`) use same MongoDB database
- Both use same authentication system
- Both use same API contracts
- Styling is unified across both

---

## 🛠️ Key API Endpoints

### Authentication:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (requires auth)

### Data (All require authentication):
- `GET /api/movies` - List all movies
- `GET /api/hotels` - List all hotels
- `GET /api/buses` - List all buses
- `GET /api/flights` - List all flights
- `GET /api/trains` - List all trains

### AI:
- `POST /api/ai-assistant/query` - Ask AI assistant (requires auth)

---

## 📊 Database Schema

### Movie:
```javascript
{
  title: String,
  description: String,
  location: String,
  genre: [String],
  rating: Number,
  storyline: String,
  tags: [String],
  poster: String,
  popularityScore: Number (0-10),
  recommendationWeight: Number (0-10)
}
```

### Hotel:
```javascript
{
  name: String,
  location: String,
  price: Number,
  rating: Number,
  description: String,
  amenities: [String],
  starCategory: Number,
  recommendationWeight: Number (0-10)
}
```

### Bus/Flight/Train:
All follow similar structure with `origin`, `destination`, `price`, `rating`, etc.

---

## 🚀 Next Steps

1. **Clear old data**: `node clearDatabase.js`
2. **Add your data**: Use API endpoints or seed scripts
3. **Test in frontend**: http://localhost:5174
4. **Ask AI Assistant**: Try prompts like "I'm in Mumbai and want fun"
5. **System will find recommendations** from your data

---

## ℹ️ Important Notes

- **Backend** handles all data and AI logic
- **Frontend** handles UI and user interaction
- Both use same **Gemini AI** for smart recommendations
- Both connect to same **MongoDB Atlas** database
- Both use same **JWT authentication**

**Everything is synced! You're ready to add your own data.** ✨
