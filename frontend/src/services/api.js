import axios from "axios";

const DEFAULT_API_ORIGIN = import.meta.env.PROD
  ? "https://unified-booking-platform.onrender.com"
  : "http://localhost:5000";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `${DEFAULT_API_ORIGIN}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
