import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  Trophy, Clock, MapPin, ChevronRight, 
  CreditCard, Inbox, Loader2, CalendarDays
} from "lucide-react";

// ... (import tetap sama)

const MyBookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["user", "bookings"],
    queryFn: userBookingService.getMyBookings,
  });

  const filteredBookings = bookings.filter((b) =>
    filter === "all" ? true : b.payment_status === filter
  );

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  if (isLoading)
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-400 font-bold tracking-tight text-sm">Menyiapkan jadwal Anda...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <Navbar />

      <div className="container mx-auto px-6 lg:px-40 py-24">
        {/* HEADER SECTION (tetap sama) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Riwayat <span className="text-emerald-600">Booking</span>
            </h1>
            <p className="text-slate-500 font-medium">Kelola jadwal dan pembayaran lapangan Anda.</p>
          </div>

          <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {["all", "unpaid", "pending", "paid", "expired"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f === 'all' ? 'Semua' : f}
              </button>
            ))}
          </div>
        </div>

        {/* LIST CARDS */}
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.05 }}
                  key={b.id}
                  // FIX: Ganti b.id menjadi b.booking_code
                  onClick={() => navigate(`/bookings/${b.booking_code}`)}
                  className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <Trophy size={26} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{b.booking_code}</span>
                          <StatusPill status={b.payment_status} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                          {b.items[0]?.schedule?.field?.venue?.name || "Lapangan Olahraga"}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-emerald-500" />
                            {b.items[0]?.schedule?.field?.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays size={14} className="text-emerald-500" />
                            {b.items.length} Sesi
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-slate-100">
                      <div className="md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Bayar</p>
                        <p className="text-xl font-black text-slate-900">{formatRupiah(b.total_amount)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {b.payment_status === "unpaid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/upload-payment/${b.booking_code}`);
                            }}
                            className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                          >
                            Bayar Sekarang
                          </button>
                        )}
                        <div className="hidden md:flex w-10 h-10 rounded-full border border-slate-100 items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                  <Inbox size={40} />
                </div>
                <h3 className="text-slate-900 font-bold">Belum ada pesanan</h3>
                <p className="text-sm text-slate-400">Ayo mulai olahraga dan booking lapangan pertama Anda!</p>
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
    unpaid: "bg-orange-50 text-orange-600",
    pending: "bg-blue-50 text-blue-600",
    paid: "bg-emerald-50 text-emerald-600",
    expired: "bg-slate-100 text-slate-400",
    rejected: "bg-rose-50 text-rose-600",
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
};

export default MyBookings;