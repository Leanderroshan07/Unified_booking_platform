import api from "./api";

export const getRoutes = async () => {
  const response = await api.get("/route-matrix");
  return response.data;
};

export const lookupRoute = async (from, to) => {
  const response = await api.get("/route-matrix/lookup", {
    params: { from, to },
  });
  return response.data;
};

export const createRoute = async (payload) => {
  const response = await api.post("/route-matrix", payload);
  return response.data;
};

export const updateRoute = async (id, payload) => {
  const response = await api.put(`/route-matrix/${id}`, payload);
  return response.data;
};

export const deleteRoute = async (id) => {
  const response = await api.delete(`/route-matrix/${id}`);
  return response.data;
};
