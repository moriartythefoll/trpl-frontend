import { create } from "zustand";
import userBookingService from "../services/user/booking.service";

export const useBookingStore = create((set, get) => ({
  pendingCount: 0,

  // cek jumlah booking unpaid/pending
  fetchPending: async () => {
    try {
      const bookings = await userBookingService.getMyBookings();
      const pending = bookings.filter(b => ["unpaid", "pending"].includes(b.status)).length;
      set({ pendingCount: pending });
    } catch (err) {
      set({ pendingCount: 0 });
    }
  },

  // update saat createBooking atau bayar
  updatePending: (count) => set({ pendingCount: count }),
}));
