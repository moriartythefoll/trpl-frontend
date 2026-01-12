import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, confirmBooking, rejectBooking } from "../../services/admin/confirmBooking.service";
import { 
  LucideCheckCircle, 
  LucideUser, 
  LucideSearch, 
  LucideCalendar, 
  LucideClock, 
  LucideAlertCircle, 
  LucideEye,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBookingPage() {
  const queryClient = useQueryClient();

  // --- 1. DATA FETCHING ---
  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getBookings,
    refetchInterval: 30000, 
    retry: 1, 
  });

  // --- 2. MUTATION LOGIC ---
  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: (res) => {
      toast.success(res.message || "Pembayaran berhasil dikonfirmasi!");
      queryClient.invalidateQueries(["admin", "bookings"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal konfirmasi");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectBooking,
    onSuccess: (res) => {
      toast.success(res.message || "Booking ditolak & slot dibuka kembali");
      queryClient.invalidateQueries(["admin", "bookings"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menolak booking");
    },
  });

  // --- 3. HELPER FUNCTIONS ---
  const formatCurrency = (val) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak valid";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(dateString));
  };

  // --- 4. RENDER ---
  if (isError) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <LucideAlertCircle size={48} className="text-red-500" />
      <p className="text-gray-600 font-bold">Gagal memuat data dari server.</p>
      <button onClick={() => refetch()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Coba Lagi</button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daftar Transaksi</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium italic">Status Real-time & Auto-Sync</p>
        </div>
        <div className="text-right text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
          Total: {bookings?.length || 0} Pesanan
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="p-6">User & Kode</th>
                <th className="p-6">Detail Lapangan</th>
                <th className="p-6">Total Bayar</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="hover:bg-indigo-50/30 transition-all duration-200">
                  <td className="p-6 align-top">
                    <span className="text-[9px] font-black bg-slate-800 text-white px-2 py-1 rounded mb-2 inline-block">
                      #{b.booking_code}
                    </span>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <LucideUser size={16} className="text-indigo-600" />
                      <div className="truncate max-w-[140px]">{b.user?.name || 'Guest'}</div>
                    </div>
                  </td>

                  <td className="p-6">
                    {b.items?.map((item, idx) => (
                      <div key={idx} className="mb-2 bg-white p-2 rounded-lg border border-gray-100 text-[12px]">
                        <div className="font-bold text-gray-800">{item.schedule?.field?.name}</div>
                        <div className="text-indigo-500 font-bold flex items-center gap-1 mt-1">
                          <LucideCalendar size={12} /> {formatDate(item.schedule?.start_time)}
                        </div>
                      </div>
                    ))}
                  </td>

                  <td className="p-6 align-top font-black text-gray-800">{formatCurrency(b.total_amount)}</td>

                  <td className="p-6 align-top">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase
                      ${b.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                        b.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      {b.payment_status}
                    </span>
                  </td>

                  <td className="p-6 align-top">
                    <div className="flex flex-col gap-2 max-w-[140px] mx-auto">
                      {b.payment_status === 'pending' ? (
                        <>
                          {b.payment_proof && (
                            <a 
                              href={`${import.meta.env.VITE_API_URL}/storage/${b.payment_proof}`} 
                              target="_blank" rel="noreferrer"
                              className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg"
                            >
                              <LucideEye size={14} /> LIHAT BUKTI
                            </a>
                          )}
                          
                          <button
                            // FIX: Menggunakan b.booking_code, bukan b.id
                            onClick={() => window.confirm("Konfirmasi LUNAS?") && confirmMutation.mutate(b.booking_code)}
                            disabled={confirmMutation.isPending}
                            className="bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black hover:bg-emerald-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
                          >
                            {confirmMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : "KONFIRMASI"}
                          </button>

                          <button
                            // FIX: Menggunakan b.booking_code, bukan b.id
                            onClick={() => window.confirm("TOLAK PEMBAYARAN?") && rejectMutation.mutate(b.booking_code)}
                            disabled={rejectMutation.isPending}
                            className="bg-white border border-rose-200 text-rose-600 py-2 rounded-lg text-[10px] font-black hover:bg-rose-50 disabled:opacity-50"
                          >
                            {rejectMutation.isPending ? "MEMPROSES..." : "REJECT"}
                          </button>
                        </>
                      ) : b.payment_status === 'paid' ? (
                        <div className="flex flex-col items-center text-emerald-500 font-black text-[10px]">
                          <LucideCheckCircle size={20} className="mb-1" />
                          COMPLETED
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[10px] font-bold italic text-center">Menunggu User...</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}