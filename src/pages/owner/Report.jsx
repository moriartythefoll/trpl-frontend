import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, Loader2, Activity, Search, 
  Database, Cpu, Target, ShieldCheck 
} from "lucide-react";
import { getOwnerTransactions } from "../../services/owner/report.service";
import toast from "react-hot-toast";

export default function Reports() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSync, setLastSync] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  // 1. DATA ENGINE (Polling tiap 5 detik)
  const { data: transResponse, isLoading: transLoading } = useQuery({
    queryKey: ["owner-transactions-live", timeRange],
    queryFn: async () => {
      const response = await getOwnerTransactions(timeRange);
      console.log("📡 Raw Data from Laravel:", response); // CEK DI CONSOLE
      return response;
    },
    refetchInterval: 5000,
  });

  // 2. REFINED DATA PROCESSING
  const transactions = useMemo(() => {
    // Mencoba berbagai kemungkinan struktur JSON Laravel
    const data = transResponse?.data?.data || transResponse?.data || transResponse || [];
    const finalArray = Array.isArray(data) ? data : [];
    
    return [...finalArray].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }, [transResponse]);

  // 3. INTELLIGENCE LOGIC
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => 
      trx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.booking_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const intelligence = useMemo(() => {
    if (!filteredTransactions.length) return { revenue: 0, bookings: 0, successRate: 0 };
    const revenue = filteredTransactions.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const success = filteredTransactions.filter(t => t.status === 'success' || t.status === 'completed').length;
    return {
      revenue,
      bookings: filteredTransactions.length,
      successRate: (success / filteredTransactions.length) * 100,
    };
  }, [filteredTransactions]);

  // Loading state yang keren
  if (transLoading && !transResponse) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#ccff00]" size={40} />
      <p className="text-[#ccff00] font-mono text-xs animate-pulse uppercase tracking-[0.3em]">Establishing Uplink...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ... (Sisa JSX UI sama seperti sebelumnya) ... */}
      {/* Pastikan di dalam map table menggunakan: key={trx.id} */}
      
      <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto">
         {/* HEADER SECTION */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database size={18} className="text-[#ccff00]" />
              <p className="text-[#ccff00] font-black text-[10px] uppercase tracking-[0.5em]">Live Matrix Feed</p>
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] uppercase">
              REPORTS<span className="text-[#ccff00]">.</span>
            </h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {['weekly', 'monthly', 'yearly'].map((f) => (
              <button key={f} onClick={() => setTimeRange(f)} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === f ? "bg-[#ccff00] text-black" : "text-gray-500"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricBox label="Total Revenue" val={`Rp ${intelligence.revenue.toLocaleString()}`} icon={<DollarSign/>} pulse={livePulse} />
          <MetricBox label="Transactions" val={intelligence.bookings} icon={<Cpu/>} pulse={livePulse} />
          <MetricBox label="Success Rate" val={`${intelligence.successRate.toFixed(1)}%`} icon={<Target/>} pulse={livePulse} />
        </div>

        {/* TABLE */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black uppercase italic tracking-widest text-xl">Transaction Logs</h3>
                <input 
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#ccff00]" 
                    placeholder="Search Node..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] uppercase text-gray-500 border-b border-white/5">
                            <th className="p-6">ID</th>
                            <th className="p-6">User</th>
                            <th className="p-6 text-center">Amount</th>
                            <th className="p-6 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((trx) => (
                                <tr key={trx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                                    <td className="p-6 font-mono text-[#ccff00] text-xs">#{trx.booking_code}</td>
                                    <td className="p-6">
                                        <div className="font-black uppercase text-sm">{trx.user?.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-600">{new Date(trx.created_at || trx.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-6 text-center font-black italic">Rp {Number(trx.total_price).toLocaleString()}</td>
                                    <td className="p-6 text-right">
                                        <span className="text-[10px] font-black uppercase px-3 py-1 border border-[#ccff00] text-[#ccff00] rounded-md">
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                    No data detected in current matrix
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, val, icon, pulse }) {
  return (
    <motion.div 
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      className="bg-[#111] border border-white/5 p-8 rounded-[2rem]"
    >
      <div className="text-[#ccff00] mb-4">{icon}</div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-black italic">{val}</h3>
    </motion.div>
  );
}