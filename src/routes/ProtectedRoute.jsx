import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, isInitialized, fetchMe, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Sinkronisasi data user jika ada token tapi user gaib
    if (token && !user) {
      fetchMe().catch(() => logout());
    }
  }, [token, user, fetchMe, logout]);

  // 1. TUNGGU INISIALISASI
  // Jangan render apa-apa sampai Zustand selesai baca storage
  if (!isInitialized) return null; 

  // 2. CEK TOKEN
  // Kalau token beneran ga ada, baru tendang ke login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. TUNGGU USER (Race Condition Guard)
  // Kalau token ada tapi user belum ada (sedang fetch), jangan pindah halaman!
  // Return null agar layar tetap di halaman sebelumnya sampai user terisi
  if (!user) return null;

 // 4. CEK ROLE (Smarter Guard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Jika dia Admin tapi nyasar ke rute User, atau sebaliknya
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    
    // Default untuk user biasa atau jika role tidak dikenal
    return <Navigate to="/home" replace />; 
  }

  // 5. GASS!
  return <Outlet />;
};

export default ProtectedRoute;