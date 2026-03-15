const FlightBooking = require("../models/FlightBooking");
const Flight = require("../models/Flight");

exports.createFlightBooking = async (req, res) => {
  try {
    const {
      flight,
      travelClass,
      mealPlan,
      luggage,
      passengers,
      basePrice,
      taxes,
      totalPrice,
    } = req.body;

    if (!flight || !travelClass || totalPrice == null) {
      return res.status(400).json({
        message: "flight, travelClass and totalPrice are required",
      });
    }

    const existingFlight = await Flight.findById(flight);
    if (!existingFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const booking = await FlightBooking.create({
      user: req.user.id,
      flight,
      travelClass,
      mealPlan: mealPlan || "Standard meal",
      luggage: luggage || existingFlight.luggageAllowance || "Standard allowance",
      passengers: {
        adults: Number(passengers?.adults || 1),
        children: Number(passengers?.children || 0),
      },
      basePrice: Number(basePrice || 0),
      taxes: Number(taxes || 0),
      totalPrice: Number(totalPrice || 0),
      status: "confirmed",
    });

    const populatedBooking = await booking.populate({
      path: "flight",
      select:
        "airline origin destination departureTime arrivalTime duration aircraft image luggageAllowance cabinClasses mealOptions",
    });

    return res.status(201).json(populatedBooking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyFlightBookings = async (req, res) => {
  try {
    const bookings = await FlightBooking.find({ user: req.user.id })
      .populate({
        path: "flight",
        select:
          "airline origin destination departureTime arrivalTime duration aircraft image luggageAllowance cabinClasses mealOptions",
      })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};