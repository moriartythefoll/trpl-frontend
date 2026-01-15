import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { Toaster } from "react-hot-toast";
import { Zap } from "lucide-react";

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  // --- LOADING TETAP SAMA (TIDAK DIUBAH) ---
  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[120px] -z-10" />
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-2 border-dashed border-[#ccff00]/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="h-16 w-16 rounded-full border-t-2 border-l-2 border-[#ccff00] animate-spin shadow-[0_0_20px_rgba(204,255,0,0.2)]" />
          <Zap className="absolute text-[#ccff00] animate-pulse" size={20} />
        </div>
        <div className="mt-12 text-center space-y-2">
          <h2 className="text-white font-black uppercase italic tracking-[0.8em] text-[12px] ml-[0.8em]">
            SENSEI<span className="text-[#ccff00]">_CORE</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-zinc-800" />
            <p className="text-zinc-500 font-bold uppercase text-[7px] tracking-[0.4em]">Initializing_Protocols</p>
            <div className="h-[1px] w-8 bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* TOASTER DIBUAT CLEAN (Agar tidak dobel gaya) */}
      <Toaster position="top-right" /> 
      <AppRoutes />
    </BrowserRouter>
  );
}