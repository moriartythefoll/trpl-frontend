import api from "../axios";

/**
 * Ambil report summary + chart
 * @param {string} range - monthly | weekly | yearly
 */
export const getOwnerStats = async (range = "monthly") => {
  try {
    const res = await api.get("/owner/reports", {
      params: { range },
    });

    return {
      summary: res.data.summary ?? {
        total_revenue: 0,
        total_bookings: 0,
        success_rate: 0,
        total_slots: 0,
      },
      chart: Array.isArray(res.data.data) ? res.data.data : [],
      metadata: res.data.metadata ?? null,
    };

  } catch (error) {
    console.error(
      "❌ Error fetching owner stats:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Ambil transaksi terbaru (untuk table)
 */
export const getOwnerTransactions = async () => {
  try {
    const res = await api.get("/owner/transactions");

    return Array.isArray(res.data.data) ? res.data.data : [];

  } catch (error) {
    console.error(
      "❌ Error fetching owner transactions:",
      error.response?.data || error.message
    );
    throw error;
  }
};
