const { randomBytes } = require("crypto");
const Train = require("../models/Train");
const TrainBooking = require("../models/TrainBooking");

const TRAIN_BOOKING_POPULATE_FIELDS =
  "operator origin destination departureTime arrivalTime duration trainType image amenities price";

const createBookingReference = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    const bookingReference = `TRN-${datePart}-${randomPart}`;

    const existingBooking = await TrainBooking.findOne({ bookingReference }).select("_id");
    if (!existingBooking) {
      return bookingReference;
    }
  }

  throw new Error("Unable to generate booking reference");
};

exports.createTrainBooking = async (req, res) => {
  let reservedTrain = null;

  try {
    const {
      train,
      travelClass,
      passengers,
      basePrice,
      taxes,
      totalPrice,
    } = req.body;

    const adults = Math.max(1, Number(passengers?.adults || 1));
    const children = Math.max(0, Number(passengers?.children || 0));
    const totalPassengers = adults + children;

    if (!train || !travelClass || totalPrice == null) {
      return res.status(400).json({
        message: "train, travelClass and totalPrice are required",
      });
    }

    reservedTrain = await Train.findOneAndUpdate(
      { _id: train, seatsAvailable: { $gte: totalPassengers } },
      { $inc: { seatsAvailable: -totalPassengers } },
      { new: true }
    );

    if (!reservedTrain) {
      const existingTrain = await Train.findById(train).select("_id seatsAvailable");

      if (!existingTrain) {
        return res.status(404).json({ message: "Train not found" });
      }

      return res.status(400).json({
        message: `Only ${existingTrain.seatsAvailable} seat(s) are available for this route right now`,
      });
    }

    const bookingReference = await createBookingReference();

    const booking = await TrainBooking.create({
      user: req.user.id,
      train,
      bookingReference,
      travelClass,
      passengers: {
        adults,
        children,
      },
      basePrice: Number(basePrice || 0),
      taxes: Number(taxes || 0),
      totalPrice: Number(totalPrice || 0),
      status: "confirmed",
    });

    const populatedBooking = await booking.populate({
      path: "train",
      select: TRAIN_BOOKING_POPULATE_FIELDS,
    });

    return res.status(201).json(populatedBooking);
  } catch (error) {
    if (reservedTrain) {
      const adults = Math.max(1, Number(req.body?.passengers?.adults || 1));
      const children = Math.max(0, Number(req.body?.passengers?.children || 0));

      await Train.findByIdAndUpdate(req.body.train, {
        $inc: { seatsAvailable: adults + children },
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

exports.getMyTrainBookings = async (req, res) => {
  try {
    const bookings = await TrainBooking.find({ user: req.user.id })
      .populate({
        path: "train",
        select: TRAIN_BOOKING_POPULATE_FIELDS,
      })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
