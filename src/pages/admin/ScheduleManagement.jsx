import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFields } from "../../services/admin/field.service";
import scheduleService from "../../services/admin/schedule.service";
import { LucideCalendarPlus, LucideTrash2, LucideLoader, LucideFilter, LucideCheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSchedulePage() {
  const queryClient = useQueryClient();
  
  // State untuk Form Generate
  const [selectedField, setSelectedField] = useState("");
  const [genDate, setGenDate] = useState(new Date().toISOString().split("T")[0]);
  const [startH, setStartH] = useState(8);
  const [endH, setEndH] = useState(22);

  // 1. Ambil data Lapangan (untuk dropdown)
  const { data: fields = [] } = useQuery({ 
    queryKey: ["admin", "fields"], 
    queryFn: getFields 
  });
  
  // 2. Ambil data Jadwal
  const { data: schedules = [], isLoading } = useQuery({ 
    queryKey: ["admin", "schedules"], 
    queryFn: scheduleService.getSchedules 
  });

  // 3. Mutation untuk Generate Otomatis (Opsi B)
  const genMutation = useMutation({
    mutationFn: scheduleService.generateSchedules,
    onSuccess: (res) => {
      toast.success(res.message || "Slot jadwal berhasil dibuat!");
      queryClient.invalidateQueries(["admin", "schedules"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal generate jadwal");
    }
  });

  // 4. Mutation untuk Hapus Slot
  const delMutation = useMutation({
    mutationFn: scheduleService.deleteSchedule,
    onSuccess: () => {
      toast.success("Slot berhasil dihapus");
      queryClient.invalidateQueries(["admin", "schedules"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal menghapus")
  });

  // Filter jadwal berdasarkan lapangan yang dipilih di UI (Local Filter)
  const filteredSchedules = selectedField 
    ? schedules.filter(s => s.field_id == selectedField)
    : schedules;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Jadwal</h2>
        <p className="text-gray-500 text-sm">Generate slot waktu otomatis untuk setiap lapangan.</p>
      </div>

      {/* --- FORM GENERATE OTOMATIS (OPSI B) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold uppercase text-xs tracking-wider">
          <LucideCalendarPlus size={16} />
          <span>Generate Slot Baru</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Pilih Lapangan */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Lapangan</label>
            <select 
              value={selectedField} 
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">-- Pilih Lapangan --</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.venue?.name} - {f.name}</option>
              ))}
            </select>
          </div>

          {/* Pilih Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Tanggal</label>
            <input 
              type="date" 
              value={genDate} 
              onChange={(e) => setGenDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Jam Operasional */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Jam Buka - Tutup</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-xl">
              <input 
                type="number" min="0" max="23" value={startH} 
                onChange={(e) => setStartH(e.target.value)}
                className="w-full bg-transparent p-1.5 text-center outline-none"
              />
              <span className="text-gray-400 font-bold">:</span>
              <input 
                type="number" min="0" max="23" value={endH} 
                onChange={(e) => setEndH(e.target.value)}
                className="w-full bg-transparent p-1.5 text-center outline-none"
              />
            </div>
          </div>

          {/* Tombol Generate */}
          <button 
            onClick={() => {
              if(!selectedField) return toast.error("Silakan pilih lapangan terlebih dahulu!");
              genMutation.mutate({ field_id: selectedField, date: genDate, start_hour: startH, end_hour: endH });
            }}
            disabled={genMutation.isPending}
            className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-gray-400"
          >
            {genMutation.isPending ? <LucideLoader className="animate-spin" /> : <LucideCheckCircle size={20} />}
            {genMutation.isPending ? "Proses..." : "Generate Slot"}
          </button>
        </div>
      </div>

      {/* --- TABEL DAFTAR JADWAL --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <LucideFilter size={18} /> Daftar Slot Waktu
            </h3>
            <span className="text-xs text-gray-500 font-medium">Total: {filteredSchedules.length} Slot</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">Waktu & Tanggal</th>
                <th className="p-5">Informasi Lapangan</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Memuat data jadwal...</td></tr>
              ) : filteredSchedules.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Belum ada jadwal yang di-generate.</td></tr>
              ) : (
                filteredSchedules.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-gray-800">
                        {new Date(s.start_time).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'short' })}
                      </div>
                      <div className="text-sm font-mono text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">
                        {new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(s.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-semibold text-gray-700">{s.field?.name}</div>
                      <div className="text-xs text-gray-400">📍 {s.field?.venue?.name}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                        ${s.status === 'available' ? 'bg-green-100 text-green-700' : 
                          s.status === 'booked' ? 'bg-blue-100 text-blue-700' : 
                          s.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                       <button 
                        onClick={() => confirm("Hapus slot ini?") && delMutation.mutate(s.id)} 
                        disabled={s.status === 'booked'}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                       >
                          <LucideTrash2 size={18} />
                       </button>
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