import api from "./api";

const BUS_ENDPOINTS = ["/buses", "/bus"];

const getFirstSuccessful = async (candidates) => {
  let lastError = null;

  for (const endpoint of candidates) {
    try {
      return await api.get(endpoint);
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const getBuses = async () => {
  const response = await getFirstSuccessful(BUS_ENDPOINTS);
  return response.data;
};

export const getBusById = async (id) => {
  let lastError = null;

  for (const endpoint of BUS_ENDPOINTS) {
    try {
      const response = await api.get(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
};

const withFallbackMutation = async (requestBuilder) => {
  let lastError = null;

  for (const endpoint of BUS_ENDPOINTS) {
    try {
      return await requestBuilder(endpoint);
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const createBus = async (bus) =>
  withFallbackMutation((endpoint) =>
    api.post(endpoint, bus, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );

export const updateBus = async (id, bus) =>
  withFallbackMutation((endpoint) =>
    api.put(`${endpoint}/${id}`, bus, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );

export const deleteBus = async (id) =>
  withFallbackMutation((endpoint) =>
    api.delete(`${endpoint}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );
