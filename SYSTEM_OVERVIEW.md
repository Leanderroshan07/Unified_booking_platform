# Unified Booking Platform - System Overview

## Project Summary
A comprehensive multi-service booking platform offering integrated reservations for **Flights**, **Trains**, **Buses**, **Hotels**, and **Movies**. Features AI-powered recommendations and a modern React frontend with admin management capabilities.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                      │
│  ┌──────────────┬──────────────┬────────────┬─────────────────┐ │
│  │   Auth UI    │  Dashboard   │ Bookings   │  Admin Panel    │ │
│  │ (Login/Reg)  │ (Central Hub) │ (5 Types)  │ (CRUD Mgmt)     │ │
│  └──────────────┴──────────────┴────────────┴─────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AIAssistantWidget (Gemini-powered recommendations)         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (port 5000)                      │  │
│  │  /api/auth         /api/flights      /api/trains        │  │
│  │  /api/buses        /api/hotels       /api/rooms         │  │
│  │  /api/movies       /api/*-bookings   /api/ai-assistant  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Core Modules                                   │  │
│  │  ├─ Controllers (Request Handling)                       │  │
│  │  ├─ Models (MongoDB Schemas)                            │  │
│  │  ├─ Services (Business Logic)                           │  │
│  │  ├─ Middleware (Auth, Upload, Admin)                    │  │
│  │  └─ AI Assistant Module (Gemini Integration)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Data Persistence Layer                          │  │
│  │  MongoDB Atlas ◄────────────────┐                       │  │
│  │  (Bookings, Users, Resources)   │                       │  │
│  └────────────────────────────────┬┴──────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Cloudinary      Gemini AI        Google Maps
            (Media Storage)  (Recommendations) (Route Calc)
```

---

## Core Modules

### 1. **Authentication** (`/api/auth`)
- **Features**: Login, Register, JWT-based token authentication
- **Models**: User (roles: customer, admin)
- **Middleware**: `authMiddleware`, `adminMiddleware`
- **Controllers**: `auth.controller.js`

### 2. **Flights** (`/api/flights`)
- **CRUD Operations**: Create, read, update, delete flights
- **Booking Flow**: Select flight → Payment → Confirmation
- **Related Routes**: 
  - `/api/flights` - List/create flights
  - `/api/flight-bookings` - Manage flight bookings
- **Admin**: Full CRUD via `FlightBooking` model

### 3. **Trains** (`/api/trains`)
- **Features**: Train schedules, seat availability, pricing
- **Booking Flow**: Similar to flights (select → pay → confirm)
- **Related Routes**: 
  - `/api/trains` - Train operations
  - `/api/train-bookings` - Booking management
- **Admin**: Train management, route matrix tracking

### 4. **Buses** (`/api/buses`)
- **Features**: Bus schedules, routes, capacity management
- **Booking Flow**: Interactive bus seat selection → Payment
- **Related Routes**: 
  - `/api/buses` - Bus operations
  - `/api/bus-bookings` - Booking management
- **Admin**: Route and schedule management

### 5. **Hotels** (`/api/hotels`)
- **Structure**: Hotel → Rooms → Bookings (3-level hierarchy)
- **Features**: Room search, availability calendar, pricing
- **Related Routes**: 
  - `/api/hotels` - Hotel listings
  - `/api/rooms` - Room management
  - `/api/hotel-bookings` - Reservations
- **Admin**: Hotel & room CRUD operations

### 6. **Movies** (`/api/movies`)
- **Features**: Movie catalog, showtimes, seat bookings
- **Booking Flow**: Movie → Showtime → Seats → Payment
- **Related Routes**: 
  - `/api/movies` - Movie catalog
  - `/api/bookings` - Movie ticket bookings
- **Admin**: Movie & showtime management

### 7. **AI Assistant** (`/api/ai-assistant`)
- **Provider**: Google Gemini API
- **Capabilities**: 
  - Personalized travel recommendations
  - Budget-aware suggestions
  - Multi-transport route optimization
  - Real-time chat assistance
- **Components**:
  - `geminiService.js` - Gemini API wrapper
  - `enhancedRecommendationEngine.js` - Recommendation logic
  - `travelModeClassifier.js` - Route classification
  - `travelRouteCalculator.js` - Route optimization
  - `mapService.js` - Google Maps integration

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6, Context API |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Media Storage** | Cloudinary (images/videos) |
| **AI/ML** | Google Gemini API (recommendations) |
| **Mapping** | Google Maps API (route calculations) |
| **Database** | MongoDB Atlas |
| **Build Tool** | Vite |

---

## Database Models

### User Model
```
User {
  email, password (hashed), name, phone, role (customer/admin),
  bookingHistory, preferences, createdAt
}
```

### Booking Models (Generic)
```
Flight/Train/Bus/Hotel/Movie Booking {
  userId, resourceId (flight/train/bus/etc), quantity,
  selectedSeats/rooms, totalPrice, status, paymentInfo,
  createdAt, bookingRef
}
```

### Resource Models
```
Flight/Train/Bus { departure, destination, schedule, capacity, pricing, availability }
Hotel { location, amenities, rating, rooms[] }
Room { hotelId, type (single/double/suite), price, availability, images }
Movie { title, genre, duration, rating, showTimes[], poster, trailer }
```

### Route Matrix
```
RouteMatrix {
  source, destination, transportModes[], distance, estimatedTime,
  pricing
}
```

---

## Frontend Routes & Features

| Route | Component | Protection | Purpose |
|-------|-----------|-----------|---------|
| `/` | Login | Public | User authentication |
| `/register` | Register | Public | New user signup |
| `/dashboard` | Dashboard | Protected | Central hub, booking history |
| `/flights`, `/trains`, `/buses` | Browse pages | Protected | Search & browse resources |
| `/:resource/:id` | Details page | Protected | View resource details |
| `/:resource-payment` | Payment | Protected | Checkout & payment |
| `/:resource-booking-success` | Success | Protected | Confirmation page |
| `/admin/*` | Admin panels | Protected + Admin | CRUD management |
| `/hotels` | Landing page | Public | Hotel browsing (no auth needed) |

---

## Frontend Components

### Key Directories
- **`pages/`** - Page components (auth, dashboard, bookings, admin)
- **`components/`** - Reusable UI components, AIAssistantWidget
- **`contexts/`** - AIAssistantContext for global AI state
- **`services/`** - API calls to backend
- **`hooks/`** - Custom React hooks
- **`styles/`** - CSS/styling

### Special Components
- **`ProtectedRoute`** - Guards authenticated routes
- **`AIAssistantWidget`** - Floating AI assistant on all protected pages
- **Admin Panels** - Movies, Hotels, Buses, Trains management

---

## Backend File Structure

```
backend/
├── server.js                      # Express server entry point
├── config/                        
│   ├── db.js                     # MongoDB connection
│   └── cloudinary.js             # Cloudinary config
├── controllers/                  # Request handlers
│   ├── auth.controller.js
│   ├── flight/bus/train/hotel/movie.controller.js
│   └── *Booking.controller.js
├── models/                       # Mongoose schemas
│   ├── User.js, Flight.js, Hotel.js, etc.
│   └── *Booking.js
├── routes/                       # Express route definitions
│   ├── auth.routes.js
│   ├── flight/bus/train/hotel/movie.routes.js
│   └── *Booking.routes.js
├── middleware/
│   ├── authMiddleware.js         # JWT verification
│   ├── adminMiddleware.js        # Admin role check
│   └── upload.js                 # File upload handler
├── services/
│   ├── routeMatrixService.js     # Route optimization
│   └── booking/                  # Booking services
├── modules/
│   └── aiAssistant/              # Gemini AI module
│       ├── geminiService.js
│       ├── enhancedRecommendationEngine.js
│       ├── travelModeClassifier.js
│       ├── travelRouteCalculator.js
│       ├── mapService.js
│       └── tools.js
├── routes/
│   ├── aiAssistant.routes.js     # AI API endpoints
│   └── chat.js                   # Chat route
└── uploads/                      # Local media storage
    ├── backgrounds/, hotels/, posters/, rooms/, trailers/
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (protected)

### Resources (CRUD)
- `GET /api/flights`, `POST /api/flights` - List/create flights
- `GET /api/flights/:id`, `PUT /api/flights/:id`, `DELETE /api/flights/:id`
- Similar for `/trains`, `/buses`, `/hotels`, `/rooms`, `/movies`

### Bookings
- `POST /api/flight-bookings` - Create flight booking
- `GET /api/flight-bookings/:userId` - Get user bookings
- Similar for `/train-bookings`, `/bus-bookings`, `/hotel-bookings`

### AI Assistant
- `POST /api/ai-assistant/recommend` - Get recommendations
- `POST /api/ai-assistant/chat` - Chat with assistant
- `POST /api/ai-assistant/optimize-route` - Get optimized route

### Utilities
- `GET /api/ping` - Health check
- `GET /api/route-matrix` - Route matrix queries

---

## Data Flow Example: Flight Booking

```
User Action (Frontend)
    ↓
Browse Flights (/flights)
    ↓
View Flight Details (/flights/:id)
    ↓
Fill Booking Form (passengers, seats)
    ↓
Proceed to Payment (/flight-payment)
    ↓
Process Payment (Stripe/PayPal integration)
    ↓
API: POST /api/flight-bookings
    ├─ Verify availability
    ├─ Update Flight model (reduce capacity)
    ├─ Create FlightBooking record
    └─ Store in MongoDB
    ↓
Success Page (/flight-booking-success)
    ↓
Email Confirmation (booking reference)
```

---

## Key Features

### For Customers
✅ Multi-service booking (flights, trains, buses, hotels, movies)  
✅ Unified dashboard for all bookings  
✅ AI-powered recommendations & chat  
✅ Secure payment processing  
✅ Booking history & cancellations  
✅ Search & filter across transport modes  

### For Admins
✅ Full CRUD for all resources  
✅ Booking management & cancellations  
✅ Analytics & reporting  
✅ User management  
✅ Pricing & availability controls  
✅ Route matrix configuration  

---

## Environment Variables (Assumed)

```
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_jwt_secret

# Third-party APIs
GEMINI_API_KEY=your_gemini_key
GOOGLE_MAPS_API_KEY=your_maps_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Server
PORT=5000
NODE_ENV=development
```

---

## Deployment & Running

### Local Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## Summary
The **Unified Booking Platform** is a full-stack MERN application integrating 5 booking services with AI-powered recommendations. It combines a responsive React frontend, scalable Node.js backend, MongoDB persistence, and third-party integrations (Gemini, Google Maps, Cloudinary) for a seamless multi-transport booking experience.
