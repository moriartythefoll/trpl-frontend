import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Pastikan path dan nama file service sudah benar
import { getBookings, confirmBooking } from "../../services/admin/confirmBooking.service";
import { LucideCheckCircle, LucideUser, LucideSearch, LucideCalendar, LucideClock, LucideAlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBookingPage() {
  const queryClient = useQueryClient();

  // --- 1. DATA FETCHING ---
  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getBookings,
    // Menambahkan retry agar jika gagal karena koneksi tidak langsung menyerah
    retry: 1, 
  });

  // --- 2. MUTATION LOGIC ---
  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: (res) => {
      toast.success(res.message || "Pembayaran berhasil dikonfirmasi");
      queryClient.invalidateQueries(["admin", "bookings"]);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Gagal melakukan konfirmasi";
      toast.error(msg);
    },
  });

  // --- 3. HELPER FUNCTIONS ---
  const formatCurrency = (val) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak valid";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(dateString));
  };

  const getHour = (dateString) => {
    if (!dateString) return "00:00";
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- 4. RENDER LOGIC ---
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
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Kelola konfirmasi bukti pembayaran penyewaan lapangan.
          </p>
        </div>
        <div className="text-right text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 uppercase tracking-widest">
          Total: {bookings?.length || 0} Pesanan
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.15em] border-b border-gray-100">
                <th className="p-6">Informasi Transaksi</th>
                <th className="p-6">Detail Slot & Lapangan</th>
                <th className="p-6">Nilai Pembayaran</th>
                <th className="p-6">Status Pembayaran</th>
                <th className="p-6 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="p-12 bg-gray-50/20 text-center text-gray-300">Memuat data...</td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <LucideSearch size={48} className="mb-4" />
                      <p className="font-bold text-xl uppercase tracking-widest">Belum ada transaksi masuk</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-indigo-50/30 transition-all duration-200">
                    {/* Kolom 1: Kode & User */}
                    <td className="p-6 align-top">
                      <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded mb-2 inline-block shadow-sm">
                        CODE: {b.booking_code}
                      </span>
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <LucideUser size={16} className="text-indigo-600" />
                        </div>
                        <div className="truncate max-w-[150px]">{b.user?.name || 'Guest'}</div>
                      </div>
                    </td>

                    {/* Kolom 2: Detail Lapangan (Safe Mapping) */}
                    <td className="p-6">
                      {b.items?.length > 0 ? b.items.map((item, idx) => (
                        <div key={idx} className="mb-3 last:mb-0 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="font-bold text-gray-800 text-sm">
                            {/* Optional Chaining agar tidak crash jika field/venue null */}
                            {item.schedule?.field?.name || 'Lapangan Terhapus'}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold mt-1 italic">
                            {item.schedule?.field?.venue?.name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-bold mt-2">
                            <LucideCalendar size={12} />
                            {formatDate(item.schedule?.start_time)} | {getHour(item.schedule?.start_time)}
                          </div>
                        </div>
                      )) : <span className="text-gray-400 italic text-xs">Tidak ada item</span>}
                    </td>

                    {/* Kolom 3: Total */}
                    <td className="p-6 align-top font-black text-gray-800 text-lg">
                      {formatCurrency(b.total_amount)}
                    </td>

                    {/* Kolom 4: Status Badges */}
                    <td className="p-6 align-top">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm
                        ${b.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 
                          b.payment_status === 'unpaid' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                        }`}>
                        {b.payment_status === 'unpaid' && <LucideClock size={12} className="mr-2 animate-spin-slow" />}
                        {b.payment_status}
                      </span>
                    </td>

                    {/* Kolom 5: Aksi */}
                    <td className="p-6 text-center align-top">
                      {b.payment_status === "unpaid" ? (
                        <button
                          onClick={() => {
                            if(window.confirm("Konfirmasi pembayaran ini? Pastikan mutasi bank sudah dicek.")) {
                              confirmMutation.mutate(b.id);
                            }
                          }}
                          disabled={confirmMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto active:scale-95 transition-all disabled:bg-gray-300"
                        >
                          {confirmMutation.isPending ? "MEMPROSES..." : "KONFIRMASI"}
                        </button>
                      ) : (
                        <div className="flex flex-col items-center text-emerald-500 font-bold text-[10px] animate-in fade-in zoom-in duration-500">
                          <LucideCheckCircle size={24} className="mb-1" />
                          VERIFIED
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}