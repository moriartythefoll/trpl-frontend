import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import { FaMapMarkerAlt, FaStar, FaFutbol, FaChevronRight } from "react-icons/fa";
import { getVenueById } from "../../services/user/venue.service"; 

const DetailVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenueById(id)
      .then(setVenue)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-cyan-500 font-black italic animate-pulse">SCANNING ARENA...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <Navbar />
      
      {/* HERO MINI - Fokus ke Nama Gedung */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img 
          src={venue?.image ? `http://localhost:8000/storage/${venue.image}` : "/images/hero.jpg"} 
          className="w-full h-full object-cover opacity-30 scale-110" 
          alt={venue?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        <div className="absolute bottom-12 container mx-auto px-6 md:px-24">
          <motion.h1 initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">{venue?.name}</motion.h1>
          <p className="text-gray-400 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"><FaMapMarkerAlt className="text-cyan-500"/> {venue?.address}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-24 py-20">
        <h3 className="text-xl font-black italic uppercase mb-12 border-l-4 border-cyan-500 pl-6">
          Pilih Lapangan Tersedia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {venue?.fields?.map((field) => (
            <motion.div 
              key={field.id}
              whileHover={{ y: -10 }}
              className="bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={field.image ? `http://localhost:8000/storage/${field.image}` : "/images/field.jpg"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <span className="text-cyan-500 font-black italic text-[10px]">Rp {parseInt(field.price_per_hour).toLocaleString()} / Jam</span>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black uppercase italic mb-6">{field.name}</h4>
                <div className="flex gap-2 mb-10">
                  <span className="text-[9px] font-bold text-gray-500 border border-white/5 px-3 py-1 rounded-full uppercase italic">Vinyl Floor</span>
                  <span className="text-[9px] font-bold text-gray-500 border border-white/5 px-3 py-1 rounded-full uppercase italic">Indoor</span>
                </div>
                
                <button 
                  onClick={() => navigate(`/field-details/${field.id}`)}
                  className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-500 hover:text-white transition-all italic text-[10px]"
                >
                  Cek Jadwal & Booking <FaChevronRight size={10}/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailVenue;