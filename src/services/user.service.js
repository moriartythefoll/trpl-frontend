import api from "./axios"

export const loginRequest = async ({ email, password }) => {
  const res = await api .post("/login", { email, password })
  return res.data
}

export const registerRequest = async ({ name, email, password, password_confirmation }) => {
  const res = await api.post("/register", { name, email, password, password_confirmation })
  return res.data
}

export const meRequest = async () => {
  const res = await api.get("/me")
  return res.data
}

export const updateProfileRequest = async (payload) => {
  const res = await api.put('/profile/update', payload)
  return res.data
}