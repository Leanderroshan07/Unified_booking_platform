const mongoose = require("mongoose");

const normalizeCity = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const buildRouteKey = (from, to) => {
  const pair = [normalizeCity(from), normalizeCity(to)].sort();
  return `${pair[0]}::${pair[1]}`;
};

const routeMatrixSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    routeKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 1,
    },
    travelMinutes: {
      flight: { type: Number, min: 1 },
      train: { type: Number, min: 1 },
      bus: { type: Number, min: 1 },
    },
  },
  { timestamps: true }
);

routeMatrixSchema.pre("validate", function preValidate(next) {
  if (this.from && this.to) {
    this.routeKey = buildRouteKey(this.from, this.to);
  }
  next();
});

routeMatrixSchema.statics.buildRouteKey = buildRouteKey;
routeMatrixSchema.statics.normalizeCity = normalizeCity;

module.exports = mongoose.model("RouteMatrix", routeMatrixSchema);
