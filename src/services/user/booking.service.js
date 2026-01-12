import api from "../axios";

/**
 * Membuat pesanan baru (Checkout)
 * POST /api/user/bookings
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
 * GET /api/user/bookings
 */
export const getMyBookings = async () => {
  try {
    const res = await api.get("/user/bookings");
    return res.data.data || res.data;
  } catch (err) {
    console.error("Error fetching my bookings:", err);
    throw err;
  }
};

/**
 * Ambil detail booking menggunakan BOOKING_CODE (Bukan ID)
 * GET /api/user/bookings/{booking_code}
 */
export const getBookingById = async (bookingCode) => {
  try {
    const res = await api.get(`/user/bookings/${bookingCode}`);
    return res.data.data || res.data;
  } catch (err) {
    console.error("Error fetching booking detail:", err);
    throw err;
  }
};

/**
 * Ambil slot tersedia berdasarkan field dan tanggal
 */
export const getAvailableSchedules = async (fieldId, date) => {
  try {
    const res = await api.get(`/explore/fields/${fieldId}/schedules?date=${date}`);
    return res.data.data || res.data;
  } catch (err) {
    console.error("Error fetching available schedules:", err);
    throw err;
  }
};

/**
 * Upload Bukti Pembayaran menggunakan BOOKING_CODE
 * POST /api/user/bookings/{booking_code}/upload-payment
 */
export const uploadPayment = async (bookingCode, formData) => {
  try {
    const res = await api.post(`/user/bookings/${bookingCode}/upload-payment`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Upload Payment Error:", err);
    throw err;
  }
};

const userBookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAvailableSchedules,
  uploadPayment
};

export default userBookingService;