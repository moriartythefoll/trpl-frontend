import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, registerRequest, meRequest } from "../services/user.service";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false, // Tambahkan ini untuk cek apakah storage sudah dibaca

      login: async (payload) => {
        // set({ isLoading: true });
        try {
          const res = await loginRequest(payload);
          // Langsung set ke store agar sinkron
          set({
            user: res.user,
            token: res.token,
            isLoading: false,
          });
          return res.user; // Pastikan user object dikembalikan
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        await registerRequest(payload);
      },

      fetchMe: async () => {
        const token = get().token;
        if (!token) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          const res = await meRequest();
          set({ user: res, isLoading: false, isInitialized: true });
        } catch (err) {
          // Jika token expired/invalid, bersihkan store
          set({ user: null, token: null, isLoading: false, isInitialized: true });
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state.set({ isInitialized: true });
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);