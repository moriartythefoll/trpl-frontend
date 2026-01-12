import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  Calendar, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Loader2,
  TrendingUp
} from "lucide-react";
import { getOwnerStats, getOwnerTransactions } from "../../services/owner/report.service";

export default function Reports() {
  // 1. STATE FILTER WAKTU
  const [timeRange, setTimeRange] = useState("monthly");

  // 2. FETCH DATA STATISTIK
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["owner-stats", timeRange],
    queryFn: () => getOwnerStats(timeRange),
    keepPreviousData: true,
  });

  // 3. FETCH DATA TRANSAKSI
  const { data: transResponse, isLoading: transLoading } = useQuery({
    queryKey: ["owner-transactions", timeRange],
    queryFn: () => getOwnerTransactions(timeRange),
    keepPreviousData: true,
  });

  // 4. HANDLING DATA (Mencegah Uncaught TypeError .map)
  const transactions = Array.isArray(transResponse) 
    ? transResponse 
    : transResponse?.data || [];

  const realStats = statsData?.data || statsData;

  const timeFilters = [
    { id: "weekly", label: "Mingguan" },
    { id: "monthly", label: "Bulanan" },
    { id: "yearly", label: "Tahunan" },
  ];

  // 5. MAPPING STAT CARDS
  const statsConfig = [
    { 
      label: "Total Pendapatan", 
      val: `Rp ${realStats?.total_revenue?.toLocaleString() || 0}`, 
      icon: <DollarSign size={20} />, 
      color: "text-[#ccff00]",
      trend: "+12.5%"
    },
    { 
      label: "Total Booking", 
      val: `${realStats?.total_bookings || 0} Sesi`, 
      icon: <Calendar size={20} />, 
      color: "text-blue-500",
      trend: "+3.2%"
    },
    { 
      label: "Rata-rata Okupansi", 
      val: `${realStats?.occupancy_rate || 0}%`, 
      icon: <BarChart3 size={20} />, 
      color: "text-purple-500",
      trend: "+5.1%"
    },
  ];

  return (
    <div className="space-y-12">
      {/* SECTION: HEADER & FILTER */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-12 bg-[#ccff00]"></span>
          <h2 className="text-[#ccff00] font-black text-[10px] uppercase tracking-[0.5em] italic">
            Sensei Business Intelligence
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
            REPORTS<span className="text-[#ccff00]">.</span>
          </h1>
          
          <div className="flex bg-[#0a0a0a] border border-white/10 p-1.5 rounded-2xl shadow-2xl">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeRange(filter.id)}
                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  timeRange === filter.id
                    ? "bg-[#ccff00] text-black shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statsConfig.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] relative group overflow-hidden hover:border-[#ccff00]/30 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-2xl bg-white/5 ${item.color} group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-500`}>
                {statsLoading ? <Loader2 className="animate-spin" size={20} /> : item.icon}
              </div>
              <div className="text-[10px] font-black text-[#ccff00] bg-[#ccff00]/10 px-3 py-1 rounded-full italic">
                {item.trend}
              </div>
            </div>
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">{item.label}</p>
            <h3 className="text-4xl font-black italic tracking-tighter">
              {statsLoading ? "ANALYZING..." : item.val}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* SECTION: DATA TABLE */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
        <div className="p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-transparent to-white/[0.01]">
          <div>
            <h3 className="font-black uppercase italic tracking-widest text-xl">Daftar Transaksi</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
              Periode {timeRange} • Real-time database sync
            </p>
          </div>
          <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-black transition-all group">
            <Download size={16} className="group-hover:scale-110 transition-transform" /> 
            Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="p-10 text-[10px] font-black uppercase text-gray-500 tracking-widest">Penyewa</th>
                <th className="p-10 text-[10px] font-black uppercase text-gray-500 tracking-widest">Lapangan</th>
                <th className="p-10 text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Bayar</th>
                <th className="p-10 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transLoading ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-[#ccff00]" size={40} />
                      <p className="font-black uppercase italic tracking-[0.3em] text-xs text-gray-500">Retrieving Secure Data...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-10">
                      <p className="font-black uppercase italic text-base group-hover:text-[#ccff00] transition-colors">
                        {trx.user?.name || 'Customer'}
                      </p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase">{trx.booking_code}</p>
                    </td>
                    <td className="p-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase italic text-gray-400">
                        {trx.field?.name || 'General Field'}
                      </div>
                    </td>
                    <td className="p-10 font-black text-white text-lg italic">
                      Rp {(trx.total_price || 0).toLocaleString()}
                    </td>
                    <td className="p-10">
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase italic border ${
                        trx.status === 'success' || trx.status === 'completed'
                          ? 'bg-[#ccff00]/5 text-[#ccff00] border-[#ccff00]/20'
                          : 'bg-orange-500/5 text-orange-500 border-orange-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${trx.status === 'success' ? 'bg-[#ccff00]' : 'bg-orange-500'}`} />
                        {trx.status}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Filter size={60} />
                      <p className="font-black uppercase italic tracking-widest text-xs text-gray-400">
                        Tidak ada aktivitas ditemukan
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}