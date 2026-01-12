import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const pendingCount = useBookingStore(state => state.pendingCount);
  const fetchPending = useBookingStore(state => state.fetchPending);
  
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch pending saat mount
  useEffect(() => {
    if (user && user.role === "user") fetchPending();
  }, [user]);

  // Klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "owner") navigate("/owner/reports");
    else navigate("/profile");
  };

  const handleNavigateBookings = () => {
    navigate("/my-bookings");
    setOpenProfile(false);
  };

  const handleLogout = () => {
    logout();
    setOpenProfile(false);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-12 py-4 bg-black/30 backdrop-blur-md border-b border-white/10 shadow-lg">
      
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer w-12 h-12 bg-black/60 rounded-full flex items-center justify-center border border-white/20 shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300"
      >
        <div
          className="w-5 h-5 bg-yellow-500"
          style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
        />
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex gap-12 text-white/80 text-[10px] font-bold tracking-widest uppercase">
        <li className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all duration-200" onClick={() => scrollToSection("hero")}>Home</li>
        <li className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all duration-200" onClick={() => scrollToSection("venues")}>Booking</li>
        <li className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all duration-200" onClick={() => scrollToSection("services")}>Services</li>
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 text-xs placeholder-white outline-none w-48 focus:w-64 transition-all duration-300 hover:shadow-cyan-500/30"
          />
          <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-xs" />
        </div>

        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-black/40 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
          >
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            {/* Circle user icon */}
            <div
              onClick={() => setOpenProfile(!openProfile)}
              className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center cursor-pointer hover:shadow-cyan-500/50 transition-all"
            >
              <span className="text-xs text-white font-semibold">{user.name[0]}</span>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {openProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 10, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ originY: 0 }}
                  className="absolute right-0 mt-12 w-48 bg-[#111] border border-white/10 rounded-xl shadow-lg flex flex-col py-2 z-50"
                >
                  <button
                    onClick={handleProfileClick}
                    className="px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-cyan-500/20 transition text-left"
                  >
                    Profile Settings
                  </button>

                  <button
                    onClick={handleNavigateBookings}
                    className="px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-cyan-500/20 transition text-left flex items-center justify-between"
                  >
                    My Bookings
                    {pendingCount > 0 && (
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-red-500/30 transition text-left"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
