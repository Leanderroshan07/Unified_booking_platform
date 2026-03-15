const Booking = require("../models/Booking");

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { movie, seats, totalPrice, date, time } = req.body;
        const userId = req.user.id; // From authMiddleware

        const booking = await Booking.create({
            user: userId,
            movie,
            seats,
            totalPrice,
            date,
            time,
            status: "confirmed", // Simulating instant confirmation for now
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get booked seats for a specific movie, date, and time
exports.getBookedSeats = async (req, res) => {
    try {
        const { movie, date, time } = req.query;

        if (!movie || !date || !time) {
            return res.status(400).json({ message: "Movie, date, and time are required" });
        }

        const bookings = await Booking.find({ movie, date, time, status: "confirmed" });

        // Extract all seat IDs from bookings
        const bookedSeats = bookings.reduce((acc, booking) => {
            return acc.concat(booking.seats.map(seat => seat.id));
        }, []);

        res.json(bookedSeats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate("movie");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
