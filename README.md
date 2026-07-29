# Unified Booking Platform

A full-stack MERN application combining flights, trains, buses, hotels, and movie bookings with an AI-powered recommendation engine.

## Tech Stack

**Frontend:** React 19, Vite 7, Tailwind CSS v4, React Router 7, Framer Motion, shadcn/ui  
**Backend:** Node.js, Express 5, Mongoose 9, JWT authentication  
**Database:** MongoDB (local)  
**AI:** Google Gemini API

## Features

- ✈️ **Flights** — Search, book, and manage flight reservations
- 🚆 **Trains** — Train schedules, seat selection, and booking
- 🚌 **Buses** — Bus route search and ticket booking
- 🏨 **Hotels** — Browse hotels, room types, and room instances (3-level hierarchy)
- 🎬 **Movies** — Movie listings with seat-level selection
- 🤖 **AI Assistant** — Intelligent travel recommendations via Gemini
- 🗺️ **Route Matrix** — Multi-modal transport comparison (flight vs train vs bus)
- 👑 **Admin Panel** — Manage all services, users, and bookings

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **MongoDB** running locally on port 27017 (or configure remote URI)

### Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
Configuration
Copy the example env files and fill in your credentials:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
Required environment variables:
Variable	Description
PORT	Backend server port (default: 5000)
MONGO_URI	MongoDB connection string
JWT_SECRET	Secret key for JWT tokens
GEMINI_KEY	Google Gemini API key (AI features)
CLOUDINARY_*	Cloudinary credentials (image uploads)
Run Locally
Start both backend and frontend in separate terminals:
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
Open http://localhost:5173 (http://localhost:5173) in your browser.
Utility Scripts
cd backend
npm run db:clear          # Clear all database collections
npm run db:status         # Check database connection status
node createAdmin.js       # Create an admin user
node elevate.js <email>   # Elevate user to admin
node listUsers.js         # List all registered users
Project Structure
unified-booking-platform/
├── backend/                  # Express API server
│   ├── config/               # Database connection
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth & admin middleware
│   ├── models/               # Mongoose schemas
│   ├── modules/aiAssistant/  # AI recommendation engine
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic
│   └── uploads/              # Local file storage
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client wrappers
│   │   └── utils/            # Helpers & utilities
│   └── public/               # Static assets
├── server.js                 # Root entry point
└── package.json              # Root orchestrator
API Endpoints
Endpoint	Description
GET /api/ping	Health check
POST /api/auth/login	User login
POST /api/auth/register	User registration
/api/flights	Flight CRUD
/api/trains	Train CRUD
/api/buses	Bus CRUD
/api/hotels	Hotel CRUD
/api/movies	Movie CRUD
/api/bookings	All bookings
/api/ai-assistant	AI recommendations
/api/route-matrix	Multi-modal route comparison
