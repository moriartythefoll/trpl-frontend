import api from "../axios";

// ================= SCHEDULE SERVICE =================

/**
 * Mengambil semua data jadwal
 */
export const getSchedules = async () => {
  try {
    const res = await api.get("/admin/schedules");
    return res.data.data;
  } catch (err) {
    console.error("Error fetching schedules:", err);
    throw err;
  }
};

/**
 * Fitur Opsi B: Generate slot otomatis per jam
 * @param {Object} payload - { field_id, date, start_hour, end_hour }
 */
export const generateSchedules = async (payload) => {
  try {
    const res = await api.post("/admin/schedules/generate", payload);
    return res.data;
  } catch (err) {
    console.error("Error generating bulk schedules:", err);
    throw err;
  }
};

/**
 * Membuat satu slot jadwal secara manual
 */
export const createSchedule = async (payload) => {
  try {
    const res = await api.post("/admin/schedules", payload);
    return res.data.data;
  } catch (err) {
    console.error("Error creating schedule:", err);
    throw err;
  }
};

/**
 * Memperbarui data slot (Misal: ubah status ke Maintenance)
 */
export const updateSchedule = async (id, payload) => {
  try {
    const res = await api.put(`/admin/schedules/${id}`, payload);
    return res.data.data;
  } catch (err) {
    console.error(`Error updating schedule ${id}:`, err);
    throw err;
  }
};

/**
 * Menghapus slot jadwal
 */
export const deleteSchedule = async (id) => {
  try {
    const res = await api.delete(`/admin/schedules/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting schedule ${id}:`, err);
    throw err;
  }
};

// Export semua fungsi
const scheduleService = {
  getSchedules,
  generateSchedules, // Fungsi sakti baru kita
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

export default scheduleService;