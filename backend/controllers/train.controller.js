const Train = require("../models/Train");
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

const normalizeTrainPayload = (payload = {}) => ({
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

const syncFeaturedTrain = async (trainId, isFeatured) => {
  if (!isFeatured) {
    return;
  }

  await Train.updateMany({ _id: { $ne: trainId } }, { $set: { isFeatured: false } });
};

exports.getTrains = async (req, res) => {
  try {
    const trains = await Train.find({}).sort({ isFeatured: -1, createdAt: -1 });
    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTrain = async (req, res) => {
  try {
    const trainData = normalizeTrainPayload(req.body);

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/trains/images",
        resourceType: "image",
      });
      trainData.image = uploadedImage.secure_url;
    }

    const train = await Train.create(trainData);
    await syncFeaturedTrain(train._id, train.isFeatured);

    res.status(201).json(train);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTrain = async (req, res) => {
  try {
    const trainData = normalizeTrainPayload(req.body);

    Object.keys(trainData).forEach((key) => {
      if (trainData[key] === undefined || Number.isNaN(trainData[key])) {
        delete trainData[key];
      }
    });

    if (req.files?.image?.[0]) {
      const uploadedImage = await uploadToCloudinary(req.files.image[0], {
        folder: "unified-booking/trains/images",
        resourceType: "image",
      });
      trainData.image = uploadedImage.secure_url;
    }

    const updatedTrain = await Train.findByIdAndUpdate(req.params.id, trainData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    await syncFeaturedTrain(updatedTrain._id, updatedTrain.isFeatured);

    res.json(updatedTrain);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTrain = async (req, res) => {
  try {
    const deletedTrain = await Train.findByIdAndDelete(req.params.id);

    if (!deletedTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};