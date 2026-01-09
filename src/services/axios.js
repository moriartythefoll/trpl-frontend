import axios from "axios";
import { getToken } from "../hooks/useAuth"; // fungsi ambil token

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // misal http://localhost:8000/api
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token otomatis
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
