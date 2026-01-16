import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { FaSearch, FaBell, FaBars, FaTimes, FaUserAlt, FaHistory, FaSignOutAlt, FaCircle } from "react-icons/fa";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const pendingCount = useBookingStore((state) => state.pendingCount);
  const fetchPending = useBookingStore((state) => state.fetchPending);

  const [openProfile, setOpenProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isLightPage = location.pathname !== "/"; 
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    if (user && user.role === "user") fetchPending();
  }, [user, fetchPending]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpenProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenProfile(false);
    navigate("/");
  };

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Beranda", id: "hero" },
    { name: "Stadion", id: "venue" },
    { name: "Lapangan", id: "fields" },
    { name: "Pelayanan", id: "services" },
  ];

  // --- STYLING CONSTANTS ---
  const navTextColor = isLightPage && !isScrolled ? "text-slate-900" : "text-white";
  const navLinkColor = isLightPage && !isScrolled ? "text-slate-500 hover:text-indigo-600" : "text-white/50 hover:text-cyan-400";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full z-[100] flex justify-center transition-all duration-500 ease-in-out"
      style={{
        paddingTop: isScrolled ? "1.25rem" : "0",
      }}
    >
      {/* GRADIENT SHRIM (Vignette Top) - Supaya garis border full width kelihatan jelas di atas image Hero */}
      {!isScrolled && !isLightPage && (
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
      )}

      <div className={`
        relative flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isScrolled 
          ? "w-[90%] max-w-6xl px-8 py-3 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]" 
          : (isLightPage 
            ? "w-full px-12 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200" 
            : "w-full px-12 py-8 bg-transparent border-b border-white/10") // Pertegas garis putih transparan di sini
        }
      `}>
        
        {/* SCROLLED GLOW EFFECT */}
        {isScrolled && (
          <div className="absolute inset-0 rounded-full border border-cyan-500/10 pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]" />
        )}

        {/* LOGO AREA */}
        <div onClick={() => navigate("/")} className="group flex items-center gap-3 cursor-pointer shrink-0 z-10">
          <div className="relative w-8 h-8">
            <div className={`absolute inset-0 bg-cyan-500 rounded-lg rotate-45 group-hover:rotate-[225deg] transition-all duration-700 ${isScrolled ? 'shadow-[0_0_15px_rgba(6,182,212,0.6)]' : ''}`} />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2.5 h-2.5 bg-black" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
            </div>
          </div>
          <h1 className={`text-lg font-black tracking-tighter italic transition-colors ${navTextColor}`}>
            SPORT<span className="text-cyan-500 group-hover:text-cyan-300">CENTER</span>
          </h1>
        </div>

        {/* NAV LINKS - PILL BOX */}
        <div className={`hidden md:flex items-center px-1 py-1 rounded-full border transition-all duration-500 
          ${isScrolled ? "bg-white/5 border-white/5" : "bg-transparent border-transparent"}`}>
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li 
                key={link.name}
                onClick={() => scrollToSection(link.id)}
                className={`px-5 py-2 text-[9px] font-black tracking-[0.2em] uppercase cursor-pointer transition-all rounded-full hover:bg-white/10 ${navLinkColor}`}
              >
                {link.name}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-5 z-10">
          {/* Enhanced Search */}
          <div className="relative hidden lg:block group">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLightPage && !isScrolled ? "text-slate-400" : "text-white/30"}`} size={10} />
            <input
              type="text"
              placeholder="QUICK SEARCH..."
              className={`border rounded-full pl-10 pr-4 py-2 text-[8px] font-black tracking-[0.3em] outline-none transition-all duration-500
                ${isScrolled ? "w-32 bg-white/5 border-white/10 text-white focus:w-48 focus:bg-white/10" : "w-40 bg-white/10 border-white/10 text-white focus:w-56 focus:bg-white/20"}
                ${isLightPage && !isScrolled ? "bg-slate-100 border-slate-200 text-slate-900 focus:bg-slate-200" : ""}
              `}
            />
          </div>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className={`
                px-7 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95
                ${isScrolled 
                  ? "bg-cyan-500 text-black hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  : "bg-white text-black hover:bg-cyan-500"}
              `}
            >
              LOGIN
            </button>
          ) : (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <button 
                onClick={() => navigate("/my-bookings")}
                className={`relative p-2.5 rounded-full transition-all border border-transparent hover:border-white/10 ${isLightPage && !isScrolled ? "text-slate-400 hover:bg-slate-100" : "text-white/40 hover:bg-white/5 hover:text-cyan-400"}`}
              >
                <FaBell size={14} />
                {pendingCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpenProfile(!openProfile)}
                className={`group relative w-10 h-10 rounded-full p-[2px] transition-all border shadow-lg
                  ${isLightPage && !isScrolled ? "border-slate-200 bg-slate-100" : "border-white/20 bg-white/10"}
                `}
              >
                <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden transition-transform group-active:scale-90 border border-white/5">
                  <span className="text-xs font-black text-white">{user.name[0].toUpperCase()}</span>
                </div>
              </button>

              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 12 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute right-0 top-full w-64 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden"
                  >
                    <div className="p-7 border-b border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCircle className="text-cyan-500 text-[6px] animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
                        <span className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase">Status: Online</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold truncate mt-0.5 uppercase tracking-tighter opacity-60">{user.email}</p>
                    </div>
                    <div className="p-3 bg-black/40">
                      <DropdownItem icon={<FaUserAlt />} label="Profil" onClick={() => navigate("/profile")} />
                      <DropdownItem icon={<FaHistory />} label="Riwayat Pemesanan" onClick={() => navigate("/my-bookings")} badge={pendingCount} />
                      <div className="h-[1px] bg-white/5 my-2 mx-5" />
                      <DropdownItem icon={<FaSignOutAlt />} label="Keluar" onClick={handleLogout} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button 
            className={`md:hidden p-2 rounded-full transition-colors ${isLightPage && !isScrolled ? "text-slate-900" : "text-white/50 hover:text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY - ULTRA DARK */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 h-screen bg-black/95 backdrop-blur-3xl z-[200] flex flex-col p-12 md:hidden"
          >
            <div className="flex justify-between items-center mb-24">
              <span className="text-xl font-black italic tracking-widest text-white">MENU<span className="text-cyan-500 text-[8px] align-top ml-1">●</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-12">
              {navLinks.map((link, idx) => (
                <motion.button
                  key={link.name}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1, ease: "easeOut" }}
                  onClick={() => scrollToSection(link.id)}
                  className="text-6xl font-black uppercase italic text-left text-white/10 hover:text-cyan-500 transition-all group relative overflow-hidden"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-cyan-500 group-hover:w-full transition-all duration-500" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const DropdownItem = ({ icon, label, onClick, badge, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${
      danger ? "hover:bg-rose-500/10 text-rose-500" : "hover:bg-white/5 text-slate-400 hover:text-white"
    }`}
  >
    <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.2em] uppercase italic">
      <span className={`${danger ? "text-rose-500" : "text-cyan-500"} group-hover:scale-125 transition-transform duration-500`}>{icon}</span>
      <span>{label}</span>
    </div>
    {badge > 0 && <span className="bg-cyan-500 text-black text-[8px] font-black px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]">{badge}</span>}
  </button>
);

export default Navbar;