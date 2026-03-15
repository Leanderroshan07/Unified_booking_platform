import api from "./api";

// Get booked seats for a movie, date, and time
export const getBookedSeats = (movieId, date, time) =>
    api.get(`/bookings/seats?movie=${movieId}&date=${date}&time=${time}`);

// Create a new booking
export const createBooking = (bookingData) =>
    api.post("/bookings", bookingData);

// Get all bookings for the logged-in user
export const getUserBookings = () =>
    api.get("/bookings/my-bookings");

// Legacy/Internal: Mock initial availability if needed
export const getInitialSeatLayout = () => {
    const rows = 8;
    const cols = 12;
    const seats = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            seats.push({
                id: `${String.fromCharCode(65 + r)}${c + 1}`,
                row: String.fromCharCode(65 + r),
                number: c + 1,
                status: "available",
                price: r < 3 ? 15 : 10,
            });
        }
    }
    return seats;
};
