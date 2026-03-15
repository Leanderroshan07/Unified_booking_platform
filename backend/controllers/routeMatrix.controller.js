const RouteMatrix = require("../models/RouteMatrix");
const {
  getRouteByCities,
  titleCase,
  buildRouteKey,
} = require("../services/routeMatrixService");

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizePayload = (payload = {}) => {
  const from = titleCase(payload.from);
  const to = titleCase(payload.to);

  return {
    from,
    to,
    routeKey: buildRouteKey(from, to),
    distanceKm: toPositiveNumber(payload.distanceKm),
    travelMinutes: {
      flight: toPositiveNumber(payload.flightMinutes ?? payload?.travelMinutes?.flight),
      train: toPositiveNumber(payload.trainMinutes ?? payload?.travelMinutes?.train),
      bus: toPositiveNumber(payload.busMinutes ?? payload?.travelMinutes?.bus),
    },
  };
};

exports.lookupRoute = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "from and to query params are required" });
    }

    const route = await getRouteByCities(from, to);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.json(route);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRoutes = async (_req, res) => {
  try {
    const routes = await RouteMatrix.find({}).sort({ from: 1, to: 1 }).lean();
    return res.json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const data = normalizePayload(req.body);

    if (!data.from || !data.to || data.from.toLowerCase() === data.to.toLowerCase()) {
      return res.status(400).json({ message: "Please provide valid from and to cities" });
    }

    if (!data.distanceKm) {
      return res.status(400).json({ message: "distanceKm is required and must be positive" });
    }

    const route = await RouteMatrix.findOneAndUpdate(
      { routeKey: data.routeKey },
      data,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(route);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const existing = await RouteMatrix.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Route not found" });
    }

    const mergedPayload = {
      from: req.body.from ?? existing.from,
      to: req.body.to ?? existing.to,
      distanceKm: req.body.distanceKm ?? existing.distanceKm,
      flightMinutes: req.body.flightMinutes ?? existing?.travelMinutes?.flight,
      trainMinutes: req.body.trainMinutes ?? existing?.travelMinutes?.train,
      busMinutes: req.body.busMinutes ?? existing?.travelMinutes?.bus,
    };

    const data = normalizePayload(mergedPayload);

    if (!data.from || !data.to || data.from.toLowerCase() === data.to.toLowerCase()) {
      return res.status(400).json({ message: "Please provide valid from and to cities" });
    }

    if (!data.distanceKm) {
      return res.status(400).json({ message: "distanceKm is required and must be positive" });
    }

    const route = await RouteMatrix.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    return res.json(route);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const deleted = await RouteMatrix.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.json({ message: "Route deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
