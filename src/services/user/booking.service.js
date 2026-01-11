import api from "../axios";

/**
 * Membuat pesanan baru (Checkout)
 * payload: { schedule_ids: [1, 2, 3] }
 */
export const createBooking = async (payload) => {
  try {
    const res = await api.post("/user/bookings", payload);
    return res.data;
  } catch (err) {
    console.error("Checkout Error:", err);
    throw err;
  }
};

/**
 * Mengambil riwayat booking milik user yang sedang login
 */
export const getMyBookings = async () => {
  try {
    const res = await api.get("/user/bookings/my");
    return res.data.data;
  } catch (err) {
    throw err;
  }
};

const userBookingService = {
  createBooking,
  getMyBookings,
};

export default userBookingService;