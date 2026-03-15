import api from "./api";

export const createTrainBooking = async (payload) => {
  const response = await api.post("/train-bookings", payload);
  return response.data;
};

export const getMyTrainBookings = async () => {
  const response = await api.get("/train-bookings/my-bookings");
  return response.data;
};
