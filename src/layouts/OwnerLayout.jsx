import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { LogOut, Activity, Crown, LayoutGrid, BarChart3, Settings, ShieldCheck, Zap } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Connection Terminated, Sensei!");
  };

  // Navigasi Menu
  const menuItems = [
    { path: "/owner/dashboard", label: "Overview", icon: <LayoutGrid size={16} /> },
    { path: "/owner/revenue", label: "Analytics", icon: <BarChart3 size={16} /> },
    { path: "/owner/settings", label: "System", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black selection:font-black">
      
      {/* 1. TOP NAV - FIXED & ULTRA MINIMALIST */}
      <nav className="sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* BRAND */}
          <div className="flex items-center gap-4 group">
            <div className="relative w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <Zap size={20} strokeWidth={3} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black italic uppercase tracking-tighter text-xl leading-none">
                SENSEI<span className="text-[#ccff00]">CEO</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mt-0.5">Management Suite</p>
            </div>
          </div>

          {/* 2. INTEGRATED CENTER MENU (Ganti Sidebar) */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.05] p-1.5 rounded-2xl">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isActive 
                      ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"}
                  `}
                >
                  {item.icon}
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* USER & LOGOUT */}
          <div className="flex items-center gap-4 border-l border-white/5 pl-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-white tracking-widest">{user?.name || "Master Owner"}</span>
              <span className="text-[8px] font-black text-[#ccff00] uppercase tracking-[0.2em]">Authorized</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/[0.03] hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-white/5"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. CENTERED FULL CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* WELCOME BANNER (Optional) */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck size={14} className="text-[#ccff00]" />
               <p className="text-[10px] font-black text-[#ccff00] uppercase tracking-[0.3em]">Secure Session Active</p>
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">
              Performance <span className="text-gray-800">Briefing</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
             <div className="text-right">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Network Speed</p>
                <p className="text-xs font-black italic">0.2ms <span className="text-[#ccff00]">Fast</span></p>
             </div>
             <div className="w-[1px] h-8 bg-white/5" />
             <div className="text-right">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Region</p>
                <p className="text-xs font-black italic text-white">ID-JKT</p>
             </div>
          </div>
        </div>

        {/* DYNAMIC CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Outlet />
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-16 mt-20 border-t border-white/[0.03]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-3">
             <Crown size={24} className="text-[#ccff00]" />
             <p className="text-xs font-black uppercase tracking-[0.4em]">Sensei Sport <span className="text-gray-600 italic">Core v1.0</span></p>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">Global Operational System © 2026</p>
        </div>
      </footer>
    </div>
  );
}