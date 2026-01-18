import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import { 
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight, 
  FaInfoCircle, FaCheckCircle, FaClock 
} from "react-icons/fa";
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

  if (loading) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-20">
      <Navbar />
      
      {/* 1. HERO HEADER - Clean Solid Gradient (No Image) */}
      <div className="relative bg-slate-900 pt-32 pb-20 overflow-hidden">
        {/* Dekorasi Abstract agar tidak sepi */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 md:px-24 relative z-10">
          {/* Tombol Back - Posisi Nyaman */}
          <motion.button 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-white transition-colors font-black text-xs uppercase tracking-[0.2em] mb-10"
          >
            <FaChevronLeft size={12} /> Back to Explore
          </motion.button>

          {/* Nama Gedung - Fokus Utama */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-[0.8] mb-6">
              {venue?.name}
            </h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-sm md:text-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                <FaMapMarkerAlt size={20} />
              </div>
              {venue?.address}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. MAIN CONTENT - TWO COLUMN */}
      <div className="container mx-auto px-6 md:px-24 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR INFO (KIRI) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-slate-100">
              <h4 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-900">
                <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
                Venue Stats
              </h4>
              <div className="space-y-5">
                {['Premium Flooring', 'Official Lighting', 'Pro Amenities', 'Safe Parking'].map(f => (
                  <div key={f} className="flex items-center gap-4 text-xs font-black text-slate-600 uppercase italic">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <FaCheckCircle size={14} />
                    </div> 
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 group">
               <div className="flex justify-between items-start mb-4">
                  <FaClock className="text-white/40 group-hover:rotate-12 transition-transform" size={32} />
                  <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Open Now</span>
               </div>
               <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Operational</p>
               <p className="text-white text-4xl font-black italic tracking-tighter">08:00 - 22:00</p>
            </div>
          </div>

          {/* LIST FIELDS (KANAN) */}
          <div className="lg:col-span-8">
            <div className="bg-white p-4 md:p-8 rounded-[3rem] border border-slate-200/60 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">
                     Available <span className="text-primary">Courts</span>
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pilih lapangan favoritmu</p>
               </div>
               <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Areana: </span>
                  <span className="text-primary font-black ml-2">{venue?.fields?.length || 0}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {venue?.fields?.map((field) => (
                <motion.div 
                  key={field.id}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 group transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={field.image ? `http://localhost:8000/storage/${field.image}` : "/images/field.jpg"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-6 left-6">
                       <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-white/10">
                          <p className="text-primary font-black text-sm italic tracking-tight">Rp {parseInt(field.price_per_hour).toLocaleString()} <span className="text-white/50 text-[10px] font-normal">/ Jam</span></p>
                       </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <h4 className="text-2xl font-black text-slate-800 uppercase italic mb-6 group-hover:text-primary transition-colors leading-none tracking-tighter">
                      {field.name}
                    </h4>
                    
                    <div className="flex gap-2 mb-10">
                      <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-4 py-2 rounded-xl border border-slate-100 uppercase italic">Pro Vinyl</span>
                      <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-4 py-2 rounded-xl border border-slate-100 uppercase italic">Indoor</span>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/field-details/${field.id}`)}
                      className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-primary shadow-xl transition-all text-[11px] italic"
                    >
                      Book This Court <FaChevronRight size={10}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailVenue;