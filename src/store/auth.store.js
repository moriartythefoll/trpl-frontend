import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginRequest,
  registerRequest,
  meRequest,
} from "../services/user.service";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (payload) => {
        set({ isLoading: true });

        try {
          const res = await loginRequest(payload);

          set({
            user: res.user,
            token: res.token,
            isLoading: false,
          });

          return res.user;
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
        if (!token) return;

        set({ isLoading: true });

        try {
          const res = await meRequest();
          set({ user: res, isLoading: false });
        } catch (err) {
          // ❌ JANGAN hapus token otomatis
          set({ user: null, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
