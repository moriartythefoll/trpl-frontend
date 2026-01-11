import api from "../axios";

// Menarik jadwal asli dari database
export const getFieldSchedules = async (fieldId, date) => {
  try {
    const response = await axios.get(`${API_URL}/explore/fields/${fieldId}/schedules`, {
      params: { date } // Kirim tanggal sebagai query string
    });
    return response.data.data; 
  } catch (error) {
    console.error("Gagal mengambil jadwal:", error);
    throw error;
  }
};