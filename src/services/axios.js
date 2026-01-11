import axios from "axios";
import { getAuthToken } from "../utils//auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  // ❌ NO withCredentials (Bearer token mode)
});

// REQUEST: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: jangan sok hapus token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - token invalid or expired");
      // biarkan auth store / router yang handle
    }
    return Promise.reject(error);
  }
);

export default api;
