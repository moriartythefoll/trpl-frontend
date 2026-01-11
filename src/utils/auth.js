export const getAuthToken = () => {
  const raw = localStorage.getItem("auth-storage");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch (e) {
    console.error("Failed to parse auth-storage");
    return null;
  }
};
