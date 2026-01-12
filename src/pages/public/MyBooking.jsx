import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  Trophy, MapPin, ChevronRight, 
  Inbox, Loader2, CalendarDays, Ticket, Zap
} from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["user", "bookings"],
    queryFn: userBookingService.getMyBookings,
  });

  const filteredBookings = Array.isArray(bookings) ? bookings.filter((b) =>
    filter === "all" ? true : b.payment_status === filter
  ) : [];

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  if (isLoading)
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#ccff00]" size={40} />
        <p className="text-gray-500 font-black tracking-widest text-[10px] uppercase italic">Retrieving your passes...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <div className="container mx-auto px-6 lg:px-40 py-24">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="h-px w-8 bg-[#ccff00]"></span>
               <span className="text-[#ccff00] font-black text-[10px] uppercase tracking-[0.5em]">Activity Center</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              My <span className="text-[#ccff00]">Bookings</span>
            </h1>
          </div>

          {/* FILTER - ULTRA ROUNDED */}
          <div className="flex bg-[#111] p-1.5 rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
            {["all", "unpaid", "pending", "paid", "expired"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-[#ccff00] text-black shadow-[0_10px_20px_rgba(204,255,0,0.1)]"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {f === 'all' ? 'Everything' : f}
              </button>
            ))}
          </div>
        </div>

        {/* LIST CARDS */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={b.id}
                  onClick={() => navigate(`/bookings/${b.booking_code}`)}
                  className="group bg-[#0f0f0f] border border-white/5 rounded-[3rem] p-8 hover:border-[#ccff00]/30 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Decorative Zap Background */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Ticket size={120} />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                      {/* Icon Status */}
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border 
                        ${b.payment_status === 'paid' ? 'bg-[#ccff00]/10 border-[#ccff00]/20 text-[#ccff00]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        <Trophy size={28} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest italic">#{b.booking_code}</span>
                          <StatusPill status={b.payment_status} />
                        </div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
                          {b.items[0]?.schedule?.field?.venue?.name || "Premium Arena"}
                        </h3>
                        <div className="flex flex-wrap gap-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#ccff00]" />
                            {b.items[0]?.schedule?.field?.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={12} className="text-[#ccff00]" />
                            {b.items.length} Session(s)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-6 md:pt-0 border-t md:border-none border-white/5">
                      <div className="md:text-right">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-2xl font-black italic tracking-tighter text-white">{formatRupiah(b.total_amount)}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        {b.payment_status === "unpaid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/upload-payment/${b.booking_code}`);
                            }}
                            className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] transition-all shadow-xl active:scale-95"
                          >
                            Upload Proof
                          </button>
                        )}
                        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-700 group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-[4rem] border border-dashed border-white/10">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-800 mb-6">
                  <Inbox size={48} />
                </div>
                <h3 className="text-white font-black italic uppercase tracking-widest">No Records Found</h3>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-2">Time to hit the court and make your first move!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- STATUS PILL ---
const StatusPill = ({ status }) => {
  const styles = {
    unpaid: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    pending: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    paid: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20",
    expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
};

export default MyBookings;