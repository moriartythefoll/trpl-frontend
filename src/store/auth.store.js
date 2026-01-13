import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  loginRequest, 
  registerRequest, 
  meRequest, 
  updateProfileRequest // Pastikan sudah dibuat di services/user.service.js
} from "../services/user.service";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- STATES ---
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      // --- ACTIONS ---
      
      /**
       * Login Logic
       */
      login: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await loginRequest(payload);
          set({
            user: res.user,
            token: res.token,
            isLoading: false,
            isInitialized: true,
          });
          return res.user; 
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /**
       * Register Logic
       */
      register: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await registerRequest(payload);
          set({ isLoading: false });
          return res;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /**
       * Fetch Me Logic
       */
      fetchMe: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          const res = await meRequest();
          set({ 
            user: res, 
            isLoading: false, 
            isInitialized: true 
          });
        } catch (err) {
          set({ 
            user: null, 
            token: null, 
            isLoading: false, 
            isInitialized: true 
          });
          localStorage.removeItem("auth-storage");
        }
      },

      /**
       * Update Profile Logic (NEW IMPROVEMENT)
       * Mengirim data ke API Laravel dan mengupdate state global
       */
      updateProfile: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await updateProfileRequest(payload);
          
          // Kita cek: kalau ada res.user pakai itu, kalau tidak ada pakai res langsung
          const updatedUser = res.user || res.data || res; 

          set({ 
            user: updatedUser, 
            isLoading: false 
          });

          return updatedUser;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /**
       * Logout Logic
       */
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isInitialized: true 
        });
        localStorage.removeItem("auth-storage");
      },

      setInitialized: (val) => set({ isInitialized: val }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
        }
      },
    }
  )
);