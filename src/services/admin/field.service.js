import api from "../axios";

/**
 * ==========================================================
 * NORMALIZER (FRONTEND CONTRACT)
 * Menyeragamkan bentuk data dari backend agar aman di frontend
 * ==========================================================
 */
const normalizeField = (f) => ({
  id: f.id,
  name: f.name,
  type: f.type,
  price: Number(f.price_per_hour || f.price || 0), // Menangani perbedaan nama field backend
  status: f.is_active === 1 || f.status === "active" ? "active" : "inactive",
  image: f.image || null,
  venue: f.venue || { id: "", name: "—" },
  venue_id: f.venue_id || f.venue?.id || "",
});

/**
 * GET ALL FIELDS
 */
export const getFields = async () => {
  const res = await api.get("/admin/fields");
  return res.data.data.map(normalizeField);
};

/**
 * GET VENUES FOR SELECT
 */
export const getVenuesForSelect = async () => {
  const res = await api.get("/admin/venues");
  return res.data.data;
};

/**
 * HELPER: BUILD FORM DATA
 * Digunakan agar logika create dan update seragam (DRY)
 */
const buildFieldFormData = (data) => {
  const formData = new FormData();
  
  // Pastikan venue_id terkirim sebagai string/number yang valid
  formData.append("venue_id", data.venue_id);
  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("price_per_hour", data.price);
  formData.append("is_active", data.status === "active" ? 1 : 0);

  // Logika Gambar yang sakti (Handle File object maupun FileList)
  if (data.image) {
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (data.image[0] instanceof File) {
      formData.append("image", data.image[0]);
    }
  }

  return formData;
};

/**
 * CREATE FIELD
 */
export const createField = async (data) => {
  const formData = buildFieldFormData(data);
  const res = await api.post("/admin/fields", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * UPDATE FIELD
 */
export const updateField = async (id, data) => {
  const formData = buildFieldFormData(data);
  
  // Laravel mewajibkan method spoofing _method=PUT untuk multipart/form-data
  formData.append("_method", "PUT");

  const res = await api.post(`/admin/fields/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Jika backend mengembalikan data baru, kita normalize lagi
  return res.data.data ? normalizeField(res.data.data) : res.data;
};

/**
 * DELETE FIELD
 */
export const deleteField = async (id) => {
  const res = await api.delete(`/admin/fields/${id}`);
  return res.data;
};