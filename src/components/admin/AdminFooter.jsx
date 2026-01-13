import React from "react";
import { HiOutlineServer, HiOutlineShieldCheck } from "react-icons/hi";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto px-6 py-4 bg-white/50 border-t border-slate-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LEFT: Copyright & Branding */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-slate-500">
            © {currentYear} <span className="font-bold text-slate-700">SportCenter</span>. 
            <span className="hidden sm:inline"> All rights reserved.</span>
          </p>
        </div>

        {/* RIGHT: System Status Indicators */}
        <div className="flex items-center gap-6">
          {/* Status Server */}
          <div className="flex items-center gap-2 group cursor-help">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider flex items-center gap-1">
              <HiOutlineServer size={14} /> System Online
            </span>
          </div>

          {/* Version & Security */}
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              v2.0.4-PRO
            </span>
            <span className="hidden sm:flex items-center gap-1 text-cyan-600">
              <HiOutlineShieldCheck size={14} /> Encrypted
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}