import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import { 
  ArrowLeft, Calendar, Clock, Receipt, 
  Wallet, Info, CheckCircle2, AlertCircle 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const BookingDetail = () => {
  // 1. Ambil 'code' sesuai dengan yang ada di App.jsx (/bookings/:code)
  const { code } = useParams(); 
  const navigate = useNavigate();

  const { data: booking, isLoading, isError, error } = useQuery({
    // 2. Query key menggunakan code agar data unik per booking_code
    queryKey: ["booking", code],
    queryFn: () => userBookingService.getBookingById(code),
    enabled: !!code, // Hanya jalan jika code ada
    retry: 1
  });

  // Notifikasi Toast jika error
  useEffect(() => {
    if (isError) {
      toast.error("Gagal memuat detail pesanan. Data tidak ditemukan.", {
        id: "error-fetch-detail",
      });
    }
  }, [isError]);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const formatDate = (dateStr) => {
    if(!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Memuat detail pesanan...</p>
      </div>
    </div>
  );

  // Jika error (404), tampilkan UI error yang clean
  if (isError || !booking) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-6">
      <Toaster position="top-center" />
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900">Oops! Data Hilang</h2>
      <p className="text-slate-500 max-w-xs">Pesanan dengan kode <span className="font-bold">{code}</span> tidak ditemukan atau terjadi kesalahan server.</p>
      <button 
        onClick={() => navigate("/my-bookings")} 
        className="mt-4 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
      >
        Cek Riwayat Saya
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      <div className="container mx-auto px-6 lg:px-40 py-24">
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate("/my-bookings")}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Riwayat
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* KIRI: RINGKASAN & STATUS */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Order Transaction</p>
                  <h1 className="text-3xl font-black text-slate-900">#{booking.booking_code}</h1>
                </div>
                <StatusBadge status={booking.payment_status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Pembayaran</p>
                    <p className="text-lg font-black text-emerald-600">{formatRupiah(booking.total_amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dibuat Pada</p>
                    <p className="text-sm font-bold text-slate-700">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LIST ITEMS */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">Jadwal Lapangan</h3>
              {booking.items?.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id}
                  className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.schedule?.field?.venue?.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.schedule?.field?.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase">Tanggal</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(item.schedule?.date)}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase">Waktu</p>
                      <p className="text-xs font-bold text-slate-700">
                        {item.schedule?.start_time?.slice(0,5)} - {item.schedule?.end_time?.slice(0,5)}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase">Harga</p>
                      <p className="text-xs font-black text-emerald-600">{formatRupiah(item.price)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* KANAN: INSTRUKSI & ACTION */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 sticky top-10">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <Receipt size={20} className="text-emerald-400" /> Instruksi Bayar
              </h3>
              
              <div className="space-y-6">
                {[
                  { n: 1, t: "Transfer ke Bank BCA 123456789 a/n Sport Center." },
                  { n: 2, t: "Simpan bukti transfer dalam format JPG/PNG." },
                  { n: 3, t: "Klik tombol upload di bawah untuk verifikasi." }
                ].map((item) => (
                  <div className="flex gap-4" key={item.n}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 text-xs">
                      {item.n}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.t}</p>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              {booking.payment_status === "unpaid" ? (
                <button
                  onClick={() => navigate(`/upload-payment/${booking.booking_code}`)}
                  className="w-full mt-10 bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  Upload Bukti Bayar
                </button>
              ) : booking.payment_status === "pending" ? (
                <div className="mt-10 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col items-center text-center gap-2 text-amber-400">
                   <Clock size={32} />
                   <div className="font-black uppercase text-[10px] tracking-widest">Verifikasi Admin</div>
                   <p className="text-xs text-slate-400">Tunggu 5-10 menit untuk pengecekan.</p>
                </div>
              ) : booking.payment_status === "paid" ? (
                <div className="mt-10 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center gap-2 text-emerald-400">
                  <CheckCircle2 size={32} />
                  <div className="font-black uppercase text-[10px] tracking-widest">Pembayaran Lunas</div>
                  <p className="text-xs text-slate-400">Silakan datang ke venue tepat waktu.</p>
                </div>
              ) : null}
            </div>
            
            <div className="p-6 bg-white rounded-[2rem] border border-slate-200 flex items-start gap-4">
              <Info className="text-amber-500 shrink-0" size={20} />
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Punya kendala? Hubungi admin <span className="font-bold text-slate-900">WA 0812-3456-7890</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    unpaid: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    expired: "bg-slate-100 text-slate-400 border-slate-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
};

export default BookingDetail;