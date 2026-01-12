import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, isInitialized, fetchMe, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      // Jika ada token tapi data user di store kosong (akibat refresh)
      if (token && !user) {
        setIsVerifying(true);
        try {
          await fetchMe();
        } catch (err) {
          logout();
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyUser();
  }, [token, user, fetchMe, logout]);

  // 1. TUNGGU INITIALIZE (Sangat Sebentar)
  if (!isInitialized) return null;

  // 2. LAYER PERTAMA: Cek Token (Cepat)
  if (!token) {
    // Simpan lokasi terakhir agar setelah login bisa balik lagi ke sini
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. LAYER KEDUA: Sedang Verifikasi Ulang ke Server
  if (isVerifying) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Verifying Authority...</span>
        </div>
      </div>
    );
  }

  // 4. LAYER KETIGA: Cek Role (Keamanan Hak Akses)
  // Jika user sudah ada, pastikan rolenya diizinkan
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: Role ${user.role} is not authorized for this route.`);
    return <Navigate to="/" replace />;
  }

  // 5. FINAL CHECK: Jika proses verifikasi selesai tapi user tetap tidak ada
  if (!user && !isVerifying) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;