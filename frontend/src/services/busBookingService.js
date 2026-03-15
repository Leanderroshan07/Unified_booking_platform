import api from "./api";

export const createBusBooking = async (payload) => {
  const response = await api.post("/bus-bookings", payload);
  return response.data;
};

export const getMyBusBookings = async () => {
  const response = await api.get("/bus-bookings/my-bookings");
  return response.data;
};