import axios from "axios";
import { useAuthStore } from "../store/auth.store"; // Import store

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// REQUEST: Ambil token langsung dari State Zustand
api.interceptors.request.use(
  (config) => {
    // Cara sakti ambil state di luar komponen React:
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: Auto-Logout kalau token hangus
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesi habis, menendang user ke login...");
      
      // Panggil logout dari store agar state bersih dan user pindah halaman
      useAuthStore.getState().logout();
      
      // Paksa balik ke login jika tidak sedang di halaman login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;