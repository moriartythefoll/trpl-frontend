import axios from "./axios"

export const loginRequest = async ({ email, password }) => {
  const res = await axios.post("/login", { email, password })
  return res.data
}

export const registerRequest = async ({ name, email, password, password_confirmation }) => {
  const res = await axios.post("/register", { name, email, password, password_confirmation })
  return res.data
}

export const meRequest = async () => {
  const res = await axios.get("/me")
  return res.data
}
