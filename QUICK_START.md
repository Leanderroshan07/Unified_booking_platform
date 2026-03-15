# Quick Reference: Manage Your Data

## 🧹 CLEAR ALL DATA

```bash
cd backend
node clearDatabase.js
```

Or:
```bash
node dataMgmt.js clear
```

---

## 📝 ADD SAMPLE DATA (for testing)

```bash
node dataMgmt.js add-sample
```

This adds:
- 2 sample movies (Mumbai & Delhi)
- 2 sample hotels (luxury & budget)
- 1 sample bus (Mumbai to Delhi)

---

## ➕ ADD YOUR OWN DATA

### Via API (Recommended)

**Step 1: Get a JWT token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Takes JWT token from response.

**Step 2: Add movie**
```bash
curl -X POST http://localhost:5000/api/movies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Movie",
    "location": "Mumbai",
    "description": "Plot description",
    "genre": ["action", "drama"],
    "rating": 8.5,
    "storyline": "Detailed plot",
    "tags": ["fun", "exciting"]
  }'
```

**Same pattern for:**
- `POST /api/hotels` - Hotels
- `POST /api/buses` - Buses
- `POST /api/flights` - Flights
- `POST /api/trains` - Trains

---

## 📊 CHECK DATABASE STATUS

```bash
node dataMgmt.js status
```

Shows:
- How many movies
- How many hotels
- How many buses
- How many flights
- How many trains

---

## 🚀 QUICK START

1. Clear old data:
   ```bash
   node dataMgmt.js clear
   ```

2. Add sample data:
   ```bash
   node dataMgmt.js add-sample
   ```

3. Visit frontend:
   ```
   http://localhost:5174
   ```

4. Test AI Assistant:
   - Type: "I'm in Mumbai and want fun"
   - Should show the movies you added

---

## 📝 SAMPLE DATA STRUCTURE

### Movie
```json
{
  "title": "Movie Name",
  "location": "City",
  "description": "What is it about",
  "genre": ["action", "drama"],
  "rating": 8.5,
  "storyline": "Full plot",
  "tags": ["tag1", "tag2"]
}
```

### Hotel
```json
{
  "name": "Hotel Name",
  "location": "City",
  "price": 5000,
  "rating": 4.5,
  "description": "Hotel details",
  "amenities": ["WiFi", "Pool"],
  "starCategory": 5
}
```

### Bus
```json
{
  "name": "Bus Line Name",
  "origin": "City A",
  "destination": "City B",
  "price": 500,
  "rating": 4.0,
  "arrivalTime": "2 hours",
  "seats": 45,
  "type": "AC"
}
```

### Flight
```json
{
  "name": "Flight",
  "origin": "City A",
  "destination": "City B",
  "airline": "Airline Name",
  "price": 10000,
  "rating": 4.8,
  "departureTime": "10:00 AM",
  "duration": "2h 30m"
}
```

### Train
```json
{
  "name": "Train Name",
  "trainNumber": "12345",
  "origin": "City A",
  "destination": "City B",
  "price": 2000,
  "rating": 4.2,
  "departureTime": "6:00 PM",
  "duration": "12 hours"
}
```

---

## 🔗 SERVERS

- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:5000
- **Database**: MongoDB Atlas (automated)

---

## ⚡ QUICK COMMANDS

| Command | What it does |
|---------|-------------|
| `node dataMgmt.js clear` | Remove all data |
| `node dataMgmt.js status` | Show what's in db |
| `node dataMgmt.js add-sample` | Add test data |
| `node clearDatabase.js` | Quick clear alternative |

---

Done! Your system is clean and ready for your custom data! 🚀
