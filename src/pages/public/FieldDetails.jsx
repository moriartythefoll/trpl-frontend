import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../services/axios";
import { createBooking } from "../../services/user/booking.service";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { LucideCalendar, LucideInfo, LucideCheckCircle } from "lucide-react";

export default function FieldDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Cek apakah sudah login
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Fetch Data Lapangan & Jadwal
  const { data: field, isLoading } = useQuery({
    queryKey: ["field", id],
    queryFn: async () => {
      const res = await api.get(`/explore/venues/${id}`); // Endpoint publik
      return res.data.data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast.success("Booking berhasil! Silakan cek riwayat.");
      navigate("/user/bookings");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal booking"),
  });

  const handleToggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleBooking = () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      return navigate("/login");
    }
    if (selectedSlots.length === 0) return toast.error("Pilih jam dulu!");
    checkoutMutation.mutate({ schedule_ids: selectedSlots });
  };

  if (isLoading) return <div className="p-10 text-center font-bold">Memuat detail lapangan...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Kiri: Info Lapangan */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h1 className="text-3xl font-black text-gray-900">{field?.name}</h1>
          <p className="text-gray-500 mt-2">{field?.description || "Lapangan olahraga berkualitas tinggi."}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <LucideCalendar className="text-indigo-600" /> Pilih Jam Tersedia
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {field?.schedules?.map((slot) => {
              const isBooked = slot.status !== "available";
              const isSelected = selectedSlots.includes(slot.id);
              
              return (
                <button
                  key={slot.id}
                  disabled={isBooked}
                  onClick={() => handleToggleSlot(slot.id)}
                  className={`p-3 rounded-xl text-sm font-bold transition-all border-2 
                    ${isBooked ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : 
                    isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : 
                    "bg-white border-gray-100 text-gray-700 hover:border-indigo-200"}`}
                >
                  {new Date(slot.start_time).getHours()}:00
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanan: Ringkasan Booking */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-3xl shadow-xl border sticky top-6">
          <h3 className="font-bold text-gray-900 mb-4">Ringkasan Sewa</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Harga per jam</span>
              <span className="font-bold">Rp {field?.price_per_hour?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Jam</span>
              <span className="font-bold">{selectedSlots.length} Jam</span>
            </div>
            <div className="pt-3 border-t flex justify-between">
              <span className="font-black text-gray-900">Total Bayar</span>
              <span className="font-black text-indigo-600 text-lg">
                Rp {(selectedSlots.length * (field?.price_per_hour || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={checkoutMutation.isPending}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-gray-300"
          >
            {checkoutMutation.isPending ? "MEMPROSES..." : "BOOKING SEKARANG"}
          </button>
          
          <p className="text-[10px] text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
            <LucideInfo size={12} /> Pembayaran dilakukan secara manual setelah konfirmasi.
          </p>
        </div>
      </div>
    </div>
  );
}