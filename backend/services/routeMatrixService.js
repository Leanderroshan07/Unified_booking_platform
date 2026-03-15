const RouteMatrix = require("../models/RouteMatrix");

const normalizeCity = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const titleCase = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildRouteKey = (from, to) => {
  const pair = [normalizeCity(from), normalizeCity(to)].sort();
  return `${pair[0]}::${pair[1]}`;
};

const pickFastestMode = (travelMinutes = {}) => {
  const candidates = ["flight", "train", "bus"]
    .map((mode) => ({ mode, minutes: Number(travelMinutes?.[mode]) }))
    .filter((entry) => Number.isFinite(entry.minutes) && entry.minutes > 0)
    .sort((a, b) => a.minutes - b.minutes);

  return candidates[0] || null;
};

const getRouteByCities = async (from, to) => {
  const fromNorm = normalizeCity(from);
  const toNorm = normalizeCity(to);

  if (!fromNorm || !toNorm || fromNorm === toNorm) {
    return null;
  }

  const routeKey = buildRouteKey(fromNorm, toNorm);
  const route = await RouteMatrix.findOne({ routeKey }).lean();

  if (!route) {
    return null;
  }

  const fastest = pickFastestMode(route.travelMinutes);

  return {
    ...route,
    from: titleCase(route.from),
    to: titleCase(route.to),
    routeKey,
    fastestMode: fastest?.mode || null,
    fastestMinutes: fastest?.minutes || null,
  };
};

module.exports = {
  normalizeCity,
  titleCase,
  buildRouteKey,
  pickFastestMode,
  getRouteByCities,
};
