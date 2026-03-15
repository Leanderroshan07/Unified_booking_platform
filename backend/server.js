const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const chatRoute = require("./routes/chat");


const app = express();
// Middlewares
app.use(cors());
app.use(express.json());

// Diagnostic routes
app.get("/api/ping", (req, res) => res.json({ status: "ok", message: "API is reachable" }));
app.get("/api/hotels/ping", (req, res) => res.json({ status: "ok", message: "Hotel routes are reachable" }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/movies", require("./routes/movie.routes"));
app.use("/api/flights", require("./routes/flight.routes"));
app.use("/api/trains", require("./routes/train.routes"));
app.use("/api/train", require("./routes/train.routes"));
app.use("/api/buses", require("./routes/bus.routes"));
app.use("/api/bus", require("./routes/bus.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/hotel-bookings", require("./routes/hotelBooking.routes"));
app.use("/api/flight-bookings", require("./routes/flightBooking.routes"));
app.use("/api/bus-bookings", require("./routes/busBooking.routes"));
app.use("/api/train-bookings", require("./routes/trainBooking.routes"));
app.use("/api/ai-assistant", require("./routes/aiAssistant.routes"));
app.use("/api/hotels", require("./routes/hotel.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/route-matrix", require("./routes/routeMatrix.routes"));

app.use("/api/chat", chatRoute);

// Test routes
app.get("/", (req, res) => res.send("Unified Booking Platform API running..."));
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});