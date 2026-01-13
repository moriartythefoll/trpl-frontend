import React from "react";
import { FaInstagram, FaWhatsapp, FaTwitter, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050505] pt-24 pb-12 border-t border-white/5 px-6 md:px-24 overflow-hidden relative">
      {/* Dekorasi Background - Garis halus khas sport brand */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          {/* Kolom 1: Brand & Desc */}
          <div className="col-span-1 md:col-span-1 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center rotate-45">
                <div className="w-3 h-3 bg-black -rotate-45" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter text-white">
                SPORT<span className="text-cyan-500">CENTER</span>
              </h2>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed font-bold uppercase tracking-widest italic">
              The ultimate arena experience. Kami menyediakan fasilitas olahraga standar internasional untuk performa maksimal Anda.
            </p>
          </div>

          {/* Kolom 2: Quick Links */}
          <div className="text-left">
            <h4 className="text-white text-[12px] font-black tracking-[0.3em] uppercase mb-8 italic">Navigation</h4>
            <ul className="space-y-4 text-gray-500 text-[10px] font-bold tracking-widest uppercase italic">
              <li className="hover:text-cyan-500 cursor-pointer transition-all" onClick={scrollToTop}>Home</li>
              <li className="hover:text-cyan-500 cursor-pointer transition-all">All Arenas</li>
              <li className="hover:text-cyan-500 cursor-pointer transition-all">Featured Fields</li>
              <li className="hover:text-cyan-500 cursor-pointer transition-all">Tournament</li>
            </ul>
          </div>

          {/* Kolom 3: Contact Info */}
          <div className="text-left">
            <h4 className="text-white text-[12px] font-black tracking-[0.3em] uppercase mb-8 italic">Contact Us</h4>
            <ul className="space-y-4 text-gray-500 text-[10px] font-bold tracking-widest uppercase italic">
              <li className="flex items-center gap-3"><FaMapMarkerAlt className="text-cyan-500" /> Jakarta, Indonesia</li>
              <li className="flex items-center gap-3"><FaWhatsapp className="text-cyan-500" size={14} /> +62 812 3456 789</li>
              <li className="flex items-center gap-3"><FaEnvelope className="text-cyan-500" /> support@sportcenter.com</li>
            </ul>
          </div>

          {/* Kolom 4: Newsletter/Social */}
          <div className="text-left">
            <h4 className="text-white text-[12px] font-black tracking-[0.3em] uppercase mb-8 italic">Follow Us</h4>
            <div className="flex gap-4">
              {[<FaInstagram />, <FaWhatsapp />, <FaTwitter />].map((icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all duration-300">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-[9px] tracking-[0.4em] uppercase font-bold italic">
            © 2026 SportCenter. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-gray-600 text-[9px] tracking-[0.2em] uppercase font-bold italic">
            <span className="hover:text-white cursor-pointer transition-all">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-all">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;