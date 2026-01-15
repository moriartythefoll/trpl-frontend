import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { LogOut, LayoutGrid, BarChart3, Settings, Zap, Crown } from "lucide-react";
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

  const menuItems = [
    { path: "/owner/dashboard", label: "Overview", sub: "Financials", icon: <LayoutGrid size={16} /> },
    { path: "/owner/revenue", label: "Analytics", sub: "Performance", icon: <BarChart3 size={16} /> },
    { path: "/owner/settings", label: "System", sub: "Operational", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* 1. TOP NAV - FIXED & MINIMALIST */}
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.03] no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* BRAND AREA */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#ccff00] rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <Zap size={18} strokeWidth={3} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black italic uppercase tracking-tighter text-lg leading-none">
                SENSEI<span className="text-[#ccff00]">CEO</span>
              </h1>
              <p className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-0.5">Management Suite</p>
            </div>
          </div>

          {/* CENTER MENU NAVIGATION */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.05] p-1 rounded-2xl">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-2 rounded-xl transition-all 
                    ${isActive 
                      ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                >
                  <div className={isActive ? "text-black" : "text-[#ccff00] opacity-50"}>
                    {item.icon}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* USER & LOGOUT SECTION */}
          <div className="flex items-center gap-4 border-l border-white/5 pl-6">
            <div className="hidden lg:flex flex-col items-end leading-none">
              <span className="text-[10px] font-black uppercase text-white tracking-widest mb-1">
                {user?.name || "Master Owner"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[#ccff00]" />
                <span className="text-[7px] font-black text-[#ccff00] uppercase tracking-widest">Authorized</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white/[0.03] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all border border-white/5"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>

      {/* 3. FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-10 border-t border-white/[0.03] no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-20">
          <div className="flex items-center gap-3">
             <Crown size={20} className="text-[#ccff00]" />
             <p className="text-[9px] font-black uppercase tracking-[0.4em]">Sensei Sport <span className="italic">Core v1.0</span></p>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">Global Operational System © 2026</p>
        </div>
      </footer>
    </div>
  );
}