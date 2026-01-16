import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  ArrowLeft, Calendar, Clock, Receipt, 
  Wallet, Info, CheckCircle2, AlertCircle,
  MapPin, CreditCard, Hash,
  Fingerprint, Sparkles, ReceiptText, Timer
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const BookingDetail = () => {
  const { code } = useParams(); 
  const navigate = useNavigate();

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["booking", code],
    queryFn: () => userBookingService.getBookingById(code),
    enabled: !!code,
    retry: 1
  });

  const booking = useMemo(() => {
    if (!rawData) return null;
    return Array.isArray(rawData) ? rawData.find(b => b.booking_code === code) || rawData[0] : rawData;
  }, [rawData, code]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);

  const formatDateFull = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(date);
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
  };

  if (isLoading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
        <Hash className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
      </div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Retrieving Secure Data...</p>
    </div>
  );

  if (isError || !booking) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={48} className="text-rose-500" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 italic uppercase">Expired Link</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-xs">The booking session you're looking for has been moved or deleted.</p>
      <button onClick={() => navigate("/my-bookings")} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-transform active:scale-95">Go Back Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-600">
      <Toaster position="top-center" />
      <Navbar />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="container mx-auto px-4 lg:px-0 max-w-6xl py-32 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => navigate("/my-bookings")}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] transition-all group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to History
            </button>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
              Order <span className="text-indigo-600">Details</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-full border border-slate-200 shadow-sm">
            <StatusBadge status={booking.payment_status} />
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-400">
               <Fingerprint size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Secured</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: BOOKING INFO */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* INVOICE CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <ReceiptText size={200} />
              </div>

              <div className="flex flex-col md:flex-row justify-between border-b border-slate-100 pb-10 mb-10 gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                    <Sparkles size={12} /> Official Pass
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                    #{booking.booking_code}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-2 italic">
                    <Calendar size={14} /> Issued on {formatDateFull(booking.created_at)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end justify-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Total Transaction</p>
                   <div className="text-4xl font-black text-indigo-600 italic tracking-tighter">{formatRupiah(booking.total_amount)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoBox icon={<Wallet />} label="Method" value="Bank Transfer" color="indigo" />
                <InfoBox icon={<Clock />} label="Expiry" value={booking.expired_at ? formatTimeOnly(booking.expired_at) + " WIB" : "-"} color="amber" />
                <InfoBox icon={<CheckCircle2 />} label="Verif" value={booking.payment_status === 'paid' || booking.payment_status === 'success' ? 'Verified' : 'Process'} color="emerald" />
              </div>
            </motion.div>

            {/* TICKETS SECTION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] italic">Tickets ({booking.items?.length})</h3>
                <div className="h-px flex-1 bg-slate-200 mx-6"></div>
              </div>

              <div className="grid gap-4">
                {booking.items?.map((item, idx) => (
                  <motion.div 
                    key={item.id || idx}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="relative group flex flex-col md:flex-row bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-indigo-400 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50"
                  >
                    <div className="w-full md:w-48 h-32 md:h-auto bg-slate-900 relative flex flex-col items-center justify-center p-6 text-white overflow-hidden shrink-0">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border-r border-slate-200"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-200"></div>
                      <MapPin className="text-indigo-400 mb-2 opacity-50" size={30} />
                      <span className="text-[10px] font-black tracking-[0.2em] text-indigo-300 italic uppercase">Section {idx + 1}</span>
                    </div>

                    <div className="flex-grow p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.schedule?.field?.name}</p>
                        <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                          {item.schedule?.field?.venue?.name}
                        </h4>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-[11px] font-bold text-slate-400 italic mt-2">
                           <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateFull(item.schedule?.start_time).split(',')[1]}</span>
                           <span className="flex items-center gap-1"><Clock size={12} /> {formatTimeOnly(item.schedule?.start_time)}</span>
                        </div>
                      </div>

                      <div className="text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Sub-Total</p>
                        <p className="text-xl font-black text-slate-900 italic leading-none">{formatRupiah(item.price)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
              
              <h3 className="font-black text-2xl mb-10 italic flex items-center gap-4">
                <Receipt className="text-indigo-400" size={24} /> Payment
              </h3>
              
              <div className="space-y-10 relative">
                <div className="absolute left-4 top-1 bottom-1 w-[1px] bg-white/10"></div>
                
                {[
                  { n: 1, t: "Transfer Amount", d: "BCA 123-456-789 (SportCenter)" },
                  { n: 2, t: "Capture Receipt", d: "Clear photo of your transfer" },
                  { n: 3, t: "Fast Review", d: "Auto-verified in 5-15 mins" }
                ].map((step) => (
                  <div className="flex gap-6 relative z-10" key={step.n}>
                    <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-black shrink-0 text-xs border-[4px] border-slate-800 shadow-lg shadow-black">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic tracking-wider text-white">{step.t}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* KONDISI TOMBOL BERDASARKAN STATUS */}
              {booking.payment_status === "unpaid" ? (
                <button
                  onClick={() => navigate(`/upload-payment/${booking.booking_code}`)}
                  className="group w-full mt-12 bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-slate-900 transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-3 italic"
                >
                  <CreditCard size={18} className="group-hover:rotate-12 transition-transform" /> 
                  Upload Receipt
                </button>
              ) : booking.payment_status === "pending" ? (
                <div className="mt-12 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] text-center backdrop-blur-md flex flex-col items-center gap-4 overflow-hidden relative group">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-indigo-500/20 rounded-full animate-ping absolute"></div>
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                       <Timer size={20} className="text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Status: Pending</p>
                    <p className="text-sm font-black text-white italic leading-tight uppercase">
                      Awaiting Confirmation
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed px-4">
                      Our admin is validating your receipt. Please check back shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-12 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center backdrop-blur-md flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                     <CheckCircle2 size={24} className="text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">Verified</p>
                    <p className="text-sm font-black text-white italic uppercase">Access Granted</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col gap-4 shadow-sm">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Info size={24} />
               </div>
               <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase italic tracking-widest text-slate-900">Need Assistance?</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                    Problems with payment? Message our 24/7 concierge at <span className="text-indigo-600 underline">@sportcenter_help</span>
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 opacity-30">
        <div className="border-t border-slate-200 pt-8 text-center">
           <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-400 italic">Official SportCenter Digital Invoice</p>
        </div>
      </div>
    </div>
  );
};

// UI Components
const InfoBox = ({ icon, label, value, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <div className={`p-5 rounded-[2rem] border ${colors[color]} space-y-3 transition-transform hover:-translate-y-1`}>
      <div className="opacity-70">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 italic">{label}</p>
        <p className="text-[11px] font-black truncate uppercase tracking-tighter italic">{value}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    unpaid: "bg-rose-50 text-rose-600 border-rose-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border italic ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      {status === 'pending' ? 'Awaiting Confirmation' : status}
    </div>
  );
};

export default BookingDetail;