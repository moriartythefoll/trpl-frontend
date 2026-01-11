import api from "../axios";

/**
 * Mengambil semua daftar booking (Admin)
 * Saya ubah namanya menjadi getBookings agar konsisten dengan Resource di Laravel
 */
export const getBookings = async () => {
  try {
    const res = await api.get("/admin/bookings");
    // Pastikan mengembalikan array, jika data null/undefined return array kosong
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching bookings:", err);
    throw err;
  }
};

/**
 * Konfirmasi pembayaran booking
 * Method: POST
 */
export const confirmBooking = async (id) => {
  try {
    const res = await api.post(`/admin/bookings/${id}/confirm`);
    return res.data; 
  } catch (err) {
    // Melempar error agar bisa ditangkap oleh mutate onError di UI
    throw err;
  }
};

/**
 * Membatalkan/Menolak booking (Admin)
 */
export const rejectBooking = async (id) => {
  try {
    const res = await api.post(`/admin/bookings/${id}/reject`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Gabungkan semua dalam satu object untuk export default
const bookingService = {
  getBookings,
  confirmBooking,
  rejectBooking,
};

export default bookingService;