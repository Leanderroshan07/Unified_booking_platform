import api from "./api";

const TRAIN_ENDPOINTS = ["/trains", "/train"];

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

export const getTrains = async () => {
  const response = await getFirstSuccessful(TRAIN_ENDPOINTS);
  return response.data;
};

export const getTrainById = async (id) => {
  let lastError = null;

  for (const endpoint of TRAIN_ENDPOINTS) {
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

  for (const endpoint of TRAIN_ENDPOINTS) {
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

export const createTrain = async (train) =>
  withFallbackMutation((endpoint) =>
    api.post(endpoint, train, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );

export const updateTrain = async (id, train) =>
  withFallbackMutation((endpoint) =>
    api.put(`${endpoint}/${id}`, train, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );

export const deleteTrain = async (id) =>
  withFallbackMutation((endpoint) =>
    api.delete(`${endpoint}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
  );