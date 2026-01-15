import api from "../axios"; // pastikan ini axios instance kamu

/**
 * Ambil semua field beserta info venue & harga
 */
export const getFields = async () => {
  try {
    const res = await api.get("/explore/fields");
    return res.data.data; // array field lengkap
  } catch (error) {
    console.error("Error fetching fields:", error);
    return [];
  }
};

/**
 * Ambil jadwal field tertentu untuk tanggal tertentu
 */
export const getFieldSchedules = async (fieldId, date) => {
  try {
    const res = await api.get(`/explore/fields/${fieldId}/schedules`, {
      params: { date },
    });
    return res.data.data; // sesuai response controller
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
};

const fieldService = {
  getFields,
  getFieldSchedules,
};

export default fieldService;
