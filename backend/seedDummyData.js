/**
 * Seed Dummy Data for AI Prediction & Travel Assistant
 * Seeds: Hotels, Flights, Buses, Trains, Movies
 * Run: node seedDummyData.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Flight = require("./models/Flight");
const Bus = require("./models/Bus");
const Train = require("./models/Train");
const Movie = require("./models/Movie");

// Helper: create a date relative to today
const d = (daysFromNow, hour = 8, minute = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysFromNow);
  dt.setHours(hour, minute, 0, 0);
  return dt;
};

// ─── HOTELS ────────────────────────────────────────────────────────────────────
const hotels = [
  // Mumbai
  { name: "Taj Mahal Palace", location: "Mumbai", price: 12000, description: "Iconic luxury hotel on Marine Drive with stunning sea views and world-class dining.", starCategory: 5, popularityScore: 9.5, recommendationWeight: 9, distanceScore: 8, tags: ["luxury", "5-star", "sea-view", "premium", "romantic", "honeymoon"], rating: 4.9 },
  { name: "The Oberoi Mumbai", location: "Mumbai", price: 9500, description: "Contemporary luxury hotel in Nariman Point with panoramic Arabian Sea views.", starCategory: 5, popularityScore: 9, recommendationWeight: 8.5, distanceScore: 7, tags: ["luxury", "5-star", "business", "sea-view", "premium"], rating: 4.8 },
  { name: "Hotel Residency Fort", location: "Mumbai", price: 3800, description: "Well-located economy hotel near CST station, great for business travelers.", starCategory: 3, popularityScore: 7, recommendationWeight: 6, distanceScore: 8, tags: ["budget", "economy", "business", "3-star", "central"], rating: 4.0 },
  { name: "Ginger Mumbai", location: "Mumbai", price: 1800, description: "Smart budget hotel ideal for solo travelers and backpackers.", starCategory: 2, popularityScore: 6.5, recommendationWeight: 5, distanceScore: 7, tags: ["budget", "solo", "backpacker", "affordable", "2-star"], rating: 3.7 },
  { name: "ITC Grand Central", location: "Mumbai", price: 7500, description: "Heritage luxury hotel offering premium banquet facilities and fine dining.", starCategory: 5, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 7, tags: ["luxury", "5-star", "premium", "fine-dining", "business"], rating: 4.7 },

  // Delhi
  { name: "The Imperial New Delhi", location: "Delhi", price: 15000, description: "Heritage 5-star hotel blending colonial elegance with modern luxuries near Connaught Place.", starCategory: 5, popularityScore: 9.5, recommendationWeight: 9.5, distanceScore: 9, tags: ["luxury", "5-star", "heritage", "premium", "romantic", "honeymoon"], rating: 4.9 },
  { name: "Hyatt Regency Delhi", location: "Delhi", price: 8000, description: "Modern luxury hotel near IGI Airport, popular with business travelers.", starCategory: 5, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 8, tags: ["luxury", "5-star", "business", "airport", "premium"], rating: 4.7 },
  { name: "Hotel Sunstar Residency", location: "Delhi", price: 2500, description: "Budget hotel near Karol Bagh with homely atmosphere and great meals.", starCategory: 2, popularityScore: 6, recommendationWeight: 5, distanceScore: 7, tags: ["budget", "economy", "affordable", "2-star"], rating: 3.8 },
  { name: "Bloom Hotels Aerocity", location: "Delhi", price: 4500, description: "Contemporary 4-star hotel walkable from IGI Airport with great amenities.", starCategory: 4, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 9, tags: ["economy", "business", "airport", "4-star", "comfortable"], rating: 4.3 },

  // Goa
  { name: "Taj Exotica Goa", location: "Goa", price: 16000, description: "Luxury beach resort nestled between lush palms and the Arabian Sea, perfect for honeymoons.", starCategory: 5, popularityScore: 9.8, recommendationWeight: 9.5, distanceScore: 9, tags: ["luxury", "5-star", "beach", "romantic", "honeymoon", "vacation", "resort"], rating: 4.9 },
  { name: "Park Hyatt Goa Resort", location: "Goa", price: 10000, description: "Elegant resort with private beach, multiple pools and water sports.", starCategory: 5, popularityScore: 9.2, recommendationWeight: 9, distanceScore: 8.5, tags: ["luxury", "5-star", "beach", "family", "vacation", "resort", "water-sports"], rating: 4.8 },
  { name: "Postcard Cuelim Goa", location: "Goa", price: 7000, description: "Boutique eco-resort in South Goa, perfect for nature lovers and couples.", starCategory: 4, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 7, tags: ["boutique", "eco", "romantic", "4-star", "nature", "beach"], rating: 4.6 },
  { name: "OYO Townhouse Goa Beach", location: "Goa", price: 1500, description: "Affordable beach-facing room perfect for solo backpackers and student groups.", starCategory: 2, popularityScore: 6, recommendationWeight: 5, distanceScore: 8, tags: ["budget", "backpacker", "solo", "beach", "affordable", "2-star"], rating: 3.5 },

  // Bangalore
  { name: "The Leela Palace Bangalore", location: "Bangalore", price: 11000, description: "Palace-inspired 5-star hotel with lush gardens and Bangalore's best Sunday brunch.", starCategory: 5, popularityScore: 9.3, recommendationWeight: 9, distanceScore: 8, tags: ["luxury", "5-star", "premium", "business", "romantic"], rating: 4.8 },
  { name: "Vivanta Bangalore", location: "Bangalore", price: 6500, description: "Contemporary Taj-brand property near MG Road, ideal for business stays.", starCategory: 4, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8, tags: ["luxury", "business", "4-star", "central", "economy"], rating: 4.5 },
  { name: "Zostel Bangalore", location: "Bangalore", price: 800, description: "Vibrant backpacker hostel with social events, dorms and free WiFi.", starCategory: 1, popularityScore: 7, recommendationWeight: 5, distanceScore: 7, tags: ["budget", "hostel", "backpacker", "solo", "affordable", "social"], rating: 4.0 },
  { name: "Lemon Tree Premier Bangalore", location: "Bangalore", price: 4000, description: "Upscale economy hotel near Ulsoor Lake, blending comfort with value.", starCategory: 4, popularityScore: 7.5, recommendationWeight: 7, distanceScore: 7.5, tags: ["economy", "business", "4-star", "lake-view"], rating: 4.2 },

  // Chennai
  { name: "ITC Grand Chola Chennai", location: "Chennai", price: 10000, description: "Magnificent temple-inspired luxury hotel, largest in South India.", starCategory: 5, popularityScore: 9.2, recommendationWeight: 9, distanceScore: 8, tags: ["luxury", "5-star", "heritage", "premium", "business", "wedding"], rating: 4.8 },
  { name: "Radisson Blu Chennai", location: "Chennai", price: 5500, description: "Contemporary 4-star hotel near Chennai airport with rooftop pool.", starCategory: 4, popularityScore: 7.8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["business", "4-star", "airport", "economy", "rooftop-pool"], rating: 4.3 },
  { name: "Fortel Hotel Chennai", location: "Chennai", price: 2000, description: "Clean, budget-friendly hotel in T. Nagar shopping district.", starCategory: 2, popularityScore: 6, recommendationWeight: 5, distanceScore: 7, tags: ["budget", "affordable", "2-star", "economy"], rating: 3.7 },

  // Hyderabad
  { name: "Taj Falaknuma Palace", location: "Hyderabad", price: 30000, description: "Palace converted to a luxury hotel, offering royal Nizam heritage experience.", starCategory: 5, popularityScore: 9.9, recommendationWeight: 10, distanceScore: 8.5, tags: ["luxury", "5-star", "heritage", "royal", "premium", "romantic", "honeymoon", "palace"], rating: 4.9 },
  { name: "Novotel Hyderabad Airport", location: "Hyderabad", price: 5000, description: "Efficient business hotel connected directly to Rajiv Gandhi International Airport.", starCategory: 4, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 9, tags: ["business", "airport", "4-star", "economy", "efficient"], rating: 4.4 },
  { name: "Golkonda Resort", location: "Hyderabad", price: 3500, description: "Heritage-themed resort with Rajasthani architecture near Golkonda Fort.", starCategory: 3, popularityScore: 7, recommendationWeight: 6.5, distanceScore: 7, tags: ["heritage", "resort", "3-star", "family", "vacation"], rating: 4.1 },

  // Jaipur
  { name: "Rambagh Palace", location: "Jaipur", price: 35000, description: "Former residence of the Maharaja of Jaipur, a palatial 5-star heritage hotel.", starCategory: 5, popularityScore: 9.8, recommendationWeight: 10, distanceScore: 8, tags: ["luxury", "5-star", "heritage", "palace", "royal", "romantic", "premium", "honeymoon"], rating: 4.9 },
  { name: "Samode Haveli", location: "Jaipur", price: 8000, description: "250-year-old haveli restored as a boutique heritage hotel in the heart of Jaipur.", starCategory: 4, popularityScore: 8.5, recommendationWeight: 8.5, distanceScore: 8, tags: ["heritage", "boutique", "4-star", "royal", "romantic", "vacation"], rating: 4.6 },
  { name: "Hotel Pearl Palace", location: "Jaipur", price: 1200, description: "Award-winning budget hotel with rooftop restaurant, popular with backpackers worldwide.", starCategory: 2, popularityScore: 8, recommendationWeight: 6, distanceScore: 8, tags: ["budget", "backpacker", "affordable", "rooftop", "2-star"], rating: 4.3 },

  // Kolkata
  { name: "The Oberoi Grand Kolkata", location: "Kolkata", price: 9000, description: "Colonial-era grand hotel on Chowringhee, a Kolkata landmark since 1841.", starCategory: 5, popularityScore: 9, recommendationWeight: 8.5, distanceScore: 8.5, tags: ["luxury", "5-star", "heritage", "colonial", "premium", "business"], rating: 4.7 },
  { name: "Hotel Hindustan International", location: "Kolkata", price: 3000, description: "Well-known economy hotel in the heart of the city, near Park Street.", starCategory: 3, popularityScore: 7, recommendationWeight: 6, distanceScore: 8, tags: ["economy", "business", "3-star", "central"], rating: 4.0 },

  // Dubai
  { name: "Burj Al Arab Jumeirah", location: "Dubai", price: 80000, description: "The world's most luxurious hotel on a private island, the ultimate indulgence.", starCategory: 7, popularityScore: 10, recommendationWeight: 10, distanceScore: 9, tags: ["ultra-luxury", "7-star", "iconic", "premium", "romantic", "honeymoon", "international"], rating: 5.0 },
  { name: "JW Marriott Marquis Dubai", location: "Dubai", price: 18000, description: "One of the world's tallest hotels, with 70+ floors of luxury in Business Bay.", starCategory: 5, popularityScore: 9.2, recommendationWeight: 9, distanceScore: 8.5, tags: ["luxury", "5-star", "business", "international", "premium"], rating: 4.8 },
  { name: "Rove Downtown Dubai", location: "Dubai", price: 5500, description: "Stylish mid-range hotel near Dubai Mall, great for shopping and sightseeing.", starCategory: 3, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 9, tags: ["economy", "tourism", "3-star", "shopping", "international"], rating: 4.3 },

  // Singapore
  { name: "Marina Bay Sands", location: "Singapore", price: 45000, description: "Iconic sky park hotel with infinity pool, casino, and breathtaking city views.", starCategory: 5, popularityScore: 9.9, recommendationWeight: 9.5, distanceScore: 9.5, tags: ["luxury", "5-star", "iconic", "international", "romantic", "honeymoon", "skypool"], rating: 4.9 },
  { name: "Fullerton Hotel Singapore", location: "Singapore", price: 20000, description: "Grand neo-classical heritage hotel on the Singapore River near Marina Bay.", starCategory: 5, popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["luxury", "5-star", "heritage", "international", "business", "romantic"], rating: 4.8 },
  { name: "Capsule Pod Boutique Hostel Singapore", location: "Singapore", price: 2500, description: "Modern capsule hostel in vibrant Little India, great for backpackers.", starCategory: 1, popularityScore: 7.5, recommendationWeight: 6, distanceScore: 8, tags: ["budget", "hostel", "backpacker", "solo", "affordable", "international"], rating: 4.1 },
];

// ─── FLIGHTS ───────────────────────────────────────────────────────────────────
const flights = [
  // Mumbai ↔ Delhi
  { airline: "IndiGo", origin: "Mumbai", destination: "Delhi", price: 4500, departureTime: d(1, 6, 0), arrivalTime: d(1, 8, 10), duration: "2h 10m", cabinClasses: ["Economy", "Business"], luggageAllowance: "15kg check-in + 7kg cabin", mealOptions: ["Snacks"], amenities: ["wifi", "entertainment"], aircraft: "Airbus A320", seatsAvailable: 45, popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["economy", "fast", "domestic", "budget", "popular"] },
  { airline: "Air India", origin: "Mumbai", destination: "Delhi", price: 6000, departureTime: d(1, 9, 0), arrivalTime: d(1, 11, 15), duration: "2h 15m", cabinClasses: ["Economy", "Business", "First"], luggageAllowance: "25kg check-in + 8kg cabin", mealOptions: ["Full Meal"], amenities: ["wifi", "meal", "blanket"], aircraft: "Boeing 787", seatsAvailable: 30, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 9, tags: ["premium", "full-service", "domestic", "comfort"] },
  { airline: "IndiGo", origin: "Delhi", destination: "Mumbai", price: 4200, departureTime: d(2, 7, 30), arrivalTime: d(2, 9, 45), duration: "2h 15m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in + 7kg cabin", mealOptions: ["Snacks"], amenities: ["wifi"], aircraft: "Airbus A320", seatsAvailable: 60, popularityScore: 9, recommendationWeight: 8, distanceScore: 9, tags: ["economy", "fast", "domestic", "budget"] },
  { airline: "Vistara", origin: "Delhi", destination: "Mumbai", price: 7500, departureTime: d(2, 14, 0), arrivalTime: d(2, 16, 20), duration: "2h 20m", cabinClasses: ["Economy", "Premium Economy", "Business"], luggageAllowance: "20kg check-in + 8kg cabin", mealOptions: ["Full Meal", "Veg", "Non-Veg"], amenities: ["wifi", "meal", "priority boarding", "lounge"], aircraft: "Airbus A320neo", seatsAvailable: 20, popularityScore: 8.5, recommendationWeight: 8.5, distanceScore: 9, tags: ["premium", "business", "luxury", "comfort", "domestic"] },

  // Mumbai ↔ Goa
  { airline: "SpiceJet", origin: "Mumbai", destination: "Goa", price: 2800, departureTime: d(1, 10, 0), arrivalTime: d(1, 11, 15), duration: "1h 15m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: [], aircraft: "Boeing 737", seatsAvailable: 80, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["budget", "vacation", "beach", "domestic", "fast"] },
  { airline: "IndiGo", origin: "Goa", destination: "Mumbai", price: 3000, departureTime: d(5, 16, 0), arrivalTime: d(5, 17, 15), duration: "1h 15m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: ["wifi"], aircraft: "Airbus A320", seatsAvailable: 55, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["budget", "domestic", "beach", "vacation"] },

  // Delhi ↔ Bangalore
  { airline: "Air India", origin: "Delhi", destination: "Bangalore", price: 5500, departureTime: d(1, 8, 0), arrivalTime: d(1, 10, 30), duration: "2h 30m", cabinClasses: ["Economy", "Business"], luggageAllowance: "25kg check-in + 8kg cabin", mealOptions: ["Full Meal"], amenities: ["wifi", "meal"], aircraft: "Airbus A320", seatsAvailable: 35, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["domestic", "comfort", "full-service", "tech-hub"] },
  { airline: "IndiGo", origin: "Bangalore", destination: "Delhi", price: 5000, departureTime: d(3, 6, 30), arrivalTime: d(3, 9, 0), duration: "2h 30m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: ["wifi"], aircraft: "Airbus A321", seatsAvailable: 50, popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["budget", "domestic", "fast"] },

  // Chennai ↔ Mumbai
  { airline: "SpiceJet", origin: "Chennai", destination: "Mumbai", price: 3800, departureTime: d(2, 7, 0), arrivalTime: d(2, 9, 15), duration: "2h 15m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: [], aircraft: "Boeing 737", seatsAvailable: 70, popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8, tags: ["budget", "domestic"] },
  { airline: "Vistara", origin: "Mumbai", destination: "Chennai", price: 5200, departureTime: d(1, 13, 0), arrivalTime: d(1, 15, 15), duration: "2h 15m", cabinClasses: ["Economy", "Premium Economy"], luggageAllowance: "20kg check-in + 8kg cabin", mealOptions: ["Full Meal"], amenities: ["wifi", "meal"], aircraft: "Airbus A320neo", seatsAvailable: 28, popularityScore: 7.5, recommendationWeight: 7.5, distanceScore: 8, tags: ["premium", "domestic", "comfort"] },

  // Hyderabad ↔ Bangalore
  { airline: "IndiGo", origin: "Hyderabad", destination: "Bangalore", price: 2500, departureTime: d(1, 11, 0), arrivalTime: d(1, 12, 10), duration: "1h 10m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: [], aircraft: "ATR 72", seatsAvailable: 40, popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8, tags: ["budget", "domestic", "short-haul"] },

  // Delhi ↔ Dubai (International)
  { airline: "Emirates", origin: "Delhi", destination: "Dubai", price: 22000, departureTime: d(3, 2, 0), arrivalTime: d(3, 4, 0), duration: "3h 30m", cabinClasses: ["Economy", "Business", "First"], luggageAllowance: "30kg check-in + 10kg cabin", mealOptions: ["Gourmet Meal", "Veg", "Non-Veg", "Halal"], amenities: ["wifi", "meal", "entertainment", "blanket", "lounge"], aircraft: "Boeing 777", seatsAvailable: 25, popularityScore: 9.5, recommendationWeight: 9, distanceScore: 9.5, tags: ["international", "luxury", "premium", "gulf", "business"] },
  { airline: "IndiGo", origin: "Delhi", destination: "Dubai", price: 14000, departureTime: d(4, 22, 0), arrivalTime: d(4, 23, 45), duration: "3h 45m", cabinClasses: ["Economy"], luggageAllowance: "20kg check-in + 7kg cabin", mealOptions: ["Snacks"], amenities: ["wifi"], aircraft: "Airbus A321XLR", seatsAvailable: 55, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 9, tags: ["budget", "international", "gulf"] },

  // Mumbai ↔ Singapore (International)
  { airline: "Singapore Airlines", origin: "Mumbai", destination: "Singapore", price: 35000, departureTime: d(5, 0, 30), arrivalTime: d(5, 9, 0), duration: "5h 30m", cabinClasses: ["Economy", "Business", "First"], luggageAllowance: "30kg check-in + 10kg cabin", mealOptions: ["Gourmet Meal"], amenities: ["wifi", "meal", "entertainment", "blanket", "lounge", "lie-flat-bed"], aircraft: "Airbus A350", seatsAvailable: 15, popularityScore: 9.8, recommendationWeight: 9.5, distanceScore: 9.5, tags: ["international", "luxury", "premium", "asia", "long-haul"] },
  { airline: "Air India", origin: "Mumbai", destination: "Singapore", price: 26000, departureTime: d(6, 3, 0), arrivalTime: d(6, 12, 0), duration: "5h 30m", cabinClasses: ["Economy", "Business"], luggageAllowance: "25kg check-in + 8kg cabin", mealOptions: ["Full Meal", "Veg"], amenities: ["wifi", "meal", "blanket"], aircraft: "Boeing 787", seatsAvailable: 30, popularityScore: 8.5, recommendationWeight: 8, distanceScore: 9, tags: ["international", "asia", "business"] },

  // Kolkata ↔ Delhi
  { airline: "IndiGo", origin: "Kolkata", destination: "Delhi", price: 4800, departureTime: d(1, 6, 0), arrivalTime: d(1, 8, 30), duration: "2h 30m", cabinClasses: ["Economy"], luggageAllowance: "15kg check-in", mealOptions: ["Snacks"], amenities: ["wifi"], aircraft: "Airbus A320", seatsAvailable: 45, popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8.5, tags: ["domestic", "economy", "budget"] },
];

// ─── BUSES ─────────────────────────────────────────────────────────────────────
const buses = [
  // Mumbai ↔ Goa
  { operator: "VRL Travels", origin: "Mumbai", destination: "Goa", price: 900, departureTime: d(1, 20, 0), arrivalTime: d(2, 6, 30), duration: "10h 30m", busType: "AC Sleeper", seatsAvailable: 18, amenities: ["AC", "sleeper", "charging-point", "blanket"], description: "Overnight sleeper bus with AC and comfortable beds.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8, tags: ["overnight", "sleeper", "affordable", "beach", "vacation", "economy"] },
  { operator: "Neeta Tours", origin: "Mumbai", destination: "Goa", price: 700, departureTime: d(2, 21, 0), arrivalTime: d(3, 7, 0), duration: "10h", busType: "Non-AC Sleeper", seatsAvailable: 25, amenities: ["sleeper", "charging-point"], description: "Budget overnight bus to Goa, no AC.", popularityScore: 6.5, recommendationWeight: 6, distanceScore: 8, tags: ["budget", "overnight", "beach", "affordable", "backpacker"] },
  { operator: "Paulo Travels", origin: "Goa", destination: "Mumbai", price: 950, departureTime: d(5, 22, 0), arrivalTime: d(6, 8, 30), duration: "10h 30m", busType: "AC Sleeper", seatsAvailable: 20, amenities: ["AC", "sleeper", "charging-point"], description: "Comfortable AC sleeper returning from Goa.", popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8, tags: ["overnight", "sleeper", "economy", "return"] },

  // Delhi ↔ Jaipur
  { operator: "Rajasthan Roadways", origin: "Delhi", destination: "Jaipur", price: 350, departureTime: d(1, 7, 0), arrivalTime: d(1, 12, 0), duration: "5h", busType: "AC Seater", seatsAvailable: 35, amenities: ["AC", "seater", "wifi"], description: "Comfortable AC bus on Delhi-Jaipur highway, great for day trips.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 9, tags: ["economy", "day-trip", "heritage", "tourism", "affordable"] },
  { operator: "RSRTC Volvo", origin: "Delhi", destination: "Jaipur", price: 500, departureTime: d(1, 9, 0), arrivalTime: d(1, 14, 0), duration: "5h", busType: "Volvo AC", seatsAvailable: 28, amenities: ["AC", "usb-charging", "comfortable-seats", "wifi"], description: "Premium Volvo bus service between Delhi and Pink City.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["premium", "comfortable", "tourism", "heritage", "economy"] },
  { operator: "Raj Express", origin: "Jaipur", destination: "Delhi", price: 400, departureTime: d(3, 18, 0), arrivalTime: d(3, 23, 30), duration: "5h 30m", busType: "AC Seater", seatsAvailable: 30, amenities: ["AC", "seater"], description: "Reliable AC bus returning from Jaipur to Delhi.", popularityScore: 7.5, recommendationWeight: 7, distanceScore: 9, tags: ["affordable", "return", "economy"] },

  // Bangalore ↔ Hyderabad
  { operator: "KSRTC Airavat", origin: "Bangalore", destination: "Hyderabad", price: 800, departureTime: d(1, 22, 0), arrivalTime: d(2, 8, 0), duration: "10h", busType: "Volvo Multi-Axle", seatsAvailable: 22, amenities: ["AC", "sleeper", "wifi", "charging"], description: "Premium KSRTC overnight service from Bangalore to Hyderabad.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 8.5, tags: ["overnight", "premium", "sleeper", "economy", "reliable"] },
  { operator: "Orange Travels", origin: "Hyderabad", destination: "Bangalore", price: 750, departureTime: d(2, 21, 30), arrivalTime: d(3, 7, 30), duration: "10h", busType: "AC Sleeper", seatsAvailable: 30, amenities: ["AC", "sleeper", "blanket", "charging"], description: "Comfortable AC sleeper between Hyderabad and Bangalore.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["overnight", "sleeper", "economy"] },

  // Chennai ↔ Bangalore
  { operator: "SRS Travels", origin: "Chennai", destination: "Bangalore", price: 500, departureTime: d(1, 23, 0), arrivalTime: d(2, 5, 30), duration: "6h 30m", busType: "AC Sleeper", seatsAvailable: 18, amenities: ["AC", "sleeper", "charging"], description: "Overnight AC sleeper between Chennai and Bangalore.", popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8, tags: ["overnight", "affordable", "economy"] },
  { operator: "TNSTC Deluxe", origin: "Chennai", destination: "Bangalore", price: 300, departureTime: d(2, 6, 30), arrivalTime: d(2, 12, 30), duration: "6h", busType: "Non-AC Seater", seatsAvailable: 40, amenities: ["seater"], description: "Government deluxe bus — most affordable option.", popularityScore: 6, recommendationWeight: 5, distanceScore: 7.5, tags: ["budget", "affordable", "economy", "backpacker"] },

  // Mumbai ↔ Pune
  { operator: "Shivneri MSRTC", origin: "Mumbai", destination: "Pune", price: 250, departureTime: d(1, 5, 30), arrivalTime: d(1, 8, 30), duration: "3h", busType: "AC Seater", seatsAvailable: 40, amenities: ["AC", "seater", "wifi"], description: "Premier government express bus on Mumbai-Pune Expressway.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["express", "affordable", "fast", "day-trip", "economy"] },
];

// ─── TRAINS ────────────────────────────────────────────────────────────────────
const trains = [
  // Mumbai ↔ Delhi
  { operator: "Rajdhani Express", origin: "Mumbai", destination: "Delhi", price: 2200, departureTime: d(1, 16, 35), arrivalTime: d(2, 8, 35), duration: "16h", trainType: "Superfast Express", seatsAvailable: 50, amenities: ["AC", "meal-included", "bedding", "charging"], description: "India's premier express train, fully air-conditioned with meals included.", popularityScore: 9.5, recommendationWeight: 9, distanceScore: 9, tags: ["premium", "superfast", "meal-included", "overnight", "reliable", "AC"] },
  { operator: "Duronto Express", origin: "Mumbai", destination: "Delhi", price: 1800, departureTime: d(2, 23, 10), arrivalTime: d(3, 14, 30), duration: "15h 20m", trainType: "Non-Stop Express", seatsAvailable: 65, amenities: ["AC", "meal-included", "bedding", "charging"], description: "Non-stop express with meals, ideal for overnight travel.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 9, tags: ["superfast", "non-stop", "overnight", "reliable", "economy"] },
  { operator: "Mumbai-Delhi SF Express", origin: "Delhi", destination: "Mumbai", price: 1500, departureTime: d(3, 5, 0), arrivalTime: d(3, 21, 0), duration: "16h", trainType: "Superfast Express", seatsAvailable: 80, amenities: ["AC", "charging", "pantry"], description: "Daily SF express with multiple AC class options.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["economy", "reliable", "comfortable"] },

  // Mumbai ↔ Goa
  { operator: "Konkan Kanya Express", origin: "Mumbai", destination: "Goa", price: 800, departureTime: d(1, 22, 10), arrivalTime: d(2, 8, 0), duration: "9h 50m", trainType: "Express", seatsAvailable: 90, amenities: ["charging", "pantry", "scenic-route"], description: "Scenic Konkan coastal route — the most beautiful train journey in India.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["scenic", "beach", "vacation", "overnight", "affordable", "popular"] },
  { operator: "Mandovi Express", origin: "Mumbai", destination: "Goa", price: 950, departureTime: d(3, 7, 15), arrivalTime: d(3, 18, 30), duration: "11h 15m", trainType: "Express", seatsAvailable: 75, amenities: ["AC", "pantry", "scenic-route"], description: "Daytime express with beautiful coastal views.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8.5, tags: ["scenic", "daytime", "beach", "vacation", "AC"] },

  // Delhi ↔ Jaipur
  { operator: "Pink City Shatabdi", origin: "Delhi", destination: "Jaipur", price: 650, departureTime: d(1, 6, 5), arrivalTime: d(1, 10, 35), duration: "4h 30m", trainType: "Shatabdi Express", seatsAvailable: 45, amenities: ["AC", "meal-included", "fast", "charging"], description: "High-speed Shatabdi with AC chair car and breakfast included.", popularityScore: 9.5, recommendationWeight: 9, distanceScore: 9.5, tags: ["fast", "premium", "heritage", "day-trip", "meal-included", "AC"] },
  { operator: "Ajmer Shatabdi", origin: "Delhi", destination: "Jaipur", price: 580, departureTime: d(2, 6, 20), arrivalTime: d(2, 10, 50), duration: "4h 30m", trainType: "Shatabdi Express", seatsAvailable: 38, amenities: ["AC", "meal-included", "fast"], description: "Express Shatabdi connecting Delhi to Jaipur via Ajmer.", popularityScore: 8.5, recommendationWeight: 8.5, distanceScore: 9, tags: ["fast", "premium", "AC", "heritage", "tourism"] },

  // Chennai ↔ Bangalore
  { operator: "Shatabdi Express", origin: "Chennai", destination: "Bangalore", price: 700, departureTime: d(1, 6, 0), arrivalTime: d(1, 11, 0), duration: "5h", trainType: "Shatabdi Express", seatsAvailable: 40, amenities: ["AC", "meal-included", "fast", "comfortable"], description: "Fastest train between Chennai and Bangalore with continental breakfast.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 8.5, tags: ["fast", "premium", "AC", "meal-included", "tech-hub"] },
  { operator: "Brindavan Express", origin: "Bangalore", destination: "Chennai", price: 400, departureTime: d(2, 6, 50), arrivalTime: d(2, 12, 15), duration: "5h 25m", trainType: "Express", seatsAvailable: 65, amenities: ["AC", "pantry"], description: "Popular affordable express connecting IT cities.", popularityScore: 7.5, recommendationWeight: 7, distanceScore: 8, tags: ["economy", "affordable", "AC"] },

  // Hyderabad ↔ Bangalore
  { operator: "Rajdhani Express", origin: "Hyderabad", destination: "Bangalore", price: 1200, departureTime: d(1, 17, 0), arrivalTime: d(2, 1, 0), duration: "8h", trainType: "Rajdhani Express", seatsAvailable: 55, amenities: ["AC", "meal-included", "bedding", "overnight"], description: "Overnight Rajdhani service between the two major tech cities.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 8.5, tags: ["premium", "overnight", "reliable", "tech-hub", "AC", "meal-included"] },

  // Kolkata ↔ Delhi
  { operator: "Rajdhani Express", origin: "Kolkata", destination: "Delhi", price: 2500, departureTime: d(1, 16, 55), arrivalTime: d(2, 10, 0), duration: "17h 5m", trainType: "Rajdhani Express", seatsAvailable: 30, amenities: ["AC", "meal-included", "bedding", "overnight", "charging"], description: "The grand Howrah Rajdhani — India's original premium express.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 9, tags: ["premium", "overnight", "reliable", "superfast", "AC", "meal-included"] },

  // Mumbai Suburban
  { operator: "Mumbai Local Fast", origin: "Mumbai", destination: "Pune", price: 180, departureTime: d(1, 8, 30), arrivalTime: d(1, 11, 0), duration: "2h 30m", trainType: "Intercity Express", seatsAvailable: 120, amenities: ["fast", "frequent"], description: "Frequent fast intercity trains to Pune via Deccan Express route.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 9, tags: ["affordable", "frequent", "day-trip", "economy"] },
];

// ─── MOVIES / ACTIVITIES ───────────────────────────────────────────────────────
const movies = [
  { title: "Jawan", description: "Action thriller starring Shah Rukh Khan as a prison warden on a mission.", poster: "", genre: ["Action", "Thriller", "Drama"], duration: "2h 49m", language: "Hindi", releaseYear: 2023, cast: ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"], rating: 7.8, location: "Mumbai", storyline: "A man seeks revenge while raising an unlikely army.", popularityScore: 9.5, recommendationWeight: 9, distanceScore: 8, tags: ["action", "blockbuster", "hindi", "popular", "entertainment"] },
  { title: "Leo", description: "High-octane action drama by Lokesh Kanagaraj with Thalapathy Vijay.", poster: "", genre: ["Action", "Drama", "Crime"], duration: "2h 44m", language: "Tamil", releaseYear: 2023, cast: ["Vijay", "Trisha", "Sanjay Dutt"], rating: 7.5, location: "Chennai", storyline: "A mild-mannered family man is pulled back into his violent past.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 8, tags: ["action", "tamil", "blockbuster", "popular"] },
  { title: "Kalki 2898 AD", description: "Epic sci-fi mythological film combining Mahabharata with futuristic India.", poster: "", genre: ["Sci-Fi", "Action", "Mythology", "Epic"], duration: "3h 1m", language: "Telugu", releaseYear: 2024, cast: ["Prabhas", "Deepika Padukone", "Amitabh Bachchan"], rating: 7.2, location: "Hyderabad", storyline: "In the year 2898 AD, a warrior must protect the last hope for humanity.", popularityScore: 9.8, recommendationWeight: 9.5, distanceScore: 9, tags: ["sci-fi", "mythology", "epic", "blockbuster", "telugu", "popular"] },
  { title: "Animal", description: "Intense crime thriller exploring father-son relationships and power.", poster: "", genre: ["Crime", "Action", "Drama"], duration: "3h 21m", language: "Hindi", releaseYear: 2023, cast: ["Ranbir Kapoor", "Anil Kapoor", "Bobby Deol"], rating: 7.7, location: "Delhi", storyline: "A rebellious son becomes a ruthless force to protect his father's empire.", popularityScore: 9.2, recommendationWeight: 8.8, distanceScore: 8, tags: ["crime", "action", "drama", "blockbuster", "hindi", "intense"] },
  { title: "Dunki", description: "Heartwarming comedy-drama about illegal immigration by Rajkumar Hirani.", poster: "", genre: ["Comedy", "Drama", "Family"], duration: "2h 41m", language: "Hindi", releaseYear: 2023, cast: ["Shah Rukh Khan", "Taapsee Pannu", "Vicky Kaushal"], rating: 7.0, location: "Mumbai", storyline: "A group of friends embark on an illegal journey to reach their dream country.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 8, tags: ["comedy", "family", "drama", "feel-good", "hindi", "heartwarming"] },
  { title: "Rocky Aur Rani Kii Prem Kahaani", description: "Romantic drama celebrating love across cultural divides by Karan Johar.", poster: "", genre: ["Romance", "Drama", "Comedy"], duration: "2h 48m", language: "Hindi", releaseYear: 2023, cast: ["Ranveer Singh", "Alia Bhatt", "Dharmendra"], rating: 7.3, location: "Delhi", storyline: "A flamboyant punjabi boy and a strong-willed Bengali girl fall in love.", popularityScore: 8.3, recommendationWeight: 8, distanceScore: 7.5, tags: ["romance", "drama", "family", "feel-good", "hindi", "romantic"] },
  { title: "Laapataa Ladies", description: "Subtle social comedy about two brides who get accidentally swapped.", poster: "", genre: ["Comedy", "Drama", "Social"], duration: "2h 1m", language: "Hindi", releaseYear: 2024, cast: ["Nitanshi Goel", "Pratibha Ranta"], rating: 7.8, location: "Mumbai", storyline: "Two newly wed brides get swapped at a train station, triggering a gentle revolution.", popularityScore: 8.5, recommendationWeight: 8.5, distanceScore: 8, tags: ["comedy", "social", "feel-good", "hindi", "award-winning", "heartwarming"] },
  { title: "Fighter", description: "Patriotic air-combat thriller featuring IAF pilots. India's Top Gun.", poster: "", genre: ["Action", "War", "Drama"], duration: "2h 46m", language: "Hindi", releaseYear: 2024, cast: ["Hrithik Roshan", "Deepika Padukone", "Anil Kapoor"], rating: 6.8, location: "Mumbai", storyline: "Elite IAF squad takes on cross-border terrorism in an epic aerial battle.", popularityScore: 8, recommendationWeight: 7.5, distanceScore: 8, tags: ["action", "patriotic", "war", "hindi", "thrilling"] },
  { title: "Oppenheimer", description: "Christopher Nolan's biographical epic about the father of the atomic bomb.", poster: "", genre: ["Biography", "Drama", "History"], duration: "3h", language: "English", releaseYear: 2023, cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."], rating: 8.9, location: "Mumbai", storyline: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.", popularityScore: 9, recommendationWeight: 8.5, distanceScore: 7, tags: ["biography", "award-winning", "english", "drama", "intellectual"] },
  { title: "Barbie", description: "Vibrant fantasy comedy about Barbie going to the real world.", poster: "", genre: ["Comedy", "Fantasy", "Adventure"], duration: "1h 54m", language: "English", releaseYear: 2023, cast: ["Margot Robbie", "Ryan Gosling"], rating: 6.9, location: "Mumbai", storyline: "Barbie and Ken leave Barbieland for the real world in this witty comedy.", popularityScore: 8.5, recommendationWeight: 8, distanceScore: 7, tags: ["comedy", "fantasy", "fun", "english", "popular", "feel-good"] },
  { title: "KGF Chapter 3", description: "Upcoming mega-sequel to India's biggest franchise about Rocky's legend.", poster: "", genre: ["Action", "Crime", "Drama"], duration: "3h+", language: "Kannada", releaseYear: 2025, cast: ["Yash", "Sanjay Dutt", "Raveena Tandon"], rating: 8.5, location: "Bangalore", storyline: "The legend of Rocky continues as new enemies rise to claim the KGF gold mines.", popularityScore: 9.9, recommendationWeight: 9.5, distanceScore: 9, tags: ["action", "blockbuster", "kannada", "epic", "crime", "upcoming"] },
  { title: "Merry Christmas", description: "Sriram Raghavan's stylish neo-noir thriller releasing on Christmas.", poster: "", genre: ["Thriller", "Mystery", "Romance"], duration: "2h 14m", language: "Hindi", releaseYear: 2024, cast: ["Katrina Kaif", "Vijay Sethupathi"], rating: 7.4, location: "Mumbai", storyline: "A chance Christmas meeting leads to an unexpected night of love, secrets, and danger.", popularityScore: 7.5, recommendationWeight: 7.5, distanceScore: 7, tags: ["thriller", "romance", "mystery", "hindi", "neo-noir"] },
];

// ─── SEEDER FUNCTION ───────────────────────────────────────────────────────────
const seedAll = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing
    console.log("🗑️  Clearing existing AI data...");
    await Promise.all([
      Hotel.deleteMany({}),
      Flight.deleteMany({}),
      Bus.deleteMany({}),
      Train.deleteMany({}),
      Movie.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data\n");

    // Insert
    console.log("📦 Inserting Hotels...");
    const hotelResult = await Hotel.insertMany(hotels);
    console.log(`✅ Inserted ${hotelResult.length} hotels`);

    console.log("✈️  Inserting Flights...");
    const flightResult = await Flight.insertMany(flights);
    console.log(`✅ Inserted ${flightResult.length} flights`);

    console.log("🚌 Inserting Buses...");
    const busResult = await Bus.insertMany(buses);
    console.log(`✅ Inserted ${busResult.length} buses`);

    console.log("🚂 Inserting Trains...");
    const trainResult = await Train.insertMany(trains);
    console.log(`✅ Inserted ${trainResult.length} trains`);

    console.log("🎬 Inserting Movies...");
    const movieResult = await Movie.insertMany(movies);
    console.log(`✅ Inserted ${movieResult.length} movies\n`);

    console.log("══════════════════════════════════════");
    console.log(`🎉 Seed complete!`);
    console.log(`   Hotels  : ${hotelResult.length}`);
    console.log(`   Flights : ${flightResult.length}`);
    console.log(`   Buses   : ${busResult.length}`);
    console.log(`   Trains  : ${trainResult.length}`);
    console.log(`   Movies  : ${movieResult.length}`);
    console.log(`   TOTAL   : ${hotelResult.length + flightResult.length + busResult.length + trainResult.length + movieResult.length} records`);
    console.log("══════════════════════════════════════\n");
    return {
      hotels: hotelResult.length,
      flights: flightResult.length,
      buses: busResult.length,
      trains: trainResult.length,
      movies: movieResult.length,
    };
  } catch (err) {
    throw err;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close().catch(() => {});
    }
  }
};

if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err.message);
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedAll };
