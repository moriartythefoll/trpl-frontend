import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/axios";
import { createBooking } from "../../services/user/booking.service"; 
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import Navbar from "../../components/public/Navbar";
import { 
  ChevronLeft, Loader2, MapPin, Star, Calendar, ShieldCheck, Zap
} from "lucide-react";

export default function FieldDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: response, isFetching } = useQuery({
    queryKey: ["field-schedules", id, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/explore/fields/${id}/schedules?date=${selectedDate}`);
      return res.data; 
    }
  });

  const schedules = response?.data || [];
  
  const fieldName = useMemo(() => {
    if (!response) return "Loading...";
    return response.field_name || schedules[0]?.field_name || "Premium Court";
  }, [response, schedules]);

  const venueName = response?.venue_name || "Sport Arena";
  const fieldPrice = schedules.length > 0 ? parseFloat(schedules[0].price) : 0;

  const filteredSchedules = useMemo(() => {
    return schedules.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      if (activeFilter === "morning") return hour < 12;
      if (activeFilter === "afternoon") return hour >= 12 && hour < 18;
      if (activeFilter === "night") return hour >= 18;
      return true;
    });
  }, [schedules, activeFilter]);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        full: d.toLocaleDateString('sv-SE'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      };
    });
  }, []);

  const handleToggleSlot = (slot) => {
    const now = new Date();
    const isToday = selectedDate === now.toLocaleDateString('sv-SE');
    const [startHour] = slot.start_time.split(':');
    if (isToday && parseInt(startHour) <= now.getHours()) return toast.error("Waktu sudah terlewat!");

    setSelectedSlots((prev) => {
      const existingIndex = prev.findIndex(s => s.id === slot.id);
      if (existingIndex !== -1) return prev.filter((_, index) => index !== existingIndex);
      return [...prev, {
        id: slot.id,
        start_time: `${selectedDate} ${slot.start_time}:00`,
        end_time: `${selectedDate} ${slot.end_time}:00`
      }];
    });
  };

  const checkoutMutation = useMutation({
    mutationFn: (payload) => createBooking(payload),
    onSuccess: () => {
      toast.success("Booking Berhasil!");
      queryClient.invalidateQueries(["my-bookings"]);
      navigate("/my-bookings");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Booking gagal.")
  });

  const handleCheckout = () => {
    if (!user) return toast.error("Silakan login terlebih dahulu");
    if (selectedSlots.length === 0) return toast.error("Pilih minimal satu jam");
    checkoutMutation.mutate({ field_id: id, slots: selectedSlots });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] antialiased font-sans">
      <Navbar />
      
      {/* 1. COMPACT PRO HEADER */}
      <div className="bg-slate-900 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} />
        <div className="absolute -bottom-10 -left-10 select-none pointer-events-none opacity-[0.02] hidden md:block">
           <h2 className="text-[12rem] font-black text-white italic leading-none uppercase tracking-tighter">{fieldName.split(' ')[0]}</h2>
        </div>

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/30 hover:text-primary mb-6 font-black text-[9px] uppercase tracking-[0.4em] transition-all">
            <ChevronLeft size={14}/> Back to Explore
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-2 border-primary/30 pl-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-slate-900 px-2 py-0.5 rounded-sm font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={10}/> Premium Court
                </span>
                <div className="flex text-yellow-500"><Star size={10} fill="currentColor" /></div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{fieldName}</h1>
              <p className="text-white/40 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest mt-4">
                <MapPin size={12} className="text-primary" /> {venueName}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-right hidden md:block">
              <p className="text-white/30 font-black text-[8px] uppercase tracking-widest mb-1">Price per Hour</p>
              <p className="text-3xl font-black text-primary italic leading-none">Rp {fieldPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-20 -mt-12 relative z-30 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            {/* DATE PICKER */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
               <div className="flex items-center gap-3 mb-4 px-2">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Play Date</span>
               </div>
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {dateOptions.map((date) => (
                  <button
                    key={date.full}
                    onClick={() => { setSelectedDate(date.full); setSelectedSlots([]); }}
                    className={`flex flex-col items-center min-w-[90px] py-6 rounded-[1.8rem] border-2 transition-all duration-300
                      ${selectedDate === date.full 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg -translate-y-1 scale-105" 
                        : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
                  >
                    <span className="text-[9px] font-black uppercase mb-1 opacity-50">{date.dayName}</span>
                    <span className="text-2xl font-black italic">{date.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SESSION GRID */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white relative min-h-[400px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Choose Session</h3>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {['all', 'morning', 'afternoon', 'night'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all
                        ${activeFilter === filter ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              {isFetching && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-[2.5rem]">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredSchedules.map((slot) => {
                    const isSelected = selectedSlots.some(s => s.id === slot.id);
                    const isBooked = slot.status !== "available";
                    
                    const now = new Date();
                    const isToday = selectedDate === now.toLocaleDateString('sv-SE');
                    const [startHour] = slot.start_time.split(':');
                    const isPast = isToday && parseInt(startHour) <= now.getHours();
                    const isDisabled = isBooked || isPast;

                    return (
                      <motion.button
                        layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        key={slot.id}
                        disabled={isDisabled}
                        onClick={() => handleToggleSlot(slot)}
                        className={`py-7 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden
                          ${isPast 
                            ? "bg-slate-50 border-slate-50 opacity-10 grayscale cursor-not-allowed" 
                            : isBooked
                              ? "bg-red-50/50 border-red-100 text-red-300 opacity-40 cursor-not-allowed" 
                              : isSelected 
                                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/30 -translate-y-2 z-10 scale-105" // ✅ FULL HITAM SAAT DIPILIH
                                : "bg-white border-primary/20 text-slate-900 shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1" 
                          }`}
                      >
                        <span className={`text-2xl font-black italic leading-none mb-1 ${isSelected ? "text-white" : !isDisabled ? "text-slate-900" : ""}`}>
                          {slot.start_time}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? "text-primary font-black" : isBooked ? "text-red-400" : isPast ? "text-slate-400" : "text-primary"}`}>
                          {isPast ? 'Past' : isBooked ? 'Full' : isSelected ? 'Selected' : 'Book'}
                        </span>

                        {!isDisabled && !isSelected && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-primary" /> My Booking
              </h4>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10">
                  <span className="text-white/40 font-black uppercase text-[9px] tracking-widest text-left">Selected<br/>Sessions</span>
                  <span className="font-black italic text-3xl text-primary leading-none">{selectedSlots.length} <span className="text-[10px] not-italic text-white">Hr</span></span>
                </div>
                
                <div className="p-4 text-center">
                   <p className="text-white/40 font-black uppercase text-[9px] mb-2 tracking-widest">Total Amount</p>
                   <p className="text-5xl font-black text-white italic tracking-tighter">
                      <span className="text-primary text-xs not-italic mr-1">IDR</span>
                      {(selectedSlots.length * fieldPrice).toLocaleString()}
                   </p>
                </div>
              </div>

              {/* ✅ IMPROVED BUTTON: FIX HILANG SAAT CHOOSE JADWAL */}
              <motion.button
                whileHover={selectedSlots.length > 0 ? { scale: 1.02 } : {}} 
                whileTap={selectedSlots.length > 0 ? { scale: 0.98 } : {}}
                disabled={selectedSlots.length === 0 || checkoutMutation.isPending}
                onClick={handleCheckout}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-500 italic text-[11px] shadow-xl flex items-center justify-center gap-3
                  ${selectedSlots.length > 0 
                    ? "bg-amber-500 text-slate-900 shadow-amber-500/20 opacity-100 scale-100" // Gunakan warna spesifik amber-500
                    : "bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed scale-95"
                  }`}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Confirming...
                  </>
                ) : (
                  <>
                    {/* Ikon diganti ke ShieldCheck agar lebih 'Wealthy' dan stabil */}
                    {selectedSlots.length > 0 && <ShieldCheck size={14} fill="currentColor" />} 
                    {selectedSlots.length > 0 ? "Authorize Transaction" : "Checkout Now"}
                  </>
                )}
              </motion.button>
              
              <p className="text-center text-[8px] text-white/20 font-bold uppercase mt-6 tracking-widest px-4">
                No hidden fees • Instant Confirmation
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}