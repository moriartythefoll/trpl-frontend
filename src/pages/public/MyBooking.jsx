import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  Trophy, Inbox, Zap, ArrowRight, Clock, CheckCircle2, 
  ChevronLeft, AlertTriangle, Loader2, Calendar, 
  MapPin, Ticket, Search, Filter
} from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: response, isLoading } = useQuery({
    queryKey: ["user", "bookings"],
    queryFn: userBookingService.getMyBookings,
    refetchInterval: 5000, 
  });

  const bookings = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const isPaid = b.payment_status === "paid";
      const isExpired = b.payment_status === "expired" || (b.payment_status === "unpaid" && b.expired_at && new Date(b.expired_at) < currentTime);
      const isCancelled = b.payment_status === "cancelled";
      const isPending = b.payment_status === "pending";
      const items = b.items || [];
      const isTimeFinished = items.some(item => item.schedule?.end_time && new Date(item.schedule.end_time) < currentTime);

      if (filter === "all") return true;
      if (filter === "unpaid") return b.payment_status === "unpaid" && !isExpired;
      if (filter === "active") return (isPaid || isPending) && !isTimeFinished;
      if (filter === "history") return isPaid && isTimeFinished;
      if (filter === "failed") return isExpired || isCancelled;
      return false;
    });
  }, [bookings, filter, currentTime]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);

  if (isLoading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
        <Ticket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={16} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Passes...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#FDFDFD] font-sans overflow-hidden flex flex-col relative">
      <Navbar />

      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />

      <main className="flex-1 container mx-auto px-6 lg:px-24 pt-28 pb-6 flex flex-col min-h-0">
        
        {/* HEADER AREA */}
        <div className="shrink-0 mb-10">
          <button onClick={() => navigate("/")} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 transition-all font-black uppercase text-[9px] tracking-[0.3em]">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-1">
              <h1 className="text-6xl font-black italic tracking-[ -0.05em] uppercase text-slate-900 leading-[0.8]">
                MY <span className="text-indigo-600">PASSES</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                <Search size={12} /> Managed Secure Transactions
              </p>
            </div>

            {/* Tabs Filter */}
            <div className="bg-slate-100/50 p-1.5 rounded-[2rem] border border-slate-200 backdrop-blur-sm overflow-x-auto no-scrollbar">
              <div className="flex relative">
                {["all", "unpaid", "active", "history", "failed"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className="relative px-6 py-2.5 rounded-full transition-all shrink-0">
                    {filter === f && (
                      <motion.div layoutId="activeTab" className="absolute inset-0 bg-white shadow-md border border-slate-100" style={{ borderRadius: '9999px' }} />
                    )}
                    <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest ${filter === f ? "text-indigo-600" : "text-slate-400"}`}>
                      {f === "failed" ? "Expired" : f}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-5 pb-10">
            <AnimatePresence mode="popLayout">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isExpired = b.payment_status === "expired" || (b.payment_status === "unpaid" && b.expired_at && new Date(b.expired_at) < currentTime);
                  const isPaid = b.payment_status === "paid";
                  const isPending = b.payment_status === "pending";
                  const items = b.items || [];
                  const isFinished = isPaid && items.some(item => item.schedule?.end_time && new Date(item.schedule.end_time) < currentTime);
                  const showTimer = b.payment_status === "unpaid" && !isExpired;

                  return (
                    <motion.div
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      onClick={() => navigate(`/bookings/${b.booking_code}`)}
                      className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500
                        ${isExpired && !isPaid && !isPending ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50'}`}
                    >
                      {/* Ticket Notch Effect */}
                      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#FDFDFD] border border-slate-100 rounded-full hidden md:block"></div>
                      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#FDFDFD] border border-slate-100 rounded-full hidden md:block"></div>

                      <div className="flex flex-col md:flex-row items-stretch min-h-[140px]">
                        {/* Status Section */}
                        <div className={`w-full md:w-32 flex flex-col items-center justify-center p-6 gap-3 shrink-0
                          ${isFinished ? 'bg-emerald-50 text-emerald-600' : 
                            isPaid ? 'bg-indigo-600 text-white shadow-inner' : 
                            isPending ? 'bg-amber-50 text-amber-600' :
                            isExpired ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-500'}`}>
                          
                          <div className="relative">
                            {isFinished ? <CheckCircle2 size={32} /> : 
                             isPending ? <Loader2 size={32} className="animate-spin" /> :
                             isExpired ? <AlertTriangle size={32} /> : <Trophy size={32} />}
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">
                            {isFinished ? 'Finished' : b.payment_status}
                          </span>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">#{b.booking_code}</span>
                              {showTimer && <CountdownTimer expiryDate={b.expired_at} />}
                            </div>
                            
                            <div className="space-y-1">
                               <h3 className={`text-3xl font-black italic uppercase tracking-tighter leading-none ${isExpired && !isPaid ? 'text-slate-400' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>
                                 {items[0]?.schedule?.field?.venue?.name || "Premium Arena"}
                               </h3>
                               <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase italic">
                                  <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" /> {items[0]?.schedule?.field?.name || "All Fields"}</span>
                                  <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-400" /> {items.length} Sessions</span>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                             <div className="md:text-right">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Total Bill</p>
                               <p className={`text-3xl font-black italic tracking-tighter ${isExpired && !isPaid ? 'text-slate-400' : 'text-slate-900'}`}>{formatRupiah(b.total_amount)}</p>
                             </div>
                             
                             <div className="md:mt-4">
                               {showTimer ? (
                                 <button className="bg-rose-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-rose-200 flex items-center gap-2 italic active:scale-95">
                                   <Zap size={14} fill="currentColor" /> Finish Pay
                                 </button>
                               ) : (
                                 <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all">
                                   <ArrowRight size={20} />
                                 </div>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                    <Inbox size={40} />
                  </div>
                  <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] italic">No Passes in this category</h3>
                  <button onClick={() => setFilter("all")} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-200">Show All Records</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #indigo-200; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

const CountdownTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calculate = () => {
      const diff = new Date(expiryDate) - new Date();
      if (diff <= 0) return setTimeLeft("EXPIRED");
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}M ${s}S`);
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div className="flex items-center gap-2 font-black text-[9px] uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 italic">
      <Clock size={12} className="animate-pulse" /> Time Left: {timeLeft}
    </div>
  );
};

export default MyBookings;