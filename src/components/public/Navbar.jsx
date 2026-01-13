import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { FaSearch, FaBell, FaBars, FaTimes, FaUserAlt, FaHistory, FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const pendingCount = useBookingStore((state) => state.pendingCount);
  const fetchPending = useBookingStore((state) => state.fetchPending);

  // --- UI STATES ---
  const [openProfile, setOpenProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();

  // --- SCROLL LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Efek Transparansi
    if (latest > 50) setIsScrolled(true);
    else setIsScrolled(false);

    // Efek Sembunyi (Hide on Scroll Down)
    if (latest > previous && latest > 150) setHidden(true);
    else setHidden(false);
  });

  useEffect(() => {
    if (user && user.role === "user") fetchPending();
  }, [user, fetchPending]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
    setOpenProfile(false);
    navigate("/");
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", id: "hero" },
    { name: "Venue", id: "venue" },
    { name: "Fields", id: "fields" },
    { name: "Services", id: "services" },
  ];

  return (
    <motion.nav
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-xl py-3 border-b border-white/10" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* LOGO AREA */}
        <div 
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center rotate-45 group-hover:rotate-[225deg] transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <div className="w-4 h-4 bg-black -rotate-45" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">
            SPORT<span className="text-cyan-500 group-hover:text-white transition-colors">CENTER</span>
          </h1>
        </div>

        {/* DESKTOP NAV LINKS */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li 
              key={link.name}
              onClick={() => scrollToSection(link.id)}
              className="text-[10px] font-black tracking-[0.3em] uppercase cursor-pointer text-white/60 hover:text-cyan-400 hover:translate-y-[-2px] transition-all"
            >
              {link.name}
            </li>
          ))}
        </ul>

        {/* RIGHT SIDE: SEARCH & AUTH */}
        <div className="flex items-center gap-6">
          {/* Search Bar Desktop */}
          <div className="relative hidden lg:block group">
            <input
              type="text"
              placeholder="SEARCH ARENA..."
              className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[9px] font-bold tracking-widest text-white outline-none w-40 group-hover:w-56 focus:w-56 focus:border-cyan-500 transition-all italic"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-cyan-500" size={10} />
          </div>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic transition-all active:scale-95"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {/* Notif Bell */}
              <div 
                className="relative cursor-pointer text-white/50 hover:text-cyan-500 transition-colors"
                onClick={() => navigate("/my-bookings")}
              >
                <FaBell size={18} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white font-bold animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </div>

              {/* Profile Trigger */}
              <div
                onClick={() => setOpenProfile(!openProfile)}
                className="w-10 h-10 rounded-full border-2 border-cyan-500/30 p-0.5 hover:border-cyan-500 transition-all cursor-pointer"
              >
                <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-black text-white">{user.name[0].toUpperCase()}</span>
                </div>
              </div>

              {/* PROFILE DROPDOWN */}
              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 10, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110]"
                  >
                    <div className="p-5 bg-gradient-to-br from-zinc-900 to-black border-b border-white/5">
                      <p className="text-[9px] font-black text-cyan-500 tracking-[0.2em] uppercase mb-1">Authenticated</p>
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <DropdownItem icon={<FaUserAlt />} label="My Profile" onClick={() => navigate("/profile")} />
                      <DropdownItem 
                        icon={<FaHistory />} 
                        label="Booking History" 
                        onClick={() => navigate("/my-bookings")} 
                        badge={pendingCount} 
                      />
                      <div className="my-1 border-t border-white/5" />
                      <DropdownItem icon={<FaSignOutAlt />} label="Logout" onClick={handleLogout} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 h-screen bg-black z-[120] flex flex-col p-10 md:hidden"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xl font-black italic tracking-tighter">MENU</span>
              <FaTimes size={30} onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <ul className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <li 
                  key={link.name} 
                  className="text-4xl font-black uppercase italic hover:text-cyan-500 transition-colors"
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Sub-component untuk Dropdown Item biar rapi
const DropdownItem = ({ icon, label, onClick, badge, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
      danger ? "hover:bg-red-500/10 text-red-500" : "hover:bg-white/5 text-white/70 hover:text-white"
    }`}
  >
    <div className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase italic">
      {icon}
      <span>{label}</span>
    </div>
    {badge > 0 && <span className="bg-cyan-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

export default Navbar;