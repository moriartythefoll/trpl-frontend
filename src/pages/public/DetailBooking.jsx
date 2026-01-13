import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  ArrowLeft, Calendar, Clock, Receipt, 
  Wallet, Info, CheckCircle2, AlertCircle,
  MapPin, ChevronRight, CreditCard
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

  // Handle data array dari API
  const booking = useMemo(() => {
    if (!rawData) return null;
    const data = Array.isArray(rawData) ? rawData.find(b => b.booking_code === code) || rawData[0] : rawData;
    return data;
  }, [rawData, code]);

  // =======================
  // UTILS & FORMATTERS
  // =======================
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
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Data...</p>
    </div>
  );

  if (isError || !booking) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <AlertCircle size={48} className="text-rose-500 mb-4" />
      <h2 className="text-2xl font-black text-slate-900">Pesanan Tidak Ditemukan</h2>
      <p className="text-slate-500 text-sm mb-6">Kode booking <span className="font-bold text-slate-800">{code}</span> mungkin sudah kedaluwarsa.</p>
      <button onClick={() => navigate("/my-bookings")} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm">Kembali ke Riwayat</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 font-sans">
      <Toaster position="top-center" />
      <Navbar />

      <div className="container mx-auto px-4 lg:px-0 max-w-6xl py-24">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/my-bookings")}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={16} /> Back to History
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase italic">Status:</span>
            <StatusBadge status={booking.payment_status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTENT (8 COL) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* MAIN INFO CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-dashed border-slate-200 pb-8 mb-8 gap-4">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">#{booking.booking_code}</h1>
                  <p className="text-slate-400 text-xs font-bold mt-1">Dipesan pada {formatDateFull(booking.created_at)}</p>
                </div>
                <div className="bg-indigo-600 px-6 py-4 rounded-[1.5rem] text-white text-right shadow-lg shadow-indigo-100">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">Total Bill</p>
                  <p className="text-2xl font-black italic leading-none">{formatRupiah(booking.total_amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem icon={<Wallet className="text-indigo-500" />} label="Payment" value="Bank Transfer" />
                <InfoItem icon={<Clock className="text-amber-500" />} label="Expired At" value={booking.expired_at ? formatTimeOnly(booking.expired_at) + " WIB" : "-"} />
                <InfoItem icon={<CheckCircle2 className="text-emerald-500" />} label="Verification" value={booking.payment_status === 'paid' ? 'Completed' : 'Awaiting'} />
              </div>
            </motion.div>

            {/* SCHEDULE LIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4">
                <div className="h-[2px] w-8 bg-indigo-600"></div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Booked Schedules ({booking.items?.length})</h3>
              </div>

              {booking.items?.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  key={item.id || idx}
                  className="group bg-white rounded-[2rem] border border-slate-100 p-2 pr-8 flex flex-col md:flex-row items-center gap-6 hover:border-indigo-200 transition-all shadow-sm"
                >
                  {/* Venue Image Placeholder or Icon */}
                  <div className="w-full md:w-32 h-24 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-300 transition-colors shrink-0">
                     <MapPin size={32} />
                  </div>

                  <div className="flex-grow space-y-1 text-center md:text-left">
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{item.schedule?.field?.venue?.name}</h4>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1"><ChevronRight size={14} className="text-indigo-500"/> {item.schedule?.field?.name}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} className="text-indigo-500"/> {formatDateFull(item.schedule?.start_time).split(',')[1]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Duration</p>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <Clock size={12} className="text-indigo-500"/>
                        <span className="text-[11px] font-black text-slate-700">{formatTimeOnly(item.schedule?.start_time)} - {formatTimeOnly(item.schedule?.end_time)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Subtotal</p>
                      <p className="text-sm font-black text-indigo-600 italic">{formatRupiah(item.price)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT (4 COL) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
              <h3 className="font-black text-xl mb-8 italic flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl text-slate-900"><Receipt size={20} /></div>
                Payment Step
              </h3>
              
              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10 ml-[-0.5px]"></div>
                
                {[
                  { n: 1, t: "Transfer Total Bill", d: "BCA 123-456-789 a/n SportCenter" },
                  { n: 2, t: "Capture Receipt", d: "Take a clear photo of your proof" },
                  { n: 3, t: "Submit for Review", d: "Our admin will check in 10 mins" }
                ].map((step) => (
                  <div className="flex gap-6 relative z-10" key={step.n}>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 text-xs border-4 border-slate-900">
                      {step.n}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-wide">{step.t}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {booking.payment_status === "unpaid" ? (
                <button
                  onClick={() => navigate(`/upload-payment/${booking.booking_code}`)}
                  className="w-full mt-10 bg-white text-slate-900 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Upload Proof Now
                </button>
              ) : (
                <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status Update</p>
                   <p className="text-sm font-bold text-emerald-400 mt-2">
                     {booking.payment_status === 'pending' ? 'Checking your payment...' : 'Transaction Completed!'}
                   </p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
              <Info className="text-indigo-500 shrink-0" size={20} />
              <p className="text-[11px] text-indigo-900/60 leading-relaxed font-bold">
                Need help? Contact our support at <span className="text-indigo-900">@sportcenter_support</span> for fast response.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-white border border-slate-50 rounded-2xl">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-black text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    unpaid: "bg-rose-50 text-rose-600 border-rose-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      {status}
    </span>
  );
};

export default BookingDetail;