import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import { getExploreVenues } from "../../services/user/venue.service";
import { getFields } from "../../services/user/field.service"; 
import {
  FaChevronLeft, FaChevronRight, FaStar, FaChevronUp, FaChevronDown,
  FaMapMarkerAlt, FaFutbol
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [fields, setFields] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [venueIndex, setVenueIndex] = useState(0);

  // === HERO STATE ===
  const [items, setItems] = useState([
    { id: 1, name: "FUTSAL", title: "BOOKING AT", desc: "Nikmati pengalaman bermain futsal di lapangan standar internasional.", img: "/images/futsal.jpg" },
    { id: 2, name: "VOLLY", title: "BOOKING AT", desc: "Lapangan voli indoor yang nyaman.", img: "/images/indoors-tennis-court.jpg" },
    { id: 3, name: "TENNIS", title: "BOOKING AT", desc: "Tingkatkan skill tenis Anda.", img: "/images/tennis.png" },
    { id: 4, name: "BADMINTON", title: "BOOKING AT", desc: "Fasilitas badminton terlengkap.", img: "/images/badminton.png" },
  ]);

  const nextSlide = () => setItems(prev => [...prev.slice(1), prev[0]]);
  const prevSlide = () => setItems(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [v, f] = await Promise.all([getExploreVenues(), getFields()]);
        setVenues(v);
        setFields(f);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getImageUrl = (path) => path?.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;

  return (
    <div className="w-full bg-[#0a0a0a] text-white overflow-x-hidden antialiased selection:bg-cyan-500">
      <Navbar />

      {/* --- SECTION 1: HERO MAXIMALIST (THE ORIGINAL) --- */}
      <section id="hero" className="relative w-full h-screen overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={items[0].id}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${items[0].img})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full container mx-auto px-6 md:px-24 flex items-center">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={items[0].id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-cyan-500 text-lg font-bold tracking-[0.4em] mb-2">{items[0].title}</h2>
                <h1 className="text-6xl md:text-[5.5rem] font-black mb-6 italic uppercase tracking-tighter leading-[0.85]">
                  {items[0].name}
                </h1>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">{items[0].desc}</p>
                <button 
                  onClick={() => document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  Explore More
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* THUMBNAILS STACK (DI KANAN HERO) */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-30 hidden lg:flex gap-6 pr-24 pointer-events-none">
          {items.slice(1, 4).map((item, idx) => (
            <motion.div
              key={item.id}
              layoutId={item.id.toString()}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="w-48 h-72 rounded-3xl overflow-hidden border border-white/20 shadow-2xl rotate-3 relative group"
            >
              <img src={item.img} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <p className="text-[10px] font-black italic uppercase tracking-widest text-white">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-12 left-12 md:left-24 z-50 flex gap-4">
          <button onClick={prevSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all bg-black/20 backdrop-blur-md text-white"><FaChevronLeft size={20} /></button>
          <button onClick={nextSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all bg-black/20 backdrop-blur-md text-white"><FaChevronRight size={20} /></button>
        </div>
      </section>

      {/* --- SECTION 2: THE VENUE STACK (GEDUNG) --- */}
      <section id="venue" className="py-32 bg-[#063445] relative">
        <div className="container mx-auto px-6 md:px-24 flex flex-col lg:flex-row items-center justify-between gap-20">
          
          <div className="relative w-full max-w-[450px] h-[500px] [perspective:1000px] flex items-center justify-center">
            {loading ? (
              <div className="text-cyan-400 animate-pulse font-black italic">LOADING ARENA...</div>
            ) : venues.length > 0 && (
              [-2, -1, 0, 1, 2].map((offset) => {
                const index = (venueIndex + offset + venues.length) % venues.length;
                const venue = venues[index];
                return (
                  <motion.div 
                    key={`venue-stack-${venue.id}-${offset}`}
                    animate={{ 
                      y: offset * 85, 
                      scale: 1 - Math.abs(offset) * 0.15, 
                      opacity: 1 - Math.abs(offset) * 0.4,
                      rotateX: offset * -10,
                      zIndex: 10 - Math.abs(offset) 
                    }} 
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="absolute w-full aspect-[1.4] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                  >
                    <img src={getImageUrl(venue.image)} className="w-full h-full object-cover" alt="" />
                  </motion.div>
                );
              })
            )}
          </div>
          
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <div className="flex gap-4 mb-8 justify-center lg:justify-start">
              <button onClick={() => setVenueIndex(prev => (prev - 1 + venues.length) % venues.length)} className="w-14 h-14 rounded-2xl bg-[#ff4757] hover:bg-[#ff6b81] flex items-center justify-center shadow-lg transition-all"><FaChevronUp /></button>
              <button onClick={() => setVenueIndex(prev => (prev + 1) % venues.length)} className="w-14 h-14 rounded-2xl bg-[#ff4757] hover:bg-[#ff6b81] flex items-center justify-center shadow-lg transition-all"><FaChevronDown /></button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div key={venueIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-5xl md:text-6xl font-black text-[#ff4757] mb-2 italic uppercase tracking-tighter leading-tight">{venues[venueIndex]?.name}</h2>
                <p className="text-[#ffb3b3] font-bold flex items-center justify-center lg:justify-start gap-2 mb-6 uppercase text-sm tracking-widest">
                   <FaMapMarkerAlt/> {venues[venueIndex]?.address}
                </p>
                <p className="text-gray-300 leading-relaxed text-lg mb-10">Kunjungi arena olahraga terbaik dengan standar internasional. Kami menyediakan fasilitas premium untuk performa maksimal Anda.</p>
                <button 
                  onClick={() => navigate(`/venues/${venues[venueIndex]?.id}`)}
                  className="px-12 py-5 border-2 border-[#ff4757] text-[#ff4757] rounded-full font-black uppercase tracking-widest hover:bg-[#ff4757] hover:text-white transition-all shadow-[0_0_20px_rgba(255,71,87,0.3)] italic"
                >
                  Lihat Lapangan Tersedia
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: TOP FIELDS (DISCOVERY) --- */}
      <section id="fields" className="py-32 bg-[#0d0d0d]">
        <div className="container mx-auto px-6 md:px-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-left">
            <div>
              <h2 className="text-cyan-500 font-bold tracking-[0.5em] uppercase text-xs mb-4">Top Performance</h2>
              <h3 className="text-white text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Lapangan Unggulan</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {fields.slice(0, 4).map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#1a1a1a] rounded-[3rem] p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl"
              >
                <div className="relative h-72 w-full overflow-hidden rounded-[2.5rem] mb-6">
                  <img src={getImageUrl(field.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute top-5 right-5 bg-cyan-500 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase italic">Top Rated</div>
                </div>
                <div className="px-2">
                  <h4 className="text-2xl font-bold text-white uppercase italic truncate mb-1">{field.name}</h4>
                  <p className="text-gray-500 text-[10px] mb-8 uppercase tracking-widest font-bold flex items-center gap-2">
                    <FaFutbol className="text-cyan-500"/> {field.venue?.name}
                  </p>
                  <button 
                    onClick={() => navigate(`/field-details/${field.id}`)}
                    className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-500 hover:text-white transition-all uppercase text-[11px] italic tracking-widest shadow-lg"
                  >
                    Booking Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* --- SECTION: SERVICES (PEMANIS) --- */}
      <section id="services" className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="container mx-auto px-6 md:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Standard Pro", desc: "Fasilitas lapangan standar internasional untuk performa terbaik.", icon: "🏆" },
              { title: "Instant Access", desc: "Booking dan dapatkan kode akses lapangan secara otomatis.", icon: "⚡" },
              { title: "Full Amenities", desc: "Kamar mandi bersih, locker room, dan area parkir luas.", icon: "🛡️" },
            ].map((service, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-cyan-500/50 transition-all duration-500">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">{service.icon}</div>
                <h3 className="text-white font-black italic tracking-widest uppercase mb-4">{service.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-bold uppercase italic tracking-tighter">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
};

export default Home;