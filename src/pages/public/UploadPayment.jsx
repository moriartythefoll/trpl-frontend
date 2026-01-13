import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import userBookingService from "../../services/user/booking.service";
import toast from "react-hot-toast";
import {
  CloudUpload, X, ArrowLeft, Loader2, ShieldCheck, 
  Calendar, Clock, MapPin, Zap
} from "lucide-react";

export default function UploadPayment() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["booking-by-code", code],
    queryFn: () => userBookingService.getBookingById(code),
    retry: false
  });

  const booking = useMemo(() => {
    if (!rawData) return null;
    if (Array.isArray(rawData)) return rawData.find((b) => b.booking_code === code) || rawData[0];
    return rawData.data || rawData;
  }, [rawData, code]);

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":") : "--:--";
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
  const formatIDR = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

  useEffect(() => {
    if (isError) { 
      toast.error("Booking tidak ditemukan"); 
      navigate("/my-bookings"); 
    }
    // Jika sudah bayar atau expired, tidak boleh ke halaman ini
    if (booking && booking.payment_status !== "unpaid") {
      navigate("/my-bookings");
    }
  }, [booking, isError, navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024) {
        toast.error("File terlalu besar! Maksimal 2MB");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // --- LOGIC UPLOAD YANG DIPERBAIKI ---
  const uploadMutation = useMutation({
    mutationFn: (formData) => userBookingService.uploadPayment(code, formData),
    onMutate: () => {
      toast.loading("Uploading your proof...", { id: "upload-status" });
    },
    onSuccess: () => {
      toast.success("Payment proof submitted! Waiting for verification.", { id: "upload-status" });
      setTimeout(() => navigate("/my-bookings"), 1500);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to upload proof";
      toast.error(msg, { id: "upload-status" });
    }
  });

  const handleConfirm = () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    const fd = new FormData();
    fd.append("payment_proof", file); // Pastikan key 'payment_proof' sesuai dengan yang diminta Backend

    uploadMutation.mutate(fd);
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Order...</p>
    </div>
  );

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 max-w-5xl">
        
        <div className="flex justify-between items-end mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Order ID</p>
            <h2 className="text-xl font-black text-slate-900 italic tracking-tighter">#{booking.booking_code}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT SIDE: SUMMARY */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-4"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-full">
              <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-6 italic">Reservation Details</h3>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {booking.items?.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase italic leading-none">{item.schedule?.field?.venue?.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.schedule?.field?.name}</p>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin size={14} className="text-indigo-500" /></div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600">
                        <Calendar size={12} className="text-indigo-400"/> {formatDate(item.schedule?.start_time)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600">
                        <Clock size={12} className="text-indigo-400"/> {formatTime(item.schedule?.start_time)} - {formatTime(item.schedule?.end_time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-slate-400">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600 italic tracking-tighter">{formatIDR(booking.total_amount)}</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: UPLOAD AREA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl h-full flex flex-col justify-between border border-slate-800">
              <div className="mb-6 text-center lg:text-left">
                <h3 className="text-white font-black text-lg italic uppercase tracking-tight">Proof of Payment</h3>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase">Upload your transfer receipt below</p>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {!preview ? (
                    <motion.label 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-slate-700 rounded-[2rem] cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500 transition-all group"
                    >
                      <div className="p-4 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                        <CloudUpload className="text-indigo-500" size={28} />
                      </div>
                      <span className="mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Image</span>
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </motion.label>
                  ) : (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative h-52">
                      <button 
                        onClick={() => {setFile(null); setPreview(null)}} 
                        className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110"
                      >
                        <X size={14} />
                      </button>
                      <img src={preview} alt="preview" className="w-full h-full object-cover rounded-[2rem] border-2 border-slate-700" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleConfirm}
                  disabled={!file || uploadMutation.isPending}
                  className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                    file && !uploadMutation.isPending 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 active:scale-[0.98]' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14}/>
                  ) : (
                    <Zap size={14}/>
                  )}
                  {uploadMutation.isPending ? "SENDING..." : "CONFIRM NOW"}
                </button>
                
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <ShieldCheck size={12} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter text-center">Encrypted Transaction Gate</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}