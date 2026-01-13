import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "../../services/admin/confirmBooking.service";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { 
  LucideAlertCircle, 
  LucideCreditCard, 
  LucideTrendingUp, 
  LucideArrowUpRight,
  LucideCalendarCheck,
  LucideRefreshCw,
  LucideActivity,
  LucideCheckCircle2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Helper Formatting
const formatIDR = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function AdminDashboard() {
  const { data: bookings = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getBookings,
    refetchInterval: 30000,
    retry: 1,
  });

  // --- CORE LOGIC: REVENUE & STATS ---
  const stats = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    // FIX: Hanya hitung revenue dari status 'paid'
    const revenue = safeBookings.reduce((sum, b) => {
      return b.payment_status === 'paid' ? sum + (Number(b.total_amount) || 0) : sum;
    }, 0);

    const total = safeBookings.length;
    const pending = safeBookings.filter(b => b.payment_status === 'pending').length;
    const paid = safeBookings.filter(b => b.payment_status === 'paid').length;

    // Chart Data (7 Hari Terakhir)
    const chartMap = safeBookings.reduce((acc, b) => {
      const date = b.created_at 
        ? new Date(b.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })
        : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(chartMap).map(date => ({
      date,
      total: chartMap[date]
    })).slice(-7);

    return { total, revenue, pending, paid, chartData };
  }, [bookings]);

  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: 'Menyingkronkan data...',
      success: 'Data Terupdate!',
      error: 'Gagal update data.',
    });
  };

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500 text-center p-6">
      <div className="p-8 bg-rose-50 rounded-[3rem] mb-6 text-rose-500 shadow-inner">
        <LucideAlertCircle size={64} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sync Connection Failed</h2>
      <p className="text-slate-500 mb-8 max-w-sm">Gagal mengambil data dari server. Pastikan API endpoint dan Token valid.</p>
      <button 
        onClick={() => refetch()} 
        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-cyan-600 transition-all shadow-xl flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]"
      >
        <LucideRefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
        Re-establish Connection
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Toaster position="top-right" />
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Live</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Admin <span className="text-cyan-500 not-italic">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs flex items-center gap-2 italic uppercase tracking-wider">
            <LucideActivity size={14} className="text-cyan-500" /> Operational Insights & Analytics
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={isFetching}
          className="group flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-2xl shadow-xl hover:bg-cyan-600 transition-all active:scale-95 disabled:opacity-50"
        >
          <LucideRefreshCw size={18} className={`text-cyan-400 group-hover:text-white ${isFetching ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {isFetching ? "Syncing..." : "Sync Data"}
          </span>
        </button>
      </div>

      {/* 2. STATISTIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={formatIDR(stats.revenue)} 
          subValue={`${stats.paid} Verified Payments`}
          icon={<LucideCheckCircle2 size={24}/>} 
          color="emerald"
          isPrimary
        />
        <StatCard 
          label="Total Bookings" 
          value={stats.total} 
          subValue="All time transactions"
          icon={<LucideCalendarCheck size={24}/>} 
          color="blue"
        />
        <StatCard 
          label="Pending Action" 
          value={stats.pending} 
          subValue="Waiting for audit"
          icon={<LucideAlertCircle size={24}/>} 
          color="amber"
        />
        
        {/* GROWTH MINI CHART */}
        <div className="bg-slate-900 rounded-[2.5rem] p-7 border border-slate-800 shadow-2xl relative group overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Growth Trend</span>
              <LucideTrendingUp className="text-cyan-400" size={18} />
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/10 blur-[50px] rounded-full" />
        </div>
      </div>

      {/* 3. RECENT ACTIVITY TABLE */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Recent Transactions</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Audit Log • 5 Latest Entry</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            Full Audit Logs <LucideArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] bg-slate-50/50">
                <th className="px-10 py-6 text-center w-24">User</th>
                <th className="px-10 py-6">Identity & Code</th>
                <th className="px-10 py-6">Value</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-cyan-50/20 transition-all duration-300 group">
                    <td className="px-10 py-7">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-lg group-hover:bg-cyan-500 transition-colors shadow-lg">
                        {b.user?.name?.charAt(0) || "U"}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[16px] uppercase italic tracking-tight">{b.user?.name || "Unknown User"}</span>
                        <span className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase">Ref: {b.booking_code}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7 font-black text-slate-950 text-base tracking-tighter italic">
                      {formatIDR(b.total_amount)}
                    </td>
                    <td className="px-10 py-7 text-center">
                      <StatusBadge status={b.payment_status} />
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button className="p-3.5 rounded-2xl bg-slate-50 text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90 border border-slate-100">
                        <LucideArrowUpRight size={22} />
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

// --- SUB-COMPONENTS ---

function StatCard({ label, value, subValue, icon, color, isPrimary }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-500/10",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-500/10",
  };

  return (
    <div className={`rounded-[2.5rem] p-7 border transition-all duration-500 group relative overflow-hidden ${isPrimary ? 'bg-white shadow-xl shadow-slate-200/60 border-white ring-1 ring-slate-100' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 shadow-lg transition-transform group-hover:rotate-12 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-1 uppercase italic">{value}</h4>
      <p className="text-[10px] font-bold text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md inline-block border border-slate-100">{subValue}</p>
      
      {isPrimary && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 rounded-full" />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    pending: "bg-amber-50 text-amber-600 ring-amber-500/20",
    cancelled: "bg-rose-50 text-rose-600 ring-rose-500/20",
  };

  return (
    <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ring-2 ring-inset shadow-sm ${styles[status] || styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 ${status === 'pending' ? 'animate-pulse' : ''}`}></span>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-10 py-7"><div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto" /></td>
      <td className="px-10 py-7"><div className="h-4 bg-slate-100 rounded w-40 mb-2" /><div className="h-3 bg-slate-50 rounded w-24" /></td>
      <td className="px-10 py-7"><div className="h-6 bg-slate-100 rounded-lg w-28" /></td>
      <td className="px-10 py-7"><div className="h-9 bg-slate-100 rounded-xl w-24 mx-auto" /></td>
      <td className="px-10 py-7"><div className="h-12 bg-slate-100 rounded-2xl w-12 ml-auto" /></td>
    </tr>
  );
}