import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, isLoading, fetchMe, logout } = useAuthStore();

  // Jika token ada tapi user belum ada, fetchMe otomatis
  if (token && !user && !isLoading) {
    fetchMe().catch(() => {
      // Jika token invalid / expired, logout
      logout();
    });
  }

  // 1. Loading state
  if (isLoading || (token && !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // 2. Jika tidak ada token sama sekali, redirect ke login
  if (!token) return <Navigate to="/login" replace />;

  // 3. Jika role tidak sesuai, redirect ke home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
