import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getBookings, confirmBooking, rejectBooking } from "../../services/admin/confirmBooking.service";
import { 
  LucideCheckCircle, LucideUser, LucideCalendar, 
  LucideEye, Loader2, LucideAlertCircle, LucideX,
  LucideClock, LucideReceipt, Search, Filter,
  TrendingUp, AlertTriangle, ShieldCheck, 
  Calendar as CalendarIcon, ArrowRightLeft, 
  Download, RefreshCw, ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- MODAL: FULLSCREEN PROOF PREVIEW ---
const FullscreenImageModal = ({ url, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/98 backdrop-blur-xl p-4 md:p-10" 
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 w-full flex justify-between items-center p-4 bg-white/5 backdrop-blur rounded-2xl mb-4 border border-white/10">
           <p className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck size={16} className="text-emerald-400" /> Payment Verification Mode
           </p>
           <button onClick={onClose} className="p-2 text-white hover:bg-rose-500 rounded-xl transition-all">
             <LucideX size={24} />
           </button>
        </div>
        <motion.img 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          src={url} 
          alt="Payment Proof" 
          className="max-h-[75vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain shadow-indigo-500/10"
        />
        <div className="mt-8 flex gap-4">
           <button onClick={() => window.open(url, '_blank')} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
             Open Original
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminBookingPage() {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // --- UI STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(""); // Format: YYYY-MM-DD

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

  // --- DATA FETCHING ---
  const { data: bookings = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getBookings,
    refetchInterval: 20000, // Background refresh setiap 20 detik
  });

  // --- MUTATIONS ---
  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: (res) => {
      toast.success(res.message || "Ledger Updated: Transaction Paid", {
        style: { borderRadius: '15px', background: '#0f172a', color: '#fff' }
      });
      queryClient.invalidateQueries(["admin", "bookings"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Verification Failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectBooking,
    onSuccess: () => {
      toast.success("Transaction Voided", { icon: '🚫' });
      queryClient.invalidateQueries(["admin", "bookings"]);
    },
  });

  // --- CORE LOGIC: FILTERING & ACCOUNTING ---
  const processedData = useMemo(() => {
    // 1. Jalankan Filter
    const filtered = bookings.filter(b => {
      const searchStr = `${b.booking_code} ${b.user?.name || ""} ${b.user?.email || ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || b.payment_status === statusFilter;
      const matchesDate = !dateFilter || b.created_at?.startsWith(dateFilter);
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 2. Kalkulasi Statistik Berdasarkan Filter (Reaktif)
    const paidOnly = filtered.filter(b => b.payment_status === 'paid');
    const totalRevenue = paidOnly.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    const pendingCount = filtered.filter(b => b.payment_status === 'pending').length;

    return {
      list: filtered,
      revenue: Math.floor(totalRevenue), // Clean integer for currency
      pending: pendingCount,
      totalCount: filtered.length
    };
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  // --- HANDLERS ---
  const openProof = (path) => {
    if (!path) return toast.error("Bukti tidak tersedia");
    const cleanPath = path.replace(/^\//, "");
    setPreviewUrl(`${API_URL}/storage/${cleanPath}`);
  };

  const handleReject = (code) => {
    if (window.confirm(`Sistem Audit: Batalkan pesanan ${code}?`)) {
      rejectMutation.mutate(code);
    }
  };

  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 animate-bounce">
        <LucideAlertCircle size={40} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 uppercase italic">Vault Access Denied</h1>
      <p className="text-slate-500 font-medium mt-2">Gagal menghubungkan ke server pusat data.</p>
      <button onClick={() => refetch()} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
        Re-Authorize Connection
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* --- TOP HUD: ACCOUNTING CARDS --- */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-5 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-indigo-200">System v4.0</span>
                {isFetching && <RefreshCw size={14} className="animate-spin text-slate-400" />}
             </div>
             <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-slate-950">
               Transaction<br/><span className="text-indigo-600 not-italic">Ledger.</span>
             </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-slate-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Validated Revenue</p>
              <h3 className="text-4xl font-black text-white tracking-tighter italic">
                Rp {processedData.revenue.toLocaleString('id-ID')}
              </h3>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {dateFilter ? `Filtered: ${dateFilter}` : 'Calculated from all paid data'}
                </span>
              </div>
            </div>
            <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-white/5 w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Queue</p>
               <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100">
                  <LucideClock size={20} />
               </div>
            </div>
            <h3 className="text-5xl font-black text-slate-950 tracking-tighter leading-none mt-4">
              {processedData.pending}<span className="text-sm text-slate-300 ml-2 uppercase tracking-normal">Unit</span>
            </h3>
          </motion.div>
        </header>

        {/* --- INTERFACE: FILTERS & SEARCH --- */}
        <section className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 mb-10 flex flex-col xl:flex-row gap-6 items-center">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Query: ID, Customer, or Email..." 
                className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[2rem] border-none font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex flex-wrap justify-center items-center gap-4 w-full xl:w-auto">
              {/* Date Filter Input */}
              <div className="flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-lg shadow-slate-200 border border-slate-800">
                 <CalendarIcon size={16} className="text-indigo-400" />
                 <input 
                   type="date" 
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   className="bg-transparent border-none outline-none text-[10px] font-black text-white uppercase tracking-widest cursor-pointer [color-scheme:dark]"
                 />
                 {dateFilter && (
                   <button onClick={() => setDateFilter("")} className="hover:text-rose-500 text-slate-500 transition-colors">
                      <LucideX size={16} />
                   </button>
                 )}
              </div>

              <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                 {['all', 'pending', 'paid'].map((tab) => (
                   <button 
                     key={tab} 
                     onClick={() => setStatusFilter(tab)}
                     className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
           </div>
        </section>

        {/* --- MAIN LEDGER TABLE --- */}
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Master Record</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Schedule Distribution</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Currency Value</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Auth Status</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">MGT Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-40 text-center">
                      <Loader2 className="animate-spin inline-block text-indigo-600 mb-4" size={48} />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Synchronizing Ledger Data...</p>
                    </td>
                  </tr>
                ) : processedData.list.map((b) => (
                  <motion.tr 
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={b.id} 
                    className={`group transition-all ${b.payment_status === 'pending' ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-10 py-8">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black tracking-widest mb-3">
                          <LucideReceipt size={10} className="text-indigo-400" /> #{b.booking_code}
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black italic">
                             {b.user?.name?.charAt(0) || <LucideUser size={20} />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase italic leading-none">{b.user?.name || "Anonymous"}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-2">
                               <LucideCalendar size={12} /> {new Date(b.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                             </p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-3">
                          {b.items?.map((item, idx) => (
                            <div key={idx} className="flex flex-col border-l-2 border-slate-200 pl-4 py-0.5 group-hover:border-indigo-500 transition-colors">
                               <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter italic">{item.schedule?.field?.name}</span>
                               <span className="text-[9px] font-black text-indigo-500 mt-1 tracking-widest uppercase flex items-center gap-1.5">
                                 <LucideClock size={10} /> 
                                 {new Date(item.schedule?.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                            </div>
                          ))}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-slate-950 tracking-tighter text-lg italic">
                       Rp {Number(b.total_amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                         b.payment_status === 'paid' 
                         ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-100' 
                         : 'bg-white text-amber-500 border-amber-200 shadow-sm'
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${b.payment_status === 'paid' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />
                          {b.payment_status}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex justify-end items-center gap-3">
                          {b.payment_proof && (
                            <button 
                              onClick={() => openProof(b.payment_proof)} 
                              className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-90"
                              title="Review Bukti"
                            >
                              <LucideEye size={18} />
                            </button>
                          )}
                          
                          {b.payment_status === 'pending' && (
                             <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[1.5rem]">
                                <button 
                                  onClick={() => confirmMutation.mutate(b.booking_code)} 
                                  disabled={confirmMutation.isPending}
                                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                >
                                  VALIDATE
                                </button>
                                <button 
                                  onClick={() => handleReject(b.booking_code)} 
                                  className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <LucideX size={18} />
                                </button>
                             </div>
                          )}

                          {b.payment_status === 'paid' && (
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner">
                               <LucideCheckCircle size={20} />
                            </div>
                          )}
                       </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {processedData.list.length === 0 && !isLoading && (
            <div className="py-40 text-center flex flex-col items-center">
               <div className="p-8 bg-slate-50 rounded-[3rem] text-slate-200 mb-6">
                  <ArrowRightLeft size={64} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">No matching records found in this vault</p>
               <button onClick={() => { setSearchTerm(""); setDateFilter(""); setStatusFilter("all"); }} className="mt-6 text-indigo-600 text-[10px] font-black uppercase underline tracking-widest">Clear All Protocols</button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewUrl && <FullscreenImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      </AnimatePresence>
    </div>
  );
}