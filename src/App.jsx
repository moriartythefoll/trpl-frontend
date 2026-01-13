import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { Toaster } from "react-hot-toast";

export default function App() {
  // Ambil state dari store
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  // GUNAKAN INI sebagai gating utama, bukan isLoading
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Sinkronisasi data user jika ada token di storage tapi user belum ada di state
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  /**
   * CRITICAL CHECK:
   * Kita hanya menampilkan Loading Screen Full Page saat aplikasi 
   * sedang pertama kali membaca LocalStorage (Hydration).
   * Begitu sudah 'Initialized', aplikasi tidak boleh hilang (unmount) 
   * meskipun ada proses API lainnya.
   */
  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ccff00] mb-4"></div>
        <p className="text-white font-black uppercase italic tracking-[0.3em] text-[10px] animate-pulse">
          Syncing Performance...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* KONFIGURASI TOASTER SENSEI (SUDAH MANTAP) */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
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
            iconTheme: {
              primary: '#ccff00',
              secondary: '#000',
            },
            style: {
              border: '1px solid #ccff00',
            }
          },
          error: {
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

      {/* DENGAN RENDER AppRoutes DI SINI, 
          Navigation dari Login akan langsung terbaca karena 
          BrowserRouter sudah stand-by.
      */}
      <AppRoutes />
    </BrowserRouter>
  );
}