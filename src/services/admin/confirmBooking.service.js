import api from "../axios";

/**
 * Mengambil semua daftar booking untuk Admin
 * GET /api/admin/bookings
 */
export const getBookings = async () => {
  try {
    const res = await api.get("/admin/bookings");
    // Biasanya Laravel membungkus dalam { success: true, data: [...] }
    return res.data.data || res.data;
  } catch (err) {
    console.error("Error fetching admin bookings:", err);
    throw err;
  }
};

/**
 * Konfirmasi Pembayaran Lunas menggunakan BOOKING_CODE
 * POST /api/admin/bookings/{booking_code}/confirm
 */
export const confirmBooking = async (bookingCode) => {
  try {
    const res = await api.post(`/admin/bookings/${bookingCode}/confirm`);
    return res.data;
  } catch (err) {
    console.error("Confirm Booking Error:", err);
    throw err;
  }
};

/**
 * Tolak Pembayaran menggunakan BOOKING_CODE
 * POST /api/admin/bookings/{booking_code}/reject
 */
export const rejectBooking = async (bookingCode) => {
  try {
    const res = await api.post(`/admin/bookings/${bookingCode}/reject`);
    return res.data;
  } catch (err) {
    console.error("Reject Booking Error:", err);
    throw err;
  }
};