import api from "../axios";

/**
 * Helper untuk mengonversi "10:00 PM" -> "22:00" atau "08:00 AM" -> "08:00"
 * Jika input sudah format 24 jam (misal dari input type="time"), tetap aman.
 */
const formatTimeTo24H = (timeStr) => {
  if (!timeStr) return "";

  // Cek apakah ada indikator AM atau PM
  const isAMPM = /[a-zA-Z]/.test(timeStr);
  
  if (!isAMPM) {
    // Jika format 24 jam (HH:mm:ss), ambil 5 karakter depan saja (HH:mm)
    return timeStr.substring(0, 5);
  }

  // Logika konversi AM/PM
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }

  // Pastikan output selalu HH:mm (misal: 09:00)
  return `${String(hours).padStart(2, '0')}:${minutes.substring(0, 2)}`;
};

/**
 * Helper untuk mengonversi payload menjadi FormData yang bersih.
 */
const toFormData = (payload) => {
  const formData = new FormData();

  // 1. Definisikan field teks sesuai aturan di Controller
  const fields = ["name", "address", "description", "open_time", "close_time"];

  fields.forEach((key) => {
    const value = payload[key];
    
    if (value !== null && value !== undefined && value !== "") {
      if (key === "open_time" || key === "close_time") {
        // Implementasi konversi jam di sini
        formData.append(key, formatTimeTo24H(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  // 2. Append File Image
  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
};

// ================= VENUE SERVICE =================

export const getVenues = async () => {
  try {
    const res = await api.get("/admin/venues");
    return res.data.data ?? [];
  } catch (err) {
    console.error("Error fetching venues:", err.response?.data || err.message);
    throw err;
  }
};

export const createVenue = async (payload) => {
  try {
    const formData = toFormData(payload);

    const res = await api.post("/admin/venues", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Accept": "application/json" 
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating venue:", err.response?.data || err.message);
    throw err;
  }
};

export const updateVenue = async (id, payload) => {
  try {
    const formData = toFormData(payload);
    
    // Method Spoofing untuk Laravel Multipart PUT
    formData.append("_method", "PUT");

    const res = await api.post(`/admin/venues/${id}`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Accept": "application/json" 
      },
    });
    return res.data;
  } catch (err) {
    console.error(`Error updating venue ${id}:`, err.response?.data || err.message);
    throw err;
  }
};

export const deleteVenue = async (id) => {
  try {
    const res = await api.delete(`/admin/venues/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting venue ${id}:`, err.response?.data || err.message);
    throw err;
  }
};

export default {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
};