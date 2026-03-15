const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./config/db");
const RouteMatrix = require("./models/RouteMatrix");
const { buildRouteKey } = require("./services/routeMatrixService");

const ROUTES = [
  { from: "Chennai", to: "Delhi", distanceKm: 2200, flightMinutes: 165, trainMinutes: 1980, busMinutes: 2160 },
  { from: "Chennai", to: "Mumbai", distanceKm: 1335, flightMinutes: 120, trainMinutes: 960, busMinutes: 1380 },
  { from: "Chennai", to: "Bangalore", distanceKm: 350, flightMinutes: 60, trainMinutes: 360, busMinutes: 420 },
  { from: "Chennai", to: "Hyderabad", distanceKm: 630, flightMinutes: 80, trainMinutes: 510, busMinutes: 600 },

  { from: "Delhi", to: "Mumbai", distanceKm: 1410, flightMinutes: 130, trainMinutes: 1020, busMinutes: 1680 },
  { from: "Delhi", to: "Bangalore", distanceKm: 2150, flightMinutes: 170, trainMinutes: 2160, busMinutes: 2340 },
  { from: "Delhi", to: "Hyderabad", distanceKm: 1570, flightMinutes: 140, trainMinutes: 1140, busMinutes: 1860 },

  { from: "Mumbai", to: "Bangalore", distanceKm: 980, flightMinutes: 105, trainMinutes: 840, busMinutes: 1020 },
  { from: "Mumbai", to: "Hyderabad", distanceKm: 710, flightMinutes: 85, trainMinutes: 660, busMinutes: 780 },

  { from: "Bangalore", to: "Hyderabad", distanceKm: 570, flightMinutes: 75, trainMinutes: 540, busMinutes: 660 },
];

async function seedRoutes() {
  await connectDB();

  const created = [];

  for (const row of ROUTES) {
    const payload = {
      from: row.from,
      to: row.to,
      routeKey: buildRouteKey(row.from, row.to),
      distanceKm: row.distanceKm,
      travelMinutes: {
        flight: row.flightMinutes,
        train: row.trainMinutes,
        bus: row.busMinutes,
      },
    };

    const saved = await RouteMatrix.findOneAndUpdate(
      { routeKey: payload.routeKey },
      payload,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    created.push({
      id: saved._id.toString(),
      from: saved.from,
      to: saved.to,
      distanceKm: saved.distanceKm,
    });
  }

  console.log(JSON.stringify({ total: created.length, routes: created }, null, 2));
}

seedRoutes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.stack || error.message || error);
    process.exit(1);
  });
