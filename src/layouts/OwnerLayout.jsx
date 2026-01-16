import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Zap, Crown, Clock, Activity, ShieldCheck, Fingerprint, Terminal } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  // State untuk jam real-time
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Terminal Disconnected, Sensei!");
  };

  return (
    // THEME: Cyberpunk Stealth dengan Font Poppins
    <div className="role-owner min-h-screen bg-[#050505] text-white font-['Poppins'] selection:bg-purple-500 selection:text-black">
      
      {/* 1. TOP NAV - SYSTEM HEADER */}
      <nav className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-b border-purple-500/10 no-print">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          
          {/* BRAND AREA - NEON LOGO */}
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all hover:scale-110 duration-500 border border-purple-400/30">
              <Zap size={24} strokeWidth={3} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-[900] italic uppercase tracking-tighter text-2xl leading-none">
                SENSEI<span className="text-purple-500 text-3xl">_</span>CEO
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500">Node Secure: Operational</p>
              </div>
            </div>
          </div>

          {/* CENTER SECTION - TELEMETRY & CLOCK (POPPINS BOLD) */}
          <div className="hidden lg:flex items-center gap-10 bg-white/[0.02] border border-white/5 px-10 py-3 rounded-2xl backdrop-blur-md">
            {/* Clock */}
            <div className="flex items-center gap-5 pr-10 border-r border-white/5">
              <Clock size={16} className="text-purple-500" />
              <div className="flex flex-col">
                <span className="text-[15px] font-[800] tracking-widest leading-none text-white">
                  {time.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">System Time</span>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="flex items-center gap-8">
               <div className="flex flex-col items-start">
                  <span className="text-[11px] font-[900] text-cyan-400 leading-none tracking-tighter">0.002ms</span>
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">IO_LATENCY</span>
               </div>
               <div className="flex items-center gap-3 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                  <Activity size={12} className="text-purple-500 animate-pulse" />
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em]">Live Stream</span>
               </div>
            </div>
          </div>

          {/* USER & SECURITY - IDENTITY VERIFIED */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <div className="flex items-center gap-3 mb-1.5">
                <Fingerprint size={16} className="text-cyan-400" />
                <span className="text-[13px] font-[900] uppercase text-white tracking-wide">
                  {user?.name || "ROOT_ADMIN"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[8px] font-[900] text-purple-500 uppercase tracking-[0.3em] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    MASTER ACCESS
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/5 mx-2" />

            <button 
              onClick={handleLogout}
              className="group relative p-3 bg-white/[0.03] hover:bg-rose-500/20 text-zinc-500 hover:text-rose-500 rounded-xl transition-all duration-500 border border-white/5 shadow-inner"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-14 relative">
        {/* Cyber Background Glow Accents */}
        <div className="fixed top-[-10%] left-[20%] w-[600px] h-[400px] bg-purple-600/5 blur-[150px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-[10%] w-[500px] h-[300px] bg-cyan-400/5 blur-[120px] pointer-events-none z-0" />
        
        {/* Terminal Header Decoration */}
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 opacity-30">
                <Terminal size={16} className="text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Console ~/user/dashboard/reports</span>
            </div>
            <Outlet />
        </div>
      </main>

      {/* 3. FOOTER - SECURE PROTOCOL */}
      <footer className="max-w-7xl mx-auto px-8 py-16 mt-20 border-t border-white/5 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-5 opacity-40 hover:opacity-100 transition-all duration-700">
              <div className="p-3 border border-white/10 rounded-2xl bg-white/[0.02]">
                <Crown size={24} className="text-purple-500" />
              </div>
              <div>
                <p className="text-[12px] font-[900] uppercase tracking-[0.5em] leading-none text-white">SENSEI_SPORT_CORP</p>
                <p className="text-[8px] font-bold text-zinc-600 mt-2 uppercase tracking-[0.2em]">Protocol Version 4.0.0_STABLE</p>
              </div>
          </div>
          
          <div className="flex gap-12">
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-[900] uppercase tracking-[0.4em] text-zinc-700">Encrypted_Tunnel</p>
              <p className="text-[10px] font-mono font-bold text-cyan-400 mt-1 shadow-[0_0_15px_rgba(34,211,238,0.2)]">AES_256_GCM_READY</p>
            </div>
            <div className="flex flex-col items-end border-l border-white/5 pl-12">
              <p className="text-[9px] font-[900] uppercase tracking-[0.4em] text-zinc-700">Global Node</p>
              <p className="text-[10px] font-mono font-bold text-purple-500 mt-1 uppercase">IDN_WEST_02</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}