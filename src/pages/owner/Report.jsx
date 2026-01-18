import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, Search, Activity, Cpu, 
  Terminal, Zap, ShieldAlert, BarChart, ChevronRight,
  TrendingUp, TrendingDown, Layers, Filter
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from "recharts";

import { getOwnerStats, getOwnerTransactions } from "../../services/owner/report.service";

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0
  }).format(val || 0).replace("Rp", "IDR_");

export default function Reports() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ["owner-report", timeRange],
    queryFn: () => getOwnerStats(timeRange),
  });

  const { data: transResponse } = useQuery({
    queryKey: ["owner-transactions"],
    queryFn: getOwnerTransactions,
  });

  const summary = useMemo(() => statsResponse?.summary || { total_revenue: 0, total_bookings: 0, success_rate: 0 }, [statsResponse]);

  const filteredTransactions = useMemo(() => {
    const raw = transResponse || [];
    return raw.filter(t => 
      t.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transResponse, searchQuery]);

  const chartData = useMemo(() => {
    return (statsResponse?.chart || []).map(item => ({
      name: new Date(item.created_at).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      amount: Number(item.total_amount || 0)
    }));
  }, [statsResponse]);

  if (isLoading) return <LoadingSystem />;

  return (
    <div className="space-y-12 pb-24 font-['Poppins'] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. TOP SYSTEM LOG - ENHANCED */}
      <header className="relative p-12 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-[900] text-purple-400 tracking-[0.3em] uppercase">SYSTEM_STABLE</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 tracking-[0.2em]">VER_8.0.4</span>
            </div>
            <h1 className="text-6xl font-[900] italic tracking-tighter text-white uppercase leading-none">
              ANALYTICS<span className="text-purple-500">_CORE</span>
            </h1>
            <p className="text-[10px] text-zinc-500 mt-5 tracking-[0.5em] uppercase font-black italic">Monitoring Realtime Financial Flux</p>
          </div>
          
          <div className="flex bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl">
            {["weekly", "monthly", "yearly"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-10 py-3 text-[10px] font-[900] uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${
                  timeRange === r 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "text-zinc-600 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. DATASTREAMS (METRICS) - ENHANCED WITH TRENDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CyberCard 
            label="Gross_Revenue" 
            value={formatCurrency(summary.total_revenue)} 
            icon={<DollarSign size={22}/>} 
            color="text-purple-500"
            trend="+12.4%" 
            isUp={true}
        />
        <CyberCard 
            label="Total_Ops" 
            value={summary.total_bookings} 
            icon={<Cpu size={22}/>} 
            color="text-cyan-400"
            trend="+5.2%" 
            isUp={true}
        />
        <CyberCard 
            label="Core_Efficiency" 
            value={`${summary.success_rate}%`} 
            icon={<Zap size={22}/>} 
            color="text-purple-400"
            trend="-0.4%" 
            isUp={false}
        />
      </section>

      {/* 3. PERFORMANCE CHART - DARK LUXURY */}
      <section className="p-12 bg-[#0d0d0e] border border-white/5 rounded-[3rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/20 shadow-inner">
              <BarChart size={24} />
            </div>
            <div>
              <h3 className="font-[900] uppercase text-white tracking-widest text-lg italic">Income_Stream_Analysis</h3>
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black mt-1">Global Transaction Telemetry</p>
            </div>
          </div>
          <div className="px-5 py-2 bg-white/[0.02] border border-white/5 rounded-full flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-cyan-400" />
             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Live Data Feed</span>
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#52525b', fontSize: 11, fontWeight: 900}} 
                dy={20} 
              />
              <YAxis hide={true} domain={['auto', 'auto']} />
              <Tooltip content={<CyberTooltip />} cursor={{stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4'}} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#c084fc" 
                strokeWidth={4} 
                fill="url(#cyberGradient)" 
                animationDuration={2000}
                dot={{ r: 4, fill: '#000', stroke: '#c084fc', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#c084fc', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. TRANSACTION LEDGER - HIGH CONTRAST */}
      <section className="bg-[#0d0d0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-cyan-400/10 rounded-xl">
                <Layers size={18} className="text-cyan-400" />
             </div>
             <div>
                <h3 className="font-[900] uppercase text-white tracking-[0.3em] text-xs">Master_Ledger</h3>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Verified Node Transactions</p>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                <input
                className="bg-black border border-white/5 rounded-2xl pl-16 pr-8 py-4 text-[11px] font-[700] text-white focus:outline-none focus:border-purple-500/50 transition-all w-full sm:w-80 tracking-widest placeholder:text-zinc-800"
                placeholder="SEARCH_NODE_USER"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all">
                <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-600 text-[9px] uppercase font-[900] tracking-[0.4em] bg-black/50 border-b border-white/5">
                <th className="px-12 py-8">Ref_Hash</th>
                <th className="px-12 py-8">Operator_Node</th>
                <th className="px-12 py-8">Settlement_Value</th>
                <th className="px-12 py-8 text-right">Auth_Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-purple-500/[0.04] transition-all group cursor-pointer">
                  <td className="px-12 py-8 text-[12px] font-[800] text-zinc-400 group-hover:text-purple-400 transition-colors tracking-tight italic">
                    {trx.booking_code}
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex flex-col">
                        <span className="uppercase font-[900] text-white text-[11px] tracking-widest group-hover:translate-x-1 transition-transform">{trx.user?.name}</span>
                        <span className="text-[8px] font-bold text-zinc-700 uppercase mt-1">verified_id_{trx.user?.id}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className="font-[900] text-cyan-400 text-sm tracking-tighter shadow-cyan-400/20">{formatCurrency(trx.total_amount)}</span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex items-center justify-end gap-5">
                       <span className={`px-4 py-1.5 rounded-lg text-[9px] font-[900] tracking-[0.2em] border transition-all duration-500 ${
                        trx.payment_status === 'paid' 
                        ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                       }`}>
                        {trx.payment_status.toUpperCase()}
                       </span>
                       <ChevronRight size={14} className="text-zinc-800 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CyberCard({ label, value, icon, color, trend, isUp }) {
  return (
    <div className="bg-[#0d0d0e] p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-700 group relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-10">
        <div className={`p-4 bg-black rounded-2xl border border-white/10 ${color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3">{label}</p>
      <div className={`text-4xl font-[900] italic tracking-tighter group-hover:translate-x-2 transition-transform duration-500 text-white`}>
        {value}
      </div>
      <div className="mt-8 flex items-center gap-2">
         <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full animate-shimmer`} />
         </div>
         <span className="text-[7px] text-zinc-700 font-black tracking-widest uppercase">Live_Node</span>
      </div>
    </div>
  );
}

function LoadingSystem() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center font-['Poppins']">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <ShieldAlert size={30} className="text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <span className="text-[11px] font-[900] tracking-[0.8em] text-white uppercase animate-pulse">Decrypting_Financial_Data</span>
    </div>
  );
}

function CyberTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/95 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-2xl shadow-2xl animate-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-2">
        <div className="w-2 h-2 rounded-full bg-purple-500" />
        <p className="text-[9px] font-[900] text-purple-400 uppercase tracking-widest">Revenue_Telemetry</p>
      </div>
      <p className="text-white font-[900] text-3xl tracking-tighter italic">{formatCurrency(payload[0].value)}</p>
      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-2 italic">Ref_Point: Secure_Origin</p>
    </div>
  );
}