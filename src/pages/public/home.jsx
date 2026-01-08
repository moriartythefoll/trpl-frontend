import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/navbar';
import { 
  FaFacebookF, FaTiktok, FaInstagram, 
  FaChevronLeft, FaChevronRight, FaMapMarkedAlt, FaHotel, 
  FaUmbrellaBeach, FaShuttleVan, FaStar, FaChevronUp, FaChevronDown
} from 'react-icons/fa';

const Home = () => {
  // State untuk Hero Slider
  const [items, setItems] = useState([
    { id: 1, name: 'BASKET', title: 'BOOKING AT', desc: 'Nikmati pengalaman bermain basket di lapangan standar internasional.', img: '/images/basketball-court-night.jpg' },
    { id: 2, name: 'VOLLY', title: 'BOOKING AT', desc: 'Lapangan voli indoor yang nyaman dengan permukaan lantai berkualitas tinggi.', img: '/images/indoors-tennis-court.jpg' },
    { id: 3, name: 'TENNIS', title: 'BOOKING AT', desc: 'Tingkatkan skill tenis Anda di lapangan eksklusif kami.', img: '/images/tennis.png' },
    { id: 4, name: 'BADMINTON', title: 'BOOKING AT', desc: 'Fasilitas badminton terlengkap dengan karpet lapangan standar turnamen.', img: '/images/badminton.png' },
  ]);

  // State untuk Animated Stack (Featured)
  const [stackIndex, setStackIndex] = useState(0);
  const featured = [
    { name: "Premium Arena", role: "VVIP ACCESS", desc: "Area eksklusif dengan fasilitas lounge dan tribun pribadi untuk kenyamanan maksimal.", img: "/images/1.png" },
    { name: "Night Session", role: "ULTRA LIGHTING", desc: "Sistem pencahayaan 2000 lux yang membuat permainan malam hari terasa seperti siang hari.", img: "/images/2.png" },
    { name: "Training Camp", role: "PRO COACH", desc: "Program pelatihan intensif dengan pelatih berlisensi nasional setiap akhir pekan.", img: "/images/3.png" }
  ];

  const services = [
    { title: "Easy Booking", desc: "Sistem pemesanan cepat dan instan.", icon: <FaMapMarkedAlt size={30} /> },
    { title: "Premium Court", desc: "Kualitas lapangan standar profesional.", icon: <FaHotel size={30} /> },
    { title: "Member Benefit", desc: "Potongan harga khusus member.", icon: <FaUmbrellaBeach size={30} /> },
    { title: "Top Facilities", desc: "Fasilitas lengkap untuk kenyamanan Anda.", icon: <FaShuttleVan size={30} /> }
  ];

  const courts = [
    { title: "Elite Basket Court", price: "100k", rating: "4.9", img: "/images/basketball-court-night.jpg" },
    { title: "Pro Badminton Hall", price: "120k", rating: "5.0", img: "/images/badminton.png" },
    { title: "Grand Tennis Arena", price: "150k", rating: "4.8", img: "/images/tennis.png" },
    { title: "Indoor Volly Pro", price: "100k", rating: "4.7", img: "/images/indoors-tennis-court.jpg" }
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
        <AnimatePresence mode='wait'>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 bg-cover bg-center ${index === 0 ? 'w-full h-full z-1' : index <= 3 ? 'w-[200px] h-[300px] top-1/2 -translate-y-1/2 rounded-2xl z-10 hidden md:block border border-white/10 shadow-2xl' : 'hidden'}`}
              style={{ 
                backgroundImage: `url(${item.img})`,
                left: index === 1 ? '55%' : index === 2 ? 'calc(55% + 220px)' : index === 3 ? 'calc(55% + 440px)' : '0',
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {index === 0 && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <div className="absolute top-1/2 left-12 md:left-24 -translate-y-1/2 z-20 max-w-xl">
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-cyan-500 text-lg font-bold tracking-[0.4em] mb-2">{item.title}</motion.h2>
                    <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-5xl md:text-[5.5rem] font-black mb-6 italic uppercase tracking-tighter leading-[0.85]">{item.name}</motion.h1>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-gray-300 mb-8 leading-relaxed">{item.desc}</motion.p>
                    <motion.button whileHover={{ scale: 1.05 }} className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest shadow-lg transition-all">Explore More</motion.button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-12 left-12 md:left-24 z-50 flex gap-4">
          <button onClick={prevSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all"><FaChevronLeft size={20}/></button>
          <button onClick={nextSlide} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-cyan-500 transition-all"><FaChevronRight size={20}/></button>
        </div>
      </section>

      {/* NEW SECTION: ANIMATED STACK FEATURED (Demon Slayer Style) */}
      <section className="py-32 bg-[#063445] overflow-hidden">
        <div className="container mx-auto px-6 md:px-24 flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Card Stack Visual */}
          <div className="relative w-full max-w-[450px] h-[500px] flex justify-center items-center perspective-1000">
            {[-2, -1, 0, 1, 2].map((offset) => {
              const charIndex = (stackIndex + offset + featured.length) % featured.length;
              const item = featured[charIndex];
              const position = offset + 3; // Normalize to 1-5 scale for logic

              return (
                <motion.div
                  key={`${charIndex}-${offset}`}
                  animate={{
                    y: offset * 80,
                    scale: 1 - Math.abs(offset) * 0.15,
                    opacity: 1 - Math.abs(offset) * 0.4,
                    rotateX: offset * -10,
                    zIndex: 10 - Math.abs(offset),
                  }}
                  transition={{ duration: 0.8, ease: [0.68, -0.6, 0.32, 1.6] }}
                  className="absolute w-full aspect-[16/10] rounded-[20px] overflow-hidden shadow-2xl bg-[#1a1a1a] border border-white/10"
                >
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </motion.div>
              );
            })}
          </div>

          {/* Info Side */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <div className="flex gap-4 mb-8 justify-center lg:justify-start">
              <button onClick={prevStack} className="w-14 h-14 rounded-full bg-[#ff4757] flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"><FaChevronUp /></button>
              <button onClick={nextStack} className="w-14 h-14 rounded-full bg-[#ff4757] flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"><FaChevronDown /></button>
            </div>
            
            <AnimatePresence mode='wait'>
              <motion.div
                key={stackIndex}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-5xl font-extrabold text-[#ff4757] mb-2 italic uppercase tracking-tighter">{featured[stackIndex].name}</h2>
                <span className="text-sm tracking-[0.4em] text-[#ffb3b3] font-bold block mb-6 uppercase">{featured[stackIndex].role}</span>
                <p className="text-gray-300 leading-loose text-lg mb-10">{featured[stackIndex].desc}</p>
                <button className="px-10 py-4 border-2 border-[#ff4757] text-[#ff4757] rounded-full font-black uppercase tracking-widest hover:bg-[#ff4757] hover:text-white transition-all shadow-xl shadow-red-500/20">
                  View Details
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 2: PILIH LAPANGAN (Gaya Dev_Flash) */}
      <section className="py-32 bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-6 md:px-24 text-center">
          <div className="mb-20">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-cyan-500 font-bold tracking-[0.5em] uppercase text-xs mb-4">Discovery</motion.h2>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-white text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Pilih Lapangan</motion.h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courts.map((court, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -15 }} className="group bg-[#1a1a1a] rounded-[2.5rem] p-4 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl text-left">
                <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6">
                  <img src={court.img} alt={court.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-cyan-400 font-bold text-sm">{court.price} <span className="text-white/50 text-xs">/jam</span></div>
                </div>
                <div className="px-2 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight italic group-hover:text-cyan-400 transition-colors">{court.title}</h4>
                    <div className="flex items-center gap-1 text-yellow-500"><FaStar size={12} /> <span className="text-white text-xs font-medium">{court.rating}</span></div>
                  </div>
                  <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest font-semibold">Standard International</p>
                  <button className="w-full py-4 bg-white hover:bg-cyan-500 hover:text-white text-black font-black rounded-2xl transition-all duration-300 uppercase tracking-widest text-xs italic">Book Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section className="py-32 px-12 md:px-24 bg-[#0a0a0a]">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-cyan-500 font-bold tracking-[0.5em] uppercase text-xs mb-3 italic">Our Excellence</h2>
            <h3 className="text-white text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">Why Choose Us?</h3>
          </div>
          <p className="text-gray-500 max-w-xs text-sm italic">Standar kualitas dunia untuk kenyamanan berolahraga Anda setiap hari.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div key={index} whileHover={{ y: -10 }} className="group p-10 bg-[#111111] border border-white/5 rounded-[3rem] hover:bg-cyan-950/20 hover:border-cyan-500/20 transition-all duration-500">
              <div className="text-cyan-500 mb-8 group-hover:scale-110 transition-transform duration-500">{service.icon}</div>
              <h4 className="text-white text-2xl font-black mb-4 italic uppercase tracking-tight">{service.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
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