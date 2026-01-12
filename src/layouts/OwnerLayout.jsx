import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Activity, Crown } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Safe logout, Sensei!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      {/* MINIMALIST TOP NAV */}
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <Activity size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black italic uppercase tracking-tighter text-xl leading-none">
                Sensei <span className="text-[#ccff00]">Dashboard</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Analytics Module</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-[10px] font-black uppercase text-white leading-none">{user?.name}</span>
              <span className="text-[8px] font-bold text-[#ccff00] uppercase tracking-widest mt-1">Authorized Owner</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all border border-white/5"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* CENTERED CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Outlet />
      </main>

      {/* FOOTER DECORATION */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex justify-between items-center opacity-30 grayscale">
         <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sensei Sport Arena © 2024</p>
         <Crown size={20} />
      </footer>
    </div>
  );
}