import api from "../axios"; // Pastikan path ke file axios di atas benar

/**
 * Mengambil data statistik ringkasan (Revenue, Total Bookings, Rate)
 */
export const getOwnerStats = async () => {
  try {
    const res = await api.get("/owner/reports");
    // Kita kembalikan datanya langsung
    return res.data; 
  } catch (error) {
    console.error("❌ Error fetching owner stats:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mengambil daftar transaksi terbaru untuk tabel dan grafik
 */
export const getOwnerTransactions = async () => {
  try {
    const res = await api.get("/owner/transactions");
    // Pastikan mengembalikan array agar .map() di UI tidak error
    return res.data; 
  } catch (error) {
    console.error("❌ Error fetching owner transactions:", error.response?.data || error.message);
    throw error;
  }
};