const Flight = require("../models/Flight");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const parseListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeFlightPayload = (payload = {}) => ({
  ...payload,
  price: payload.price === undefined ? undefined : Number(payload.price),
  popularityScore:
    payload.popularityScore === undefined ? undefined : Number(payload.popularityScore),
  recommendationWeight:
    payload.recommendationWeight === undefined ? undefined : Number(payload.recommendationWeight),
  distanceScore:
    payload.distanceScore === undefined ? undefined : Number(payload.distanceScore),
  departureTime: payload.departureTime ? new Date(payload.departureTime) : undefined,
  arrivalTime: payload.arrivalTime ? new Date(payload.arrivalTime) : undefined,
  cabinClasses: payload.cabinClasses === undefined ? undefined : parseListField(payload.cabinClasses),
  mealOptions: payload.mealOptions === undefined ? undefined : parseListField(payload.mealOptions),
  amenities: payload.amenities === undefined ? undefined : parseListField(payload.amenities),
  tags: payload.tags === undefined ? undefined : parseListField(payload.tags),
  travelTime: payload.travelTime === undefined ? undefined : String(payload.travelTime).trim(),
  isFeatured:
    payload.isFeatured === true ||
    payload.isFeatured === "true" ||
    payload.isFeatured === "on",
});

const syncFeaturedFlight = async (flightId, isFeatured) => {
  if (!isFeatured) {
    return;
  }

  await Flight.updateMany(
    { _id: { $ne: flightId } },
    { $set: { isFeatured: false } }
  );
};

exports.getFlights = async (req, res) => {
  try {
    const flights = await Flight.find({}).sort({ isFeatured: -1, createdAt: -1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const flightData = normalizeFlightPayload(req.body);

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/flights/images",
        resourceType: "image",
      });
      flightData.image = uploadedImage.secure_url;
    }

    const flight = await Flight.create(flightData);
    await syncFeaturedFlight(flight._id, flight.isFeatured);

    res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const flightData = normalizeFlightPayload(req.body);

    Object.keys(flightData).forEach((key) => {
      if (flightData[key] === undefined || Number.isNaN(flightData[key])) {
        delete flightData[key];
      }
    });

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/flights/images",
        resourceType: "image",
      });
      flightData.image = uploadedImage.secure_url;
    }

    const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, flightData, {
      new: true,
      runValidators: true,
    });

    if (!updatedFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    await syncFeaturedFlight(updatedFlight._id, updatedFlight.isFeatured);

    res.json(updatedFlight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    const deletedFlight = await Flight.findByIdAndDelete(req.params.id);

    if (!deletedFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json({ message: "Flight deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};