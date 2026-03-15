import api from "./api";

export const createHotelBooking = async (payload) => {
  const response = await api.post("/hotel-bookings", payload);
  return response.data;
};

export const getMyHotelBookings = async () => {
  const response = await api.get("/hotel-bookings/my-bookings");
  return response.data;
};
