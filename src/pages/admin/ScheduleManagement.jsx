import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getFields } from "../../services/admin/field.service";
import scheduleService from "../../services/admin/schedule.service";
import { 
  Trash2, Loader2, Search, Calendar, 
  Clock, MapPin, Zap, Filter, ArrowRight, 
  BarChart3, Activity, AlertCircle, CheckCircle2,
  ChevronDown, X, Layers
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSchedulePage() {
  const queryClient = useQueryClient();
  
  // --- STATES ---
  const [selectedField, setSelectedField] = useState("");
  const [genDate, setGenDate] = useState(new Date().toISOString().split("T")[0]);
  const [startH, setStartH] = useState(8);
  const [endH, setEndH] = useState(22);
  
  const [searchText, setSearchText] = useState("");
  const [timeFilter, setTimeFilter] = useState("today");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // --- DATA FETCHING ---
  const { data: fieldsData } = useQuery({ queryKey: ["admin", "fields"], queryFn: getFields });
  const { data: schedulesData, isLoading: sLoading } = useQuery({ queryKey: ["admin", "schedules"], queryFn: scheduleService.getSchedules });

  const fields = useMemo(() => fieldsData?.data || fieldsData || [], [fieldsData]);
  const schedules = useMemo(() => schedulesData?.data || schedulesData || [], [schedulesData]);

  // Sync Open Hours
  useEffect(() => {
    if (selectedField && fields.length > 0) {
      const field = fields.find(f => String(f.id) === String(selectedField));
      if (field?.venue) {
        setStartH(parseInt(field.venue.open_time?.split(":")[0]) || 8);
        setEndH(parseInt(field.venue.close_time?.split(":")[0]) || 22);
      }
    }
  }, [selectedField, fields]);

  // --- MUTATIONS ---
  const genMutation = useMutation({
    mutationFn: scheduleService.generateSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "schedules"]);
      toast.success("Timeline Generated!", { icon: '🚀', style: { borderRadius: '15px', background: '#0f172a', color: '#fff' }});
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "schedules"]);
      setSelectedIds([]); // Clear selection after delete
    }
  });

  // --- LOGIC: STATS & FILTERS ---
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySchedules = schedules.filter(s => s.start_time.startsWith(todayStr));
    return {
      totalToday: todaySchedules.length,
      bookedToday: todaySchedules.filter(s => s.status === 'booked').length,
      availableToday: todaySchedules.filter(s => s.status === 'available').length,
    };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    return schedules.filter(s => {
      const sDate = new Date(s.start_time).getTime();
      let matchesTime = true;
      if (timeFilter === "today") matchesTime = sDate >= startOfToday && sDate <= endOfToday;
      else if (timeFilter === "upcoming") matchesTime = sDate > endOfToday;
      else if (timeFilter === "past") matchesTime = sDate < startOfToday;

      const searchLower = searchText.toLowerCase();
      const matchesSearch = s.field?.name.toLowerCase().includes(searchLower) || s.field?.venue?.name.toLowerCase().includes(searchLower);
      const matchesField = fieldFilter === "all" || String(s.field_id) === String(fieldFilter);
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesTime && matchesSearch && matchesField && matchesStatus;
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [schedules, searchText, timeFilter, fieldFilter, statusFilter]);

  // --- HANDLERS ---
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'} max-w-md w-full bg-white shadow-2xl rounded-[2rem] flex border border-slate-100 overflow-hidden`}>
        <div className="p-6 flex-1">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Bulk Action</p>
              <p className="text-sm font-black text-slate-900 italic uppercase">Archive {selectedIds.length} Slots?</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-slate-100 w-32">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading(`Archiving ${selectedIds.length} slots...`);
              try {
                await Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)));
                toast.success("Batch Archived Successfully", { id: loadingToast });
              } catch (err) {
                toast.error("Batch Action Failed", { id: loadingToast });
              }
            }}
            className="flex-1 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 transition-colors border-b border-slate-50"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-10 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none italic uppercase mb-2">
              Schedule<span className="text-indigo-600 not-italic">.</span>Engine
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">v2.5 PRO</span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-500" /> System Active
              </span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex flex-col items-center min-w-[140px] shadow-lg shadow-slate-900/20">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Shown</span>
              <span className="text-2xl font-black leading-tight italic">{filteredSchedules.length}</span>
            </div>

            <div className="flex items-center gap-8 px-6 border-l border-slate-100">
              <div className="hidden md:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <BarChart3 size={12} /> Live Load
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.bookedToday / stats.totalToday) * 100 || 0}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-700">{stats.bookedToday}/{stats.totalToday}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Free Slots
                </span>
                <span className="text-xl font-black text-slate-800 tracking-tighter">{stats.availableToday}</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- GENERATOR PANEL --- */}
        <motion.section className="bg-slate-900 rounded-[3rem] p-10 mb-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
             <div className="lg:col-span-4">
                <label className="text-[10px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">Asset Target</label>
                <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} className="w-full bg-slate-800 border-none p-5 rounded-2xl font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none">
                  <option value="">Select Arena...</option>
                  {fields.map(f => <option key={f.id} value={f.id} className="text-slate-900">{f.name}</option>)}
                </select>
             </div>
             <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">Date</label>
                <input type="date" value={genDate} onChange={(e) => setGenDate(e.target.value)} className="w-full bg-slate-800 border-none p-5 rounded-2xl font-bold text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">Hours</label>
                <div className="flex bg-slate-800 rounded-2xl overflow-hidden p-1">
                  <input type="number" value={startH} onChange={(e) => setStartH(parseInt(e.target.value))} className="w-1/2 bg-transparent py-4 text-center font-black outline-none" />
                  <div className="flex items-center text-slate-600 font-bold">/</div>
                  <input type="number" value={endH} onChange={(e) => setEndH(parseInt(e.target.value))} className="w-1/2 bg-transparent py-4 text-center font-black outline-none" />
                </div>
             </div>
             <div className="lg:col-span-2">
                <button 
                  onClick={() => genMutation.mutate({ field_id: selectedField, date: genDate, start_hour: startH, end_hour: endH })} 
                  disabled={genMutation.isPending || !selectedField}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {genMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
                </button>
             </div>
          </div>
        </motion.section>

        {/* --- TABLE ACTIONS & FILTER --- */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex p-1 bg-white rounded-full border border-slate-200 shadow-sm overflow-x-auto">
                {['today', 'upcoming', 'past', 'all'].map((tab) => (
                  <button key={tab} onClick={() => setTimeFilter(tab)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{tab}</button>
                ))}
              </div>
              
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.button 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 bg-rose-500 text-white px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                  >
                    <Trash2 size={14} /> Archive {selectedIds.length}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input type="text" placeholder="Search Venue or Arena..." className="w-full pl-16 pr-8 py-5 bg-white rounded-full border border-slate-200 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm" onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden mb-20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400">
                    <th className="px-10 py-7 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={(e) => setSelectedIds(e.target.checked ? filteredSchedules.filter(s => s.status === 'available').map(s => s.id) : [])} 
                        className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                    </th>
                    <th className="px-6 py-7 tracking-widest">Timeline Distribution</th>
                    <th className="px-10 py-7">
                       <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 lowercase font-bold text-slate-500 w-fit">
                          <Filter size={10} />
                          <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                             <option value="all">All Fields</option>
                             {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                       </div>
                    </th>
                    <th className="px-10 py-7 text-center">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 lowercase font-bold text-slate-500 mx-auto w-fit">
                         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                         </select>
                      </div>
                    </th>
                    <th className="px-10 py-7 text-right">Mgt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {sLoading ? (
                      <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin inline-block text-indigo-500" size={40} /></td></tr>
                    ) : filteredSchedules.map((s) => (
                        <motion.tr 
                          layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                          key={s.id} 
                          className={`group hover:bg-slate-50/80 transition-all ${selectedIds.includes(s.id) ? 'bg-indigo-50/30' : ''}`}
                        >
                          <td className="px-10 py-6 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(s.id)} 
                              disabled={s.status === 'booked'}
                              onChange={() => toggleSelect(s.id)}
                              className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-20" 
                            />
                          </td>
                          <td className="px-6 py-6">
                             <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-xl transition-all ${selectedIds.includes(s.id) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md'}`}>
                                  <Calendar size={18} />
                               </div>
                               <div>
                                 <div className="text-xs font-black text-slate-900 uppercase italic leading-none">{new Date(s.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                                 <div className="text-[10px] font-mono font-black text-indigo-500 mt-1.5">{new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <div className="font-black text-slate-800 text-xs uppercase tracking-tight">{s.field?.name}</div>
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest"><MapPin size={10} /> {s.field?.venue?.name}</div>
                          </td>
                          <td className="px-10 py-6 text-center">
                             <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${s.status === 'booked' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{s.status}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button onClick={() => { setSelectedIds([s.id]); handleBulkDelete(); }} disabled={s.status === 'booked'} className={`p-3 rounded-xl transition-all ${s.status === 'booked' ? 'opacity-20 cursor-not-allowed' : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 size={18} /></button>
                          </td>
                        </motion.tr>
                      ))
                    }
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}