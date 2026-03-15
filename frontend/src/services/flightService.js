import api from "./api";

export const getFlights = async () => {
  const response = await api.get("/flights");
  return response.data;
};

export const getFlightById = async (id) => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

export const createFlight = async (flight) =>
  api.post("/flights", flight, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateFlight = async (id, flight) =>
  api.put(`/flights/${id}`, flight, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const deleteFlight = async (id) =>
  api.delete(`/flights/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });