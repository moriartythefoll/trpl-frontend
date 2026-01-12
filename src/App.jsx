import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { Toaster } from "react-hot-toast"; // 1. Import Toaster

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        {/* Loading spinner disesuaikan ke tema Lime agar konsisten */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ccff00] mb-4"></div>
        <p className="text-white font-black uppercase italic tracking-[0.3em] text-[10px] animate-pulse">
          Syncing Performance...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* 2. KONFIGURASI TOASTER (PONDASI NOTIFIKASI) */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Gaya Global: Ultra Rounded, Black, Italic, Bold
          duration: 3000,
          style: {
            background: '#111111',
            color: '#ffffff',
            borderRadius: '50px', 
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 28px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontStyle: 'italic',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          },
          success: {
            // Gaya saat sukses (Lime)
            iconTheme: {
              primary: '#ccff00',
              secondary: '#000',
            },
            style: {
              border: '1px solid #ccff00',
            }
          },
          error: {
            // Gaya saat gagal (Red)
            iconTheme: {
              primary: '#ff3333',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ff3333',
            }
          }
        }}
      />

      <AppRoutes />
    </BrowserRouter>
  );
}