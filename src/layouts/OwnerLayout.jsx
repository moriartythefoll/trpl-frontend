import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  LogOut, Crown, Clock, Shield, Bell, 
  Globe, Command, Landmark, Briefcase, 
  FileCheck, Gavel, BarChart3, Fingerprint
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Executive Session Concluded.");
  };

  return (
    // THEME: Institutional Prestige (Pure White, Deep Slate, Gold Accents)
    <div className="role-owner min-h-screen bg-[#f8f9fb] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-100">
      
      {/* 1. TOP NAV - THE EXECUTIVE SUITE */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 no-print">
        <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
          
          {/* BRAND AREA - SPORTCENTER GLOBAL */}
          <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="absolute -inset-2 bg-amber-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                <div className="relative w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 shadow-xl shadow-slate-200 transition-all duration-500 group-hover:bg-amber-500 group-hover:text-white">
                  <Landmark size={22} strokeWidth={2} />
                </div>
            </div>
            <div>
              <h1 className="font-black tracking-[ -0.05em] text-2xl leading-none text-slate-900">
                SPORT<span className="text-amber-600">CENTER</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Governance Office / HQ</p>
              </div>
            </div>
          </div>

          {/* CENTER PANEL - GLOBAL OPERATIONS CONTROL */}
          <div className="hidden xl:flex items-center gap-10 bg-slate-100/50 border border-slate-200/40 px-10 py-3 rounded-2xl">
            {/* Market Time */}
            <div className="flex items-center gap-5 pr-10 border-r border-slate-200">
              <Clock size={16} className="text-amber-600" />
              <div className="flex flex-col">
                <span className="text-[15px] font-black tracking-tight text-slate-800 tabular-nums">
                  {time.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Corporate Time</span>
              </div>
            </div>

            {/* Directory Access */}
            <button 
              onClick={() => toast("Search Registry (⌘+K)", { icon: "🏛️" })}
              className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-2 rounded-xl shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all group"
            >
              <Command size={14} className="text-slate-400 group-hover:text-amber-600" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Master Registry</span>
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 rounded">CMD</kbd>
                <kbd className="px-1.5 py-0.5 text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 rounded">K</kbd>
              </div>
            </button>
          </div>

          {/* EXECUTIVE IDENTITY */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end leading-none">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[14px] font-black text-slate-900 tracking-tight">
                  {user?.name || "Managing Director"}
                </span>
                <Fingerprint size={16} className="text-amber-600" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Verified Signatory</p>
            </div>

            <div className="h-10 w-[1px] bg-slate-200 mx-2" />

            <div className="flex gap-3">
                <button className="p-3 text-slate-400 hover:text-amber-600 transition-colors">
                    <Bell size={20} />
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white hover:bg-amber-600 rounded-xl transition-all duration-500 shadow-lg shadow-slate-200 font-black text-[10px] uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    <span>Exit</span>
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-[1600px] mx-auto px-10 py-12 relative min-h-[calc(100vh-250px)]">
        
        {/* Subtle Institutional Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute -top-[10%] -right-[5%] w-[800px] h-[800px] bg-amber-50/50 rounded-full blur-[120px]" />
            <div className="absolute top-[20%] -left-[5%] w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[100px]" />
        </div>
        
        {/* BREADCRUMB & STATUS BAR */}
        <div className="relative z-10 flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <Briefcase size={16} className="text-slate-900" />
                </div>
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em]">
                    <span className="text-slate-400">Asset Management</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-slate-900">Intelligence Portfolio</span>
                </div>
            </div>

            <div className="flex items-center gap-8 px-8 py-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Clear</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-3">
                    <FileCheck size={14} className="text-amber-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Audit Ready</span>
                </div>
            </div>
        </div>
        
        {/* PAGE CONTENT */}
        <div className="relative z-10">
            <Outlet />
        </div>
      </main>

      {/* 3. FOOTER - INSTITUTIONAL COMPLIANCE */}
      <footer className="max-w-[1600px] mx-auto px-10 py-20 mt-20 border-t border-slate-200 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-16">
          
          {/* Logo & Corporate Identity */}
          <div className="flex items-center gap-5">
              <div className="w-12 h-12 border-2 border-slate-900 rounded-xl bg-white flex items-center justify-center">
                <Crown size={22} className="text-slate-900" />
              </div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-widest text-slate-900">SportCenter Global Inc.</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Institutional Asset Division © 2026</p>
              </div>
          </div>

          {/* Center: Legal Badge */}
          <div className="flex justify-center">
             <div className="flex items-center gap-4 px-8 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
                <Gavel size={14} className="text-amber-700" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Certified Fiscal Governance</span>
             </div>
          </div>
          
          {/* Right: Operational Status */}
          <div className="flex justify-end gap-12">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Institutional Status</p>
              <p className="text-[12px] font-black text-slate-900 mt-1 uppercase tracking-tight">Private Access</p>
            </div>
            <div className="h-12 w-[1px] bg-slate-200" />
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Compliance Cycle</p>
              <p className="text-[12px] font-black text-amber-600 mt-1 uppercase tracking-tight italic font-serif">FY2026_Q1_CLEAR</p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}