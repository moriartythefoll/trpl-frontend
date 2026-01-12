import api from "../axios";

const normalizeField = (f) => ({
  ...f,
  // Menyamakan properti agar React mudah membaca
  price: Number(f.price || f.price_per_hour || 0),
  status: f.status || (f.is_active ? 'active' : 'inactive'),
  type: f.type || "futsal",
  venue: f.venue || { name: "—" },
  venue_id: f.venue?.id || f.venue_id || "",
});

export const getFields = async () => {
  const res = await api.get("/admin/fields");
  return res.data.data.map(normalizeField);
};

export const getVenuesForSelect = async () => {
  const res = await api.get("/admin/venues");
  return res.data.data;
};

export const createField = async (data) => {
  const payload = {
    venue_id: Number(data.venue_id),
    name: data.name,
    type: data.type,
    price_per_hour: Number(data.price), // Kirim sesuai validasi BE
    is_active: data.status === 'active' ? 1 : 0
  };
  const res = await api.post("/admin/fields", payload);
  return normalizeField(res.data.data);
};

export const updateField = async (id, data) => {
  const payload = {
    venue_id: Number(data.venue_id),
    name: data.name,
    type: data.type,
    price_per_hour: Number(data.price), // Kirim sesuai validasi BE
    is_active: data.status === 'active' ? 1 : 0
  };
  const res = await api.put(`/admin/fields/${id}`, payload);
  return normalizeField(res.data.data);
};

export const deleteField = async (id) => {
  const res = await api.delete(`/admin/fields/${id}`);
  return res.data;
};