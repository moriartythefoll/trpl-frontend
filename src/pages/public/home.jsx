import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import { getExploreVenues } from "../../services/user/venue.service";
import {
  FaFacebookF,
  FaTiktok,
  FaInstagram,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkedAlt,
  FaHotel,
  FaUmbrellaBeach,
  FaShuttleVan,
  FaStar,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE DATABASE ---
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // Helper untuk menangani URL Gambar dari Backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/basketball-court-night.jpg"; // Fallback jika null
    if (imagePath.startsWith('http')) return imagePath; // Jika sudah full URL
    return `http://localhost:8000/storage/${imagePath}`; // Jika path dari Laravel storage
  };

  useEffect(() => {
    getExploreVenues()
      .then((data) => {
        setVenues(data);
      })
      .catch((err) => console.error("Gagal ambil venue:", err))
      .finally(() => setLoadingVenues(false));
  }, []);

  // --- STATE ANIMASI (TETAP) ---
  const [items, setItems] = useState([
    { id: 1, name: "BASKET", title: "BOOKING AT", desc: "Nikmati pengalaman bermain basket di lapangan standar internasional.", img: "/images/basketball-court-night.jpg" },
    { id: 2, name: "VOLLY", title: "BOOKING AT", desc: "Lapangan voli indoor yang nyaman.", img: "/images/indoors-tennis-court.jpg" },
    { id: 3, name: "TENNIS", title: "BOOKING AT", desc: "Tingkatkan skill tenis Anda.", img: "/images/tennis.png" },
    { id: 4, name: "BADMINTON", title: "BOOKING AT", desc: "Fasilitas badminton terlengkap.", img: "/images/badminton.png" },
  ]);

  const [stackIndex, setStackIndex] = useState(0);
  const featured = [
    { name: "Premium Arena", role: "VVIP ACCESS", desc: "Area eksklusif lounge.", img: "/images/1.png" },
    { name: "Night Session", role: "ULTRA LIGHTING", desc: "Pencahayaan 2000 lux.", img: "/images/2.png" },
    { name: "Training Camp", role: "PRO COACH", desc: "Pelatih nasional.", img: "/images/3.png" },
  ];

  const services = [
    { title: "Easy Booking", desc: "Sistem pemesanan cepat.", icon: <FaMapMarkedAlt size={30} /> },
    { title: "Premium Court", desc: "Kualitas profesional.", icon: <FaHotel size={30} /> },
    { title: "Member Benefit", desc: "Potongan harga khusus.", icon: <FaUmbrellaBeach size={30} /> },
    { title: "Top Facilities", desc: "Kenyamanan utama.", icon: <FaShuttleVan size={30} /> },
  ];

  const nextSlide = () => setItems([...items.slice(1), items[0]]);
  const prevSlide = () => setItems([items[items.length - 1], ...items.slice(0, -1)]);
  const nextStack = () => setStackIndex((prev) => (prev + 1) % featured.length);
  const prevStack = () => setStackIndex((prev) => (prev - 1 + featured.length) % featured.length);

  return (
    <div className="w-full bg-[#0a0a0a] text-white overflow-x-hidden scroll-smooth selection:bg-cyan-500">
      <Navbar />

      {/* SECTION 1: HERO SLIDER */}
      <section className="relative w-full h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 bg-cover bg-center ${index === 0 ? "w-full h-full z-1" : index <= 3 ? "w-[200px] h-[300px] top-1/2 -translate-y-1/2 rounded-2xl z-10 hidden md:block border border-white/10 shadow-2xl" : "hidden"}`}
              style={{
                backgroundImage: `url(${item.img})`,
                left: index === 1 ? "55%" : index === 2 ? "calc(55% + 220px)" : index === 3 ? "calc(55% + 440px)" : "0",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {index === 0 && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <div className="absolute top-1/2 left-12 md:left-24 -translate-y-1/2 z-20 max-w-xl">
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-cyan-500 text-lg font-bold tracking-[0.4em] mb-2">{item.title}</motion.h2>
                    <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-[5.5rem] font-black mb-6 italic uppercase tracking-tighter leading-[0.85]">{item.name}</motion.h1>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-gray-300 mb-8 leading-relaxed">{item.desc}</motion.p>
                    <motion.button whileHover={{ scale: 1.05 }} className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest shadow-lg transition-all">Explore More</motion.button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-12 left-12 md:left-24 z-50 flex gap-4">
          <button onClick={prevSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all"><FaChevronLeft size={20} /></button>
          <button onClick={nextSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all"><FaChevronRight size={20} /></button>
        </div>
      </section>

      {/* SECTION ANIMATED STACK */}
      <section className="py-32 bg-[#063445] overflow-hidden">
          <div className="container mx-auto px-6 md:px-24 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="relative w-full max-w-[450px] h-[500px] flex justify-center items-center perspective-1000">
              {[-2, -1, 0, 1, 2].map((offset) => {
                const charIndex = (stackIndex + offset + featured.length) % featured.length;
                const item = featured[charIndex];
                return (
                  <motion.div key={`${charIndex}-${offset}`} animate={{ y: offset * 80, scale: 1 - Math.abs(offset) * 0.15, opacity: 1 - Math.abs(offset) * 0.4, rotateX: offset * -10, zIndex: 10 - Math.abs(offset) }} transition={{ duration: 0.8 }} className="absolute w-full aspect-[16/10] rounded-[20px] overflow-hidden shadow-2xl bg-[#1a1a1a] border border-white/10">
                    <img src={item.img} className="w-full h-full object-cover" alt="" />
                  </motion.div>
                );
              })}
            </div>
            <div className="flex-1 max-w-xl text-center lg:text-left">
              <div className="flex gap-4 mb-8 justify-center lg:justify-start">
                <button onClick={prevStack} className="w-14 h-14 rounded-full bg-[#ff4757] flex items-center justify-center shadow-lg hover:scale-110"><FaChevronUp /></button>
                <button onClick={nextStack} className="w-14 h-14 rounded-full bg-[#ff4757] flex items-center justify-center shadow-lg hover:scale-110"><FaChevronDown /></button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={stackIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                  <h2 className="text-5xl font-extrabold text-[#ff4757] mb-2 italic uppercase tracking-tighter">{featured[stackIndex].name}</h2>
                  <span className="text-sm tracking-[0.4em] text-[#ffb3b3] font-bold block mb-6 uppercase">{featured[stackIndex].role}</span>
                  <p className="text-gray-300 leading-loose text-lg mb-10">{featured[stackIndex].desc}</p>
                  <button className="px-10 py-4 border-2 border-[#ff4757] text-[#ff4757] rounded-full font-black uppercase tracking-widest hover:bg-[#ff4757] hover:text-white transition-all">View Details</button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
      </section>

      {/* SECTION 2: PILIH LAPANGAN (CONNECTED TO DB) */}
      <section className="py-32 bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-6 md:px-24 text-center">
          <div className="mb-20">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-cyan-500 font-bold tracking-[0.5em] uppercase text-xs mb-4">Discovery</motion.h2>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-white text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Pilih Lapangan</motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingVenues ? (
              <p className="text-cyan-500 col-span-full animate-pulse font-bold uppercase tracking-widest italic">Powering up the courts...</p>
            ) : venues.length > 0 ? (
              venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -15 }}
                  className="group bg-[#1a1a1a] rounded-[2.5rem] p-4 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl text-left"
                >
                  <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6">
                    <img
                      src={getImageUrl(venue.image)}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/images/basketball-court-night.jpg"; // Gambar default jika link DB mati
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-cyan-400 font-bold text-sm">
                      Best Price
                    </div>
                  </div>
                  <div className="px-2 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold text-white uppercase tracking-tight italic group-hover:text-cyan-400 transition-colors truncate">
                        {venue.name}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FaStar size={12} /> <span className="text-white text-xs font-medium">5.0</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest font-semibold truncate">
                      {venue.address || "International Arena"}
                    </p>
                    <button 
                      onClick={() => navigate(`/fields/${venue.id}`)}
                      className="w-full py-4 bg-white hover:bg-cyan-500 hover:text-white text-black font-black rounded-2xl transition-all duration-300 uppercase tracking-widest text-xs italic"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full italic">No Arenas Found, Sensei.</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section className="py-32 px-12 md:px-24 bg-[#0a0a0a]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {services.map((s, i) => (
             <motion.div key={i} whileHover={{ y: -10 }} className="group p-10 bg-[#111111] border border-white/5 rounded-[3rem] hover:bg-cyan-950/20 transition-all">
                <div className="text-cyan-500 mb-8">{s.icon}</div>
                <h4 className="text-white text-2xl font-black mb-4 italic uppercase">{s.title}</h4>
                <p className="text-gray-500 text-sm">{s.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-white/5 bg-[#0a0a0a] flex flex-col items-center gap-8 text-center">
        <div className="flex gap-10 text-gray-400 text-2xl">
          <FaFacebookF className="hover:text-cyan-500 cursor-pointer transition-all" />
          <FaInstagram className="hover:text-cyan-500 cursor-pointer transition-all" />
          <FaTiktok className="hover:text-cyan-500 cursor-pointer transition-all" />
        </div>
        <p className="text-gray-600 text-[10px] tracking-[0.5em] uppercase font-bold italic">© 2026 SportCenter. Premium Quality.</p>
      </footer>
    </div>
  );
};

export default Home;