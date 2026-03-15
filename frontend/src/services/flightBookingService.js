import api from "./api";

export const createFlightBooking = async (payload) => {
  const response = await api.post("/flight-bookings", payload);
  return response.data;
};

export const getMyFlightBookings = async () => {
  const response = await api.get("/flight-bookings/my-bookings");
  return response.data;
};
