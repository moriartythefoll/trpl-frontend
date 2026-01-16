import api from "../axios";

/**
 * Helper untuk memastikan jam dalam format HH:mm (24 jam)
 */
const formatTimeTo24H = (timeStr) => {
  if (!timeStr) return "";
  const isAMPM = /[a-zA-Z]/.test(timeStr);
  if (!isAMPM) return timeStr.substring(0, 5);

  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier.toLowerCase() === 'pm') hours = parseInt(hours, 10) + 12;
  
  return `${String(hours).padStart(2, '0')}:${minutes.substring(0, 2)}`;
};

// ================= VENUE SERVICE =================

export const getVenues = async () => {
  const res = await api.get("/admin/venues");
  return res.data.data ?? [];
};

/**
 * Menerima OBJECT biasa dari UI, lalu dikonversi ke FormData di sini.
 * Ini mencegah error "Double Wrapping".
 */
export const createVenue = async (payload) => {
  const formData = new FormData();
  
  // Masukkan data teks & konversi jam
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("description", payload.description || "");
  formData.append("open_time", formatTimeTo24H(payload.open_time));
  formData.append("close_time", formatTimeTo24H(payload.close_time));

  if (payload.owner_id) {
    formData.append("owner_id", payload.owner_id);
  }

  // Ambil file dari FileList (React Hook Form)
  if (payload.image?.[0]) {
    formData.append("image", payload.image[0]);
  }

  const res = await api.post("/admin/venues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateVenue = async (id, payload) => {
  const formData = new FormData();
  
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("description", payload.description || "");
  formData.append("open_time", formatTimeTo24H(payload.open_time));
  formData.append("close_time", formatTimeTo24H(payload.close_time));


  if (payload.owner_id) {
    formData.append("owner_id", payload.owner_id);
  }
  
  // Method Spoofing untuk Laravel
  formData.append("_method", "PUT");

  if (payload.image?.[0] instanceof File) {
    formData.append("image", payload.image[0]);
  }

  const res = await api.post(`/admin/venues/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteVenue = async (id) => {
  const res = await api.delete(`/admin/venues/${id}`);
  return res.data;
};

export default { getVenues, createVenue, updateVenue, deleteVenue };