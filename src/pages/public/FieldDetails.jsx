import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/axios";
import { createBooking } from "../../services/user/booking.service"; 
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import Navbar from "../../components/public/Navbar";
import { 
  LucideCalendar, Clock, MapPin, 
  ChevronLeft, ShieldCheck, Activity, Info, ChevronRight, Loader2
} from "lucide-react";

export default function FieldDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSlots, setSelectedSlots] = useState([]);

  const { data: scheduleResponse, isLoading } = useQuery({
    queryKey: ["field-schedules", id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/explore/fields/${id}/schedules?date=${today}`);
      return res.data; 
    },
  });

  const schedules = scheduleResponse?.data || [];
  const fieldFromDB = schedules.length > 0 ? schedules[0] : null;
  const fieldName = fieldFromDB?.field?.name || "Premium Arena";
  const venueName = fieldFromDB?.field?.venue?.name || "Elite Sport Center";
  const fieldPrice = fieldFromDB?.price || 0;

  const checkoutMutation = useMutation({
    mutationFn: createBooking,
    onMutate: () => {
      // Aba-aba: Beritahu user proses sinkronisasi dimulai
      toast.loading("Securing your sessions...", { id: "checkout-status" });
    },
    onSuccess: () => {
      // Aba-aba: Berhasil dengan gaya Amazing Custom
      toast.success("Victory! Booking Secured", { 
        id: "checkout-status",
        duration: 3000 
      });
      setTimeout(() => navigate("/my-bookings"), 1500);
    },
    onError: (err) => {
      // Aba-aba: Gagal
      toast.error(err.response?.data?.message || "Booking failed. Try again.", { id: "checkout-status" });
    }
  });

  const handleToggleSlot = (slotId) => {
    setSelectedSlots((prev) => {
      const isSelecting = !prev.includes(slotId);
      
      // ABA-ABA INSTAN SAAT KLIK JADWAL
      if (isSelecting) {
        toast.success("Session added", {
          id: `slot-${slotId}`, // Unik per slot atau pakai ID statis jika gamau numpuk
          duration: 1000,
          icon: '⚡',
        });
        return [...prev, slotId];
      } else {
        toast("Session removed", {
          id: `slot-${slotId}`,
          duration: 1000,
          icon: '🗑️',
        });
        return prev.filter((s) => s !== slotId);
      }
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-20 h-20 bg-[#ccff00] rounded-full blur-3xl absolute"
      />
      <div className="w-12 h-12 border-4 border-white/10 border-t-[#ccff00] rounded-full animate-spin relative z-10"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 selection:bg-[#ccff00] selection:text-black">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <div className="container mx-auto px-6 pt-10">
        <div className="relative group overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-[#0f0f0f] border border-white/5 p-8 md:p-16">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={300} strokeWidth={1} />
          </div>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.4em] mb-12 hover:text-[#ccff00] transition-colors"
            >
              <ChevronLeft size={14} /> Back to Exploration
            </button>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#ccff00]"></span>
                  <span className="text-[#ccff00] font-black text-[10px] uppercase tracking-[0.5em]">Verified Arena</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-2xl">
                  {fieldName}
                </h1>
                <div className="flex items-center gap-6">
                  <p className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                    <MapPin size={14} className="text-[#ccff00]"/> {venueName}
                  </p>
                  <p className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                    <ShieldCheck size={14} className="text-blue-500"/> Insurance Covered
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 min-w-[200px]">
                <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">Price Per Hour</p>
                <div className="text-4xl font-black italic text-[#ccff00]">
                  Rp {fieldPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 2. SCHEDULE GRID */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0f0f0f] p-8 md:p-12 rounded-[3.5rem] border border-white/5">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
                  <LucideCalendar size={18} className="text-[#ccff00]" /> Pick Your Session
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {schedules.map((slot, index) => {
                    const isBooked = slot.status !== "available";
                    const isSelected = selectedSlots.includes(slot.id);
                    
                    return (
                      <motion.button
                        key={slot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        disabled={isBooked}
                        onClick={() => handleToggleSlot(slot.id)}
                        className={`group relative py-6 px-4 rounded-[2rem] font-black text-[11px] transition-all duration-300 border-2 flex flex-col items-center gap-3
                          ${isBooked ? "bg-black/40 border-transparent text-gray-800 cursor-not-allowed" : 
                          isSelected ? "bg-[#ccff00] border-[#ccff00] text-black shadow-[0_20px_40px_rgba(204,255,0,0.15)] -translate-y-2" : 
                          "bg-[#151515] border-white/5 text-gray-400 hover:border-[#ccff00]/40 hover:text-white"}`}
                      >
                        <Clock size={14} className={isSelected ? "text-black" : "text-[#ccff00]"} />
                        <span className="tracking-widest">{slot.start_time} - {slot.end_time}</span>
                        {isBooked && <div className="absolute inset-0 bg-black/60 rounded-[2rem] flex items-center justify-center backdrop-blur-[2px]"><span className="text-[8px] uppercase tracking-tighter text-white/40">Occupied</span></div>}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Cancellation Policy</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Refund available 24h before match</p>
                    </div>
                </div>
                <ChevronRight className="text-gray-800 hidden md:block" />
            </div>
          </div>

          {/* 3. SIDEBAR SUMMARY */}
          <div className="lg:col-span-1">
            <motion.div 
              layout
              className="bg-[#ccff00] p-10 rounded-[4rem] text-black sticky top-32 shadow-[0_40px_80px_rgba(204,255,0,0.1)] overflow-hidden"
            >
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              
              <h3 className="font-black text-[11px] uppercase tracking-[0.5em] mb-10 opacity-40">Order Review</h3>
              
              <div className="space-y-5 mb-12 relative z-10">
                <div className="flex justify-between items-end border-b border-black/5 pb-5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase opacity-40">Arena Name</p>
                    <p className="font-black uppercase italic text-sm truncate max-w-[150px]">{fieldName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase opacity-40">Sessions</p>
                    <p className="font-black italic text-sm">{selectedSlots.length} HR</p>
                  </div>
                </div>
                
                <div className="pt-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Total Payable</p>
                  <div className="text-5xl font-black italic tracking-tighter leading-none">
                    Rp {(selectedSlots.length * fieldPrice).toLocaleString()}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => checkoutMutation.mutate({ schedule_ids: selectedSlots })}
                disabled={selectedSlots.length === 0 || checkoutMutation.isPending}
                className="group w-full py-7 bg-black text-white rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl disabled:bg-black/20 disabled:text-black/40 transition-all"
              >
                {checkoutMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Syncing...</span>
                  </div>
                ) : (
                  <>Secure My Session <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </motion.button>
              
              <p className="mt-6 text-[8px] font-black uppercase tracking-[0.2em] text-center opacity-30">
                Encrypted Transaction
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}