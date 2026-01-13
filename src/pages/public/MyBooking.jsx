import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  Trophy, MapPin, Inbox, CalendarDays, Ticket, Zap, ArrowRight, Clock, CheckCircle2, ChevronLeft, XCircle, AlertTriangle 
} from "lucide-react";

// --- ANIMASI SUPER CEPAT ---
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update waktu setiap detik untuk trigger auto-expiry di UI
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["user", "bookings"],
    queryFn: userBookingService.getMyBookings,
    refetchInterval: 5000, // Ambil data tiap 5 detik agar sinkron dengan BE
  });

  // --- LOGIKA FILTER DENGAN AUTO-EXPIRED CHECK ---
  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    return bookings.filter((b) => {
      const isPaid = b.payment_status === "paid";
      const isExpired = b.payment_status === "expired" || (b.payment_status === "unpaid" && new Date(b.expired_at) < currentTime);
      const isCancelled = b.payment_status === "cancelled";
      const isTimeFinished = b.items.some(item => new Date(item.schedule?.end_time) < currentTime);

      if (filter === "all") return true;
      if (filter === "unpaid") return b.payment_status === "unpaid" && !isExpired;
      if (filter === "active") return isPaid && !isTimeFinished;
      if (filter === "history") return isPaid && isTimeFinished;
      if (filter === "failed") return isExpired || isCancelled;
      
      return false;
    });
  }, [bookings, filter, currentTime]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);

  if (isLoading) return <div className="h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <Navbar />

      <div className="container mx-auto px-6 lg:px-40 py-24">
        {/* BACK BUTTON */}
        <button onClick={() => navigate("/")} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-10 transition-all font-black uppercase text-[10px] tracking-widest">
          <ChevronLeft size={16} /> Return to Arena
        </button>

        {/* HEADER & FILTER */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-16 gap-10">
          <div>
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
              My <span className="text-indigo-600">Passes</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-2 ml-1">Official Booking Records</p>
          </div>

          <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-xl overflow-x-auto no-scrollbar">
            <div className="flex relative min-w-max">
              {["all", "unpaid", "active", "history", "failed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="relative px-7 py-3 rounded-full transition-all">
                  {filter === f && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-indigo-600 shadow-lg" style={{ borderRadius: '9999px' }} />
                  )}
                  <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest ${filter === f ? "text-white" : "text-slate-400"}`}>
                    {f === "failed" ? "Expired/Cancel" : f}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LIST CARDS */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => {
                const isExpired = new Date(b.expired_at) < currentTime;
                const isPaid = b.payment_status === "paid";
                const isFinished = isPaid && b.items.some(item => new Date(item.schedule?.end_time) < currentTime);
                const showTimer = b.payment_status === "unpaid" && !isExpired;

                return (
                  <motion.div
                    key={b.id}
                    layout
                    variants={itemVariants}
                    onClick={() => navigate(`/bookings/${b.booking_code}`)}
                    initial="initial" animate="animate" exit="exit"
                    className={`relative border-2 cursor-pointer rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 overflow-hidden
                      ${(isExpired && !isPaid) || b.payment_status === 'cancelled' 
                        ? 'bg-slate-50 border-slate-100 opacity-60' 
                        : 'bg-white border-transparent shadow-xl shadow-slate-200/50'}`}
                  >
                    {/* WATERMARK STATUS */}
                    {isExpired && !isPaid && (
                      <div className="absolute top-10 right-10 rotate-12 opacity-10 pointer-events-none">
                        <XCircle size={150} />
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                      <div className="flex items-center gap-6 md:gap-8 w-full">
                        {/* STATUS ICON */}
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 border-4 
                          ${isFinished ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                            isPaid ? 'bg-indigo-600 border-indigo-500 text-white' : 
                            isExpired ? 'bg-slate-200 border-slate-300 text-slate-400' : 
                            'bg-rose-50 border-rose-100 text-rose-500'}`}>
                          {isFinished ? <CheckCircle2 size={36} /> : isExpired ? <AlertTriangle size={36} /> : <Trophy size={36} />}
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full italic">#{b.booking_code}</span>
                            <StatusPill status={isFinished ? 'completed' : (isExpired && !isPaid ? 'expired' : b.payment_status)} />
                          </div>
                          
                          {showTimer && <CountdownTimer expiryDate={b.expired_at} />}
                          {isExpired && !isPaid && <p className="text-[10px] text-rose-500 font-black uppercase italic tracking-widest">Time Out: Slot Released</p>}

                          <h3 className={`text-3xl md:text-4xl font-black italic uppercase tracking-tighter ${isExpired && !isPaid ? 'text-slate-400' : 'text-slate-900'}`}>
                            {b.items[0]?.schedule?.field?.venue?.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-6 md:pt-0 border-t md:border-none border-slate-100">
                        <div className="md:text-right">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Total Amount</p>
                          <p className={`text-3xl md:text-4xl font-black italic tracking-tighter ${isExpired && !isPaid ? 'text-slate-400' : 'text-slate-900'}`}>{formatRupiah(b.total_amount)}</p>
                        </div>
                        
                        <div className="mt-6">
                          {showTimer ? (
                            <button onClick={() => navigate(`/upload-payment/${b.booking_code}`)}
                              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-indigo-200 flex items-center gap-2">
                              <Zap size={14} fill="currentColor" /> Pay Now
                            </button>
                          ) : (
                            !isExpired && !isPaid && b.payment_status !== 'cancelled' && (
                              <div className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center text-slate-300">
                                <ArrowRight size={24} />
                              </div>
                            )
                          )}
                          {(isExpired && !isPaid) && (
                            <button onClick={() => navigate('/')} className="text-[10px] font-black uppercase text-indigo-600 underline tracking-tighter">Re-book Field</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Inbox size={50} className="text-slate-200 mb-4" />
                <h3 className="text-slate-400 font-black uppercase tracking-widest text-[12px]">No Passes Found</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// --- KOMPONEN TIMER SANGAT AKURAT ---
const CountdownTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(expiryDate) - new Date();
      if (diff <= 0) return setTimeLeft("0m 0s");
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div className="flex items-center gap-2 font-black text-[11px] uppercase text-rose-600 animate-pulse">
      <Clock size={14} /> Finish Payment in: {timeLeft}
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    unpaid: "bg-rose-50 text-rose-500 border-rose-100",
    paid: "bg-indigo-50 text-indigo-600 border-indigo-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    expired: "bg-slate-200 text-slate-500 border-slate-300",
    cancelled: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>{status}</span>;
};

export default MyBookings;