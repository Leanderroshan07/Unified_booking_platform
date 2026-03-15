const Bus = require("../models/Bus");
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

const normalizeBusPayload = (payload = {}) => ({
  ...payload,
  price: payload.price === undefined ? undefined : Number(payload.price),
  seatsAvailable:
    payload.seatsAvailable === undefined ? undefined : Number(payload.seatsAvailable),
  popularityScore:
    payload.popularityScore === undefined ? undefined : Number(payload.popularityScore),
  recommendationWeight:
    payload.recommendationWeight === undefined ? undefined : Number(payload.recommendationWeight),
  distanceScore:
    payload.distanceScore === undefined ? undefined : Number(payload.distanceScore),
  departureTime: payload.departureTime ? new Date(payload.departureTime) : undefined,
  arrivalTime: payload.arrivalTime ? new Date(payload.arrivalTime) : undefined,
  amenities: payload.amenities === undefined ? undefined : parseListField(payload.amenities),
  tags: payload.tags === undefined ? undefined : parseListField(payload.tags),
  travelTime: payload.travelTime === undefined ? undefined : String(payload.travelTime).trim(),
  isFeatured:
    payload.isFeatured === true ||
    payload.isFeatured === "true" ||
    payload.isFeatured === "on",
});

const syncFeaturedBus = async (busId, isFeatured) => {
  if (!isFeatured) {
    return;
  }

  await Bus.updateMany({ _id: { $ne: busId } }, { $set: { isFeatured: false } });
};

exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find({}).sort({ isFeatured: -1, createdAt: -1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBus = async (req, res) => {
  try {
    const busData = normalizeBusPayload(req.body);

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/buses/images",
        resourceType: "image",
      });
      busData.image = uploadedImage.secure_url;
    }

    const bus = await Bus.create(busData);
    await syncFeaturedBus(bus._id, bus.isFeatured);

    res.status(201).json(bus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const busData = normalizeBusPayload(req.body);

    Object.keys(busData).forEach((key) => {
      if (busData[key] === undefined || Number.isNaN(busData[key])) {
        delete busData[key];
      }
    });

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/buses/images",
        resourceType: "image",
      });
      busData.image = uploadedImage.secure_url;
    }

    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, busData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    await syncFeaturedBus(updatedBus._id, updatedBus.isFeatured);

    res.json(updatedBus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);

    if (!deletedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
