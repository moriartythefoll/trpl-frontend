import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "../pages/public/login&register"
import Home from "../pages/public/home"

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Route untuk Halaman Utama (Home) */}
      <Route path="/home" element={<Home />} />

      {/* 2. Route untuk Auth */}
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* 3. Fallback: Redirect halaman tak dikenal ke Login */}
      {/* Tambahkan 'replace' agar history browser tidak menumpuk saat redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}