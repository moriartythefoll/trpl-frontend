import api from "../axios";

// Ambil semua field (admin)
export const getFields = async () => {
  const res = await api.get("/admin/fields");
  return res.data.data;
};

// Untuk dropdown venue
export const getVenuesForSelect = async () => {
  const res = await api.get("/admin/venues");
  return res.data.data;
};

// Create field
export const createField = async (data) => {
  const res = await api.post("/admin/fields", data);
  return res.data.data;
};

// Update field
export const updateField = async (id, data) => {
  const res = await api.put(`/admin/fields/${id}`, data);
  return res.data.data;
};

// Delete field
export const deleteField = async (id) => {
  const res = await api.delete(`/admin/fields/${id}`);
  return res.data;
};
