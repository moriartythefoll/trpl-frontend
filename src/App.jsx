import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user); // tambahkan user
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Hanya panggil API jika ada token tapi user belum ada (kasus refresh)
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]); // dependensi lengkap supaya React tidak warning

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-white font-medium animate-pulse">Syncing session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
