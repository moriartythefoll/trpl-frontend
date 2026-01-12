import api from "axios"; // Pastikan path axios instance kamu benar

export const getOwnerStats = async () => {
  const res = await api.get("/owner/reports");
  return res.data; // Mengambil total_revenue, total_bookings, dll
};

export const getOwnerTransactions = async () => {
  const res = await api.get("/owner/transactions");
  return res.data; // Mengambil list transaksi terakhir
};