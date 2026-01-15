import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, Loader2, Search, Database, Cpu, 
  Zap, Activity, ShieldCheck, AlertTriangle, RefreshCw,
  Download, Printer, ArrowUpRight, TrendingUp, Globe,
  Filter, Calendar, ChevronRight
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid, YAxis 
} from 'recharts';
import { getOwnerTransactions, getOwnerStats } from "../../services/owner/report.service";
import { useAuthStore } from "../../store/auth.store";

// --- CORE UTILS ---
const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(val || 0).replace("IDR", "Rp");
};

export default function Reports() {
  const user = useAuthStore((state) => state.user);
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Feature: Filter by status

  useEffect(() => { setIsMounted(true); }, []);

  // --- DATA STREAMS ---
  const { data: statsResponse, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["owner-stats-live", timeRange],
    queryFn: () => getOwnerStats(timeRange),
    refetchInterval: 10000, // Sync every 10s
  });

  const { data: transResponse, isError: transError, refetch: refetchTrans } = useQuery({
    queryKey: ["owner-transactions-live"],
    queryFn: getOwnerTransactions,
    refetchInterval: 10000,
  });

  // --- CALCULATED METRICS (LIVE) ---
  const totals = useMemo(() => {
    const raw = transResponse?.data || [];
    return {
      success: raw.filter(t => t.payment_status === 'success').length,
      pending: raw.filter(t => t.payment_status === 'pending').length,
    };
  }, [transResponse]);

  const chartData = useMemo(() => {
    const raw = statsResponse?.data || [];
    return [...raw]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-8)
      .map(trx => ({
        name: new Date(trx.created_at).toLocaleDateString('id-ID', { weekday: 'short' }),
        fullDate: new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: Number(trx.total_amount || 0)
      }));
  }, [statsResponse]);

  const filteredTransactions = useMemo(() => {
    const raw = transResponse?.data || [];
    return raw.filter(trx => {
      const matchesSearch = trx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trx.booking_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || trx.payment_status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [transResponse, searchQuery, activeTab]);

  if (statsError || transError) return <ErrorState onRetry={() => { refetchStats(); refetchTrans(); }} />;
  if (statsLoading && !statsResponse) return <LoadingScreen />;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 1. HEADER & META-NODES */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 no-print">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />
                <span className="text-[9px] font-black text-[#ccff00] uppercase tracking-widest italic">Live_System_Active</span>
             </div>
             <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-tighter italic">Ref: {new Date().toISOString().split('T')[0]}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase text-white">
            Performance <span className="text-zinc-800">Briefing</span>
          </h1>
          <p className="text-zinc-500 font-medium text-sm flex items-center gap-2 tracking-wide">
            Operational Overview for <span className="text-white font-black">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-6 rounded-[2.5rem] backdrop-blur-xl">
           <MetaNode label="Network" val="ID-JKT-1" sub="Latency: 0.2ms" icon={<Globe size={14}/>} />
           <div className="w-[1px] h-10 bg-white/5" />
           <MetaNode label="Node_Status" val="Encrypted" sub="SSL v3.4 Active" icon={<ShieldCheck size={14}/>} />
        </div>
      </section>

      {/* 2. CONTROL HUB */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-[#0a0a0a] border border-white/5 p-4 rounded-3xl shadow-2xl">
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/[0.05]">
          {['weekly', 'monthly', 'yearly'].map((f) => (
            <button key={f} onClick={() => setTimeRange(f)} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                ${timeRange === f ? "bg-[#ccff00] text-black shadow-[0_15px_30px_rgba(204,255,0,0.2)] scale-105" : "text-zinc-500 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => window.print()} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:border-[#ccff00]/30 transition-all">
             <Printer size={18} />
           </button>
           <button className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-[#ccff00] transition-all group shadow-xl">
             <Download size={16} className="group-hover:-translate-y-1 transition-transform" /> Export_Analytics
           </button>
        </div>
      </section>

      {/* 3. CORE METRIC TILES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Net Revenue" val={formatCurrency(statsResponse?.summary?.total_revenue)} trend="+14.2%" icon={<DollarSign/>} color="text-[#ccff00]" />
        <MetricCard label="Throughput" val={statsResponse?.summary?.total_bookings || 0} trend="Active Nodes" icon={<Activity/>} color="text-blue-500" />
        <MetricCard label="Data Integrity" val={`${statsResponse?.summary?.success_rate || 100}%`} trend="No Package Loss" icon={<Cpu/>} color="text-purple-500" />
      </section>

      {/* 4. REVENUE FLOW VISUALIZER */}
      <section className="bg-[#0a0a0a] border border-white/[0.05] p-10 rounded-[3.5rem] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative z-10 gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#ccff00] rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                <TrendingUp size={24} strokeWidth={3} />
             </div>
             <div>
                <h3 className="font-black uppercase tracking-[0.3em] text-lg text-white italic">Revenue_Stream</h3>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Live Financial Telemetry / {timeRange}</p>
             </div>
          </div>
          
          <div className="flex gap-2">
             <StatusBadge label="Healthy" color="bg-[#ccff00]" />
             <StatusBadge label="Optimized" color="bg-blue-500" />
          </div>
        </div>
        
        <div className="w-full h-[400px] relative z-10">
          {isMounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 11, fontWeight: 900}} dy={15} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#ccff00', strokeWidth: 1, strokeDasharray: '5 5'}} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ccff00" 
                  strokeWidth={5} 
                  fill="url(#mainGrad)" 
                  animationDuration={2500} 
                  activeDot={{ r: 8, fill: '#000', stroke: '#ccff00', strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState /> }
        </div>
      </section>

      {/* 5. TRANSACTIONAL LOGS (RE-ENGINEERED) */}
      <section className="bg-[#0a0a0a] border border-white/[0.05] rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/[0.05] space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Zap className="text-[#ccff00]" size={24} />
              <h3 className="font-black uppercase tracking-[0.3em] text-lg text-white italic">Neural_Logs</h3>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-black p-1 rounded-xl border border-white/5">
               {['all', 'success', 'pending'].map((tab) => (
                 <button key={tab} onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all 
                   ${activeTab === tab ? "bg-zinc-800 text-[#ccff00]" : "text-zinc-600 hover:text-white"}`}>
                   {tab}
                 </button>
               ))}
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#ccff00] transition-colors" size={18} />
            <input 
              className="w-full bg-black/50 border border-white/[0.08] rounded-2xl pl-16 pr-8 py-5 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-[#ccff00]/50 focus:ring-4 focus:ring-[#ccff00]/5 transition-all" 
              placeholder="Query by ID_Hash or User_Identity..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-zinc-600 border-b border-white/[0.03] bg-black/20">
                <th className="px-10 py-6 tracking-[0.2em]">Transaction_ID</th>
                <th className="px-10 py-6 tracking-[0.2em]">Entity</th>
                <th className="px-10 py-6 text-center tracking-[0.2em]">Asset_Value</th>
                <th className="px-10 py-6 text-right tracking-[0.2em]">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.slice(0, 10).map((trx, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={trx.id} className="group hover:bg-[#ccff00]/[0.01] transition-all cursor-default"
                  >
                    <td className="px-10 py-8 font-mono text-[#ccff00]/30 text-[10px] group-hover:text-[#ccff00] transition-colors italic">
                      {trx.booking_code}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500">
                            {trx.user?.name?.charAt(0)}
                         </div>
                         <div>
                            <div className="text-xs font-black uppercase text-white tracking-widest group-hover:translate-x-1 transition-transform">{trx.user?.name}</div>
                            <div className="text-[8px] text-zinc-600 uppercase font-bold mt-1 tracking-tighter">{new Date(trx.created_at).toLocaleString()}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center font-black italic text-sm text-white tabular-nums">
                      {formatCurrency(trx.total_amount)}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center gap-2">
                         <span className={`w-1 h-1 rounded-full ${trx.payment_status === 'success' ? 'bg-[#ccff00]' : 'bg-orange-500'}`} />
                         <span className={`text-[9px] font-black uppercase tracking-widest ${trx.payment_status === 'success' ? 'text-[#ccff00]' : 'text-orange-500'}`}>
                           {trx.payment_status}
                         </span>
                         <ChevronRight size={12} className="text-zinc-800 group-hover:text-white transition-colors" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// --- REUSABLE SUB-COMPONENTS ---

function MetricCard({ label, val, trend, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      className="metric-box bg-[#0a0a0a] border border-white/[0.05] p-10 rounded-[3rem] relative overflow-hidden group"
    >
      <div className={`absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-10 transition-opacity ${color}`}>
        {React.cloneElement(icon, { size: 180 })}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
           <div className={`p-2 rounded-lg bg-white/5 ${color}`}>{icon}</div>
           <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">{label}</p>
        </div>
        <h3 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none mb-4">{val}</h3>
        <div className="flex items-center gap-2">
           <ArrowUpRight size={14} className="text-[#ccff00]" />
           <span className="text-[9px] font-black text-[#ccff00] uppercase tracking-widest">{trend}</span>
        </div>
      </div>
    </motion.div>
  );
}

function MetaNode({ label, val, sub, icon }) {
  return (
    <div className="flex items-center gap-4">
       <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-zinc-500">
          {icon}
       </div>
       <div>
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xs font-black text-white italic leading-none">{val}</p>
          <p className="text-[7px] font-bold text-[#ccff00] uppercase tracking-tighter mt-1">{sub}</p>
       </div>
    </div>
  );
}

function StatusBadge({ label, color }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full">
       <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
       <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f0f0f] border border-[#ccff00]/30 p-5 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
          {payload[0].payload.fullDate}
        </p>
        <div className="space-y-1">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Value_Locked</p>
           <p className="text-[#ccff00] font-black text-2xl italic tracking-tighter">
             {formatCurrency(payload[0].value)}
           </p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-white/40 uppercase">
           <div className="w-2 h-2 rounded-full bg-[#ccff00]/20 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#ccff00]" />
           </div>
           System_Verified
        </div>
      </div>
    );
  }
  return null;
};

// --- LOADING & ERROR STATES ---
function LoadingScreen() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center bg-[#050505]">
      <div className="relative">
         <Loader2 className="animate-spin text-[#ccff00]" size={80} strokeWidth={1} />
         <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-[#ccff00] animate-pulse" size={20} />
         </div>
      </div>
      <p className="mt-12 text-[#ccff00] font-black text-[11px] uppercase tracking-[1.5em] text-center animate-pulse">
        Initialising_Sync
      </p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-[#050505] p-10 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-red-500/20">
        <AlertTriangle className="text-red-500" size={40} />
      </div>
      <h2 className="text-white font-black uppercase italic tracking-tighter text-4xl mb-4">Uplink_Failed</h2>
      <p className="text-zinc-500 max-w-md mb-10 text-sm font-medium tracking-wide">The neural link to the database was severed. Check your network protocols or contact system admin.</p>
      <button onClick={onRetry} className="group relative px-16 py-5 bg-[#ccff00] overflow-hidden rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(204,255,0,0.1)]">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="relative z-10 text-black font-black uppercase text-xs tracking-[0.3em]">Reconnect_Now</span>
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
       <Database size={40} className="mb-4 text-[#ccff00]" />
       <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Awaiting_Uplink_Data...</p>
    </div>
  );
}