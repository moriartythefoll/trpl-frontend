import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../services/axios";
// IMPORT FIXED: Pastikan path benar dan menggunakan named import {}
import { createBooking } from "../../services/user/booking.service"; 
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { LucideCalendar, LucideInfo, Clock, MapPin } from "lucide-react";

export default function FieldDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Fetch Data Lapangan
  const { data: field, isLoading } = useQuery({
    queryKey: ["field", id],
    queryFn: async () => {
      // Gunakan endpoint yang sesuai dengan API.php (explore/venues/{id})
      const res = await api.get(`/explore/venues/${id}`);
      return res.data.data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast.success("Booking Berhasil! Mengalihkan ke riwayat...");
      // Arahkan ke halaman riwayat booking user
      setTimeout(() => navigate("/user/bookings"), 1500);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Gagal melakukan booking";
      toast.error(msg);
    },
  });

  const handleToggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleBooking = () => {
    if (!user) {
      toast.error("Login diperlukan untuk booking.");
      return navigate("/login");
    }
    if (selectedSlots.length === 0) return toast.error("Pilih minimal 1 jadwal!");
    
    // Kirim payload sesuai kebutuhan backend: { schedule_ids: [1, 2, 3] }
    checkoutMutation.mutate({ schedule_ids: selectedSlots });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KIRI: INFO & JADWAL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4">
              <MapPin size={14} /> Arena Details
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{field?.name}</h1>
            <p className="text-slate-500 mt-4 leading-relaxed">
              {field?.description || "Nikmati fasilitas olahraga terbaik dengan standar internasional dan kenyamanan maksimal."}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 uppercase text-sm tracking-widest">
              <LucideCalendar className="text-indigo-600" size={20} /> Tersedia Hari Ini
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {field?.schedules?.length > 0 ? (
                field.schedules.map((slot) => {
                  const isBooked = slot.status !== "available";
                  const isSelected = selectedSlots.includes(slot.id);
                  const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <button
                      key={slot.id}
                      disabled={isBooked}
                      onClick={() => handleToggleSlot(slot.id)}
                      className={`relative p-4 rounded-2xl text-xs font-black transition-all border-2 flex flex-col items-center gap-1
                        ${isBooked ? "bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed opacity-60" : 
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-1" : 
                        "bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
                    >
                      <Clock size={14} className={isSelected ? "text-white" : "text-indigo-400"} />
                      {startTime}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">
                  Belum ada jadwal yang di-generate untuk hari ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KANAN: RINGKASAN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-10">
            <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-[0.2em]">Booking Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Rate / Hour</span>
                <span className="font-black text-slate-800">Rp {field?.price_per_hour?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Duration</span>
                <span className="font-black text-slate-800">{selectedSlots.length} Hours</span>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase text-xs">Total Amount</span>
                <span className="font-black text-indigo-600 text-2xl tracking-tighter">
                  Rp {(selectedSlots.length * (field?.price_per_hour || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={checkoutMutation.isPending || selectedSlots.length === 0}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
            >
              {checkoutMutation.isPending ? "Syncing..." : "Confirm Booking"}
            </button>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
              <LucideInfo className="text-indigo-400 shrink-0" size={16} />
              <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                Pemesanan Anda akan diproses secara instan. Pastikan jadwal sudah sesuai sebelum konfirmasi.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}