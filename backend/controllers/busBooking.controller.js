const { randomBytes } = require("crypto");
const Bus = require("../models/Bus");
const BusBooking = require("../models/BusBooking");

const BUS_BOOKING_POPULATE_FIELDS =
  "operator origin destination departureTime arrivalTime duration busType image amenities price";

const createBookingReference = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = randomBytes(3).toString("hex").toUpperCase();
    const bookingReference = `BUS-${datePart}-${randomPart}`;

    const existingBooking = await BusBooking.findOne({ bookingReference }).select("_id");
    if (!existingBooking) {
      return bookingReference;
    }
  }

  throw new Error("Unable to generate booking reference");
};

exports.createBusBooking = async (req, res) => {
  let reservedBus = null;

  try {
    const {
      bus,
      seatPreference,
      passengers,
      basePrice,
      taxes,
      totalPrice,
    } = req.body;

    const adults = Math.max(1, Number(passengers?.adults || 1));
    const children = Math.max(0, Number(passengers?.children || 0));
    const totalPassengers = adults + children;

    if (!bus || !seatPreference || totalPrice == null) {
      return res.status(400).json({
        message: "bus, seatPreference and totalPrice are required",
      });
    }

    reservedBus = await Bus.findOneAndUpdate(
      { _id: bus, seatsAvailable: { $gte: totalPassengers } },
      { $inc: { seatsAvailable: -totalPassengers } },
      { new: true }
    );

    if (!reservedBus) {
      const existingBus = await Bus.findById(bus).select("_id seatsAvailable");

      if (!existingBus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      return res.status(400).json({
        message: `Only ${existingBus.seatsAvailable} seat(s) are available for this route right now`,
      });
    }

    const bookingReference = await createBookingReference();

    const booking = await BusBooking.create({
      user: req.user.id,
      bus,
      bookingReference,
      seatPreference,
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
      path: "bus",
      select: BUS_BOOKING_POPULATE_FIELDS,
    });

    return res.status(201).json(populatedBooking);
  } catch (error) {
    if (reservedBus) {
      const adults = Math.max(1, Number(req.body?.passengers?.adults || 1));
      const children = Math.max(0, Number(req.body?.passengers?.children || 0));

      await Bus.findByIdAndUpdate(req.body.bus, {
        $inc: { seatsAvailable: adults + children },
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

exports.getMyBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find({ user: req.user.id })
      .populate({
        path: "bus",
        select: BUS_BOOKING_POPULATE_FIELDS,
      })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};