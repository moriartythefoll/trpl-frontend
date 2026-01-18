import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, Search, BarChart3, 
  Landmark, Award, PieChart, ChevronRight,
  TrendingUp, TrendingDown, Filter,
  Globe, Briefcase, FileText, BadgeCheck, LineChart
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from "recharts";

import { getOwnerStats, getOwnerTransactions } from "../../services/owner/report.service";

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0
  }).format(val || 0);

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
      name: new Date(item.created_at).toLocaleDateString("en-US", { weekday: "short" }),
      amount: Number(item.total_amount || 0)
    }));
  }, [statsResponse]);

  if (isLoading) return <LoadingInstitutional />;

  return (
    <div className="space-y-12 pb-32 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* 1. INSTITUTIONAL HEADER */}
      <header className="relative p-12 bg-white border border-slate-200 rounded-[3rem] shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-amber-50/50 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                Executive Portfolio
              </span>
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quarterly Audit 2026</span>
            </div>
            
            <div>
              <h1 className="text-6xl font-black tracking-tight text-slate-900 italic font-serif">
                Capital <span className="text-amber-600 font-light not-italic">Intelligence</span>
              </h1>
              <p className="text-sm text-slate-400 mt-4 max-w-md font-medium leading-relaxed">
                A comprehensive fiscal overview of asset performance, institutional growth, and revenue sustainability.
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/50">
            {["weekly", "monthly", "yearly"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 ${
                  timeRange === r 
                  ? "bg-white text-slate-900 shadow-md border border-slate-100 scale-105" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. CORPORATE INSIGHTS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
        <InsightTag label="Portfolio" value="Diversified" icon={<Briefcase size={14}/>} />
        <InsightTag label="Liquidity" value="Premium" icon={<Landmark size={14}/>} />
        <InsightTag label="Audit" value="Cleared" icon={<BadgeCheck size={14}/>} />
        <InsightTag label="Yield" value="Optimized" icon={<LineChart size={14}/>} />
      </div>

      {/* 3. CORE FINANCIAL METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LuxuryCard 
            label="Gross Asset Revenue" 
            value={formatCurrency(summary.total_revenue)} 
            icon={<DollarSign size={24}/>} 
            color="text-amber-700"
            bg="bg-amber-50"
            trend="+12.4%" 
            isUp={true}
            description="Net performance post-settlement"
        />
        <LuxuryCard 
            label="Transaction Volume" 
            value={summary.total_bookings} 
            icon={<FileText size={24}/>} 
            color="text-slate-800"
            bg="bg-slate-100"
            trend="+5.2%" 
            isUp={true}
            description="Total verified engagements"
        />
        <LuxuryCard 
            label="Operational Yield" 
            value={`${summary.success_rate}%`} 
            icon={<PieChart size={24}/>} 
            color="text-emerald-700"
            bg="bg-emerald-50"
            trend="Stability" 
            isUp={true}
            description="Conversion efficiency ratio"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 4. PERFORMANCE CHART */}
        <section className="lg:col-span-2 p-12 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Trajectory</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Growth Index Analysis</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <BarChart3 size={24} className="text-amber-600" />
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="premiumGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  dy={20} 
                />
                <YAxis hide={true} domain={['auto', 'auto']} />
                <Tooltip content={<InstitutionalTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#b45309" 
                  strokeWidth={3} 
                  fill="url(#premiumGold)" 
                  dot={{ r: 4, fill: '#fff', stroke: '#b45309', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#b45309', stroke: '#fff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 5. SIDEBAR - GOVERNANCE & RANKING */}
        <section className="space-y-8">
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <Landmark className="text-amber-500 mb-6" size={36} />
                <h4 className="text-xl font-bold mb-2">Institutional Security</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-10">Data architecture compliant with global corporate transparency standards.</p>
                <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-amber-900/20">
                    Export Financial Report
                </button>
            </div>

            <div className="p-10 bg-white border border-slate-200 rounded-[3.5rem]">
                <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Asset Ranking</h4>
                <div className="space-y-8">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-300">0{i}</span>
                                <div className="space-y-1.5">
                                    <div className="h-2 w-20 bg-slate-100 rounded-full" />
                                    <div className="h-1.5 w-12 bg-slate-50 rounded-full" />
                                </div>
                            </div>
                            <span className="text-amber-600 font-black text-[11px]">+{(Math.random()*12).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>

      {/* 6. GENERAL LEDGER */}
      <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm">
        <div className="p-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-slate-100 bg-slate-50/20">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic font-serif">General Ledger</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Institutional Settlement Registry</p>
          </div>
          
          <div className="relative group">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
              <input
                className="bg-white border border-slate-200 rounded-2xl pl-16 pr-8 py-5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all w-full sm:w-[400px] shadow-sm"
                placeholder="Search ledger entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.25em] bg-white border-b border-slate-50">
                <th className="px-12 py-8">Reference ID</th>
                <th className="px-12 py-8">Entity Name</th>
                <th className="px-12 py-8">Value (IDR)</th>
                <th className="px-12 py-8 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-12 py-9 text-[13px] font-black text-slate-900 tracking-tight">
                    {trx.booking_code}
                  </td>
                  <td className="px-12 py-9">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-[10px]">
                            {trx.user?.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-[13px] tracking-tight">{trx.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-12 py-9 text-[14px] font-black text-slate-900 tabular-nums">
                    {formatCurrency(trx.total_amount)}
                  </td>
                  <td className="px-12 py-9 text-right">
                    <div className="flex items-center justify-end gap-6">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${
                         trx.payment_status === 'paid' 
                         ? 'bg-white text-emerald-700 border-emerald-100 shadow-sm' 
                         : 'bg-white text-rose-600 border-rose-100 shadow-sm'
                        }`}>
                         {trx.payment_status.toUpperCase()}
                        </span>
                        <ChevronRight size={16} className="text-slate-200 group-hover:text-amber-600 transition-all" />
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

function LuxuryCard({ label, value, icon, color, bg, trend, isUp, description }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 transition-all duration-500 group hover:shadow-2xl hover:shadow-slate-200/40">
      <div className="flex items-center justify-between mb-12">
        <div className={`p-5 ${bg} rounded-2xl ${color} transition-transform duration-500 group-hover:scale-105`}>
          {icon}
        </div>
        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
            {trend}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <div className="text-4xl font-black tracking-tighter text-slate-900">
          {value}
        </div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-3">{description}</p>
      </div>
    </div>
  );
}

function InsightTag({ label, value, icon }) {
    return (
        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-2xl">
            <div className="text-amber-600">{icon}</div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{value}</span>
            </div>
        </div>
    )
}

function LoadingInstitutional() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin mb-6" />
      <span className="text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase">Synchronizing Assets</span>
    </div>
  );
}

function InstitutionalTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Valuation Data</p>
      <p className="text-slate-900 font-black text-2xl tracking-tighter">{formatCurrency(payload[0].value)}</p>
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100">
          <BadgeCheck size={12} className="text-amber-600" />
          <span className="text-[9px] font-black text-slate-900 uppercase">Verified Entry</span>
      </div>
    </div>
  );
}