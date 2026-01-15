import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Menempelkan Token ke setiap request secara otomatis
 */
api.interceptors.request.use(
  (config) => {
    // Mengambil token terbaru langsung dari Zustand state
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Menangani error global seperti Session Expired (401) atau Forbidden (403)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const { logout, user } = useAuthStore.getState();

    // 1. Kasus 401: Token hangus atau tidak valid
    if (status === 401) {
      console.warn("Sesi habis, membersihkan state dan ke login...");
      logout(); // Hapus data di store (Zustand)
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    } 
    
    // 2. Kasus 403: Login berhasil tapi TIDAK punya akses (Override URL Protection)
    else if (status === 403) {
      console.error("Akses ditolak! Anda tidak memiliki izin ke resource ini.");
      
      // Ambil role untuk menentukan tujuan "tendangan"
      const role = user?.role;

      if (role === 'admin') {
        window.location.href = "/admin/dashboard";
      } else if (role === 'owner') {
        window.location.href = "/owner/dashboard";
      } else {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;