const HotelBooking = require("../models/HotelBooking");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

exports.createHotelBooking = async (req, res) => {
  try {
    const {
      hotel,
      room,
      roomType,
      checkInDate,
      nights,
      guests,
      pricePerNight,
      taxesPerNight,
      totalPrice,
    } = req.body;

    if (!hotel || !roomType || !checkInDate || !nights || totalPrice == null) {
      return res.status(400).json({
        message: "hotel, roomType, checkInDate, nights and totalPrice are required",
      });
    }

    const normalizedNights = Number(nights);
    if (!Number.isFinite(normalizedNights) || normalizedNights < 1) {
      return res.status(400).json({ message: "nights must be at least 1" });
    }

    const existingHotel = await Hotel.findById(hotel);
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (room) {
      const existingRoom = await Room.findOne({ _id: room, hotel });
      if (!existingRoom) {
        return res.status(400).json({ message: "Selected room is invalid for this hotel" });
      }
    }

    const booking = await HotelBooking.create({
      user: req.user.id,
      hotel,
      room: room || undefined,
      roomType,
      checkInDate,
      nights: normalizedNights,
      guests: {
        adults: Number(guests?.adults || 2),
        children: Number(guests?.children || 0),
      },
      pricePerNight: Number(pricePerNight || 0),
      taxesPerNight: Number(taxesPerNight || 0),
      totalPrice: Number(totalPrice || 0),
      status: "confirmed",
    });

    const populatedBooking = await booking.populate([
      { path: "hotel", select: "name location images" },
      { path: "room", select: "type capacity images" },
    ]);

    return res.status(201).json(populatedBooking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ user: req.user.id })
      .populate({ path: "hotel", select: "name location images" })
      .populate({ path: "room", select: "type capacity images" })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
