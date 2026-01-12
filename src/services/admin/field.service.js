import api from "../axios";

/**
 * ==========================================================
 * NORMALIZER (FRONTEND CONTRACT)
 * ==========================================================
 */
const normalizeField = (f) => ({
  id: f.id,
  name: f.name,
  type: f.type,
  price: Number(f.price || 0),
  status: f.status || "inactive",
  image: f.image || null,
  venue: f.venue || { id: "", name: "—" },
  venue_id: f.venue?.id || "",
});

/**
 * ==========================================================
 * GET ALL FIELDS (ADMIN)
 * ==========================================================
 */
export const getFields = async () => {
  const res = await api.get("/admin/fields");
  return res.data.data.map(normalizeField);
};

/**
 * ==========================================================
 * GET VENUES (SELECT OPTION)
 * ==========================================================
 */
export const getVenuesForSelect = async () => {
  const res = await api.get("/admin/venues");
  return res.data.data;
};

/**
 * ==========================================================
 * CREATE FIELD (MULTIPART)
 * ==========================================================
 */
export const createField = async (data) => {
  const formData = new FormData();

  formData.append("venue_id", Number(data.venue_id));
  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("price_per_hour", Number(data.price));
  formData.append("is_active", data.status === "active" ? 1 : 0);

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  const res = await api.post("/admin/fields", formData);

  return normalizeField(res.data.data);
};

/**
 * ==========================================================
 * UPDATE FIELD (MULTIPART)
 * ==========================================================
 */
export const updateField = async (id, data) => {
  const formData = new FormData();

  formData.append("venue_id", Number(data.venue_id));
  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("price_per_hour", Number(data.price));
  formData.append("is_active", data.status === "active" ? 1 : 0);

  if (data.image instanceof File) {
    formData.append("image", data.image);
  }

  const res = await api.post(
    `/admin/fields/${id}?_method=PUT`,
    formData
  );

  return normalizeField(res.data.data);
};

/**
 * ==========================================================
 * DELETE FIELD
 * ==========================================================
 */
export const deleteField = async (id) => {
  const res = await api.delete(`/admin/fields/${id}`);
  return res.data;
};
