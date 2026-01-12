import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getFields } from "../../services/admin/field.service";
import scheduleService from "../../services/admin/schedule.service";
import { 
  Plus, Trash2, Loader2, Search, Calendar, 
  Clock, MapPin, CheckCircle2, 
  Zap, Filter, Layers, ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSchedulePage() {
  const queryClient = useQueryClient();
  const [selectedField, setSelectedField] = useState("");
  const [genDate, setGenDate] = useState(new Date().toISOString().split("T")[0]);
  const [startH, setStartH] = useState(8);
  const [endH, setEndH] = useState(22);
  const [searchText, setSearchText] = useState("");

  const { data: fieldsData } = useQuery({ queryKey: ["admin", "fields"], queryFn: getFields });
  const { data: schedulesData, isLoading: sLoading } = useQuery({ queryKey: ["admin", "schedules"], queryFn: scheduleService.getSchedules });

  const fields = useMemo(() => fieldsData?.data || fieldsData || [], [fieldsData]);
  const schedules = useMemo(() => schedulesData?.data || schedulesData || [], [schedulesData]);

  useEffect(() => {
    if (selectedField && fields.length > 0) {
      const field = fields.find(f => String(f.id) === String(selectedField));
      if (field?.venue) {
        setStartH(parseInt(field.venue.open_time?.split(":")[0]) || 8);
        setEndH(parseInt(field.venue.close_time?.split(":")[0]) || 22);
      }
    }
  }, [selectedField, fields]);

  const genMutation = useMutation({
    mutationFn: scheduleService.generateSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "schedules"]);
      toast.success("Timeline Generated", { border: '1px solid #E2E8F0', borderRadius: '12px' });
    },
  });

  const delMutation = useMutation({
    mutationFn: scheduleService.deleteSchedule,
    onSuccess: () => queryClient.invalidateQueries(["admin", "schedules"]),
  });

  const filteredSchedules = schedules.filter(s => 
    s.field?.name.toLowerCase().includes(searchText.toLowerCase()) || 
    s.field?.venue?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans">
      <Toaster position="bottom-right" />
      
      <div className="max-w-7xl mx-auto">
        
        {/* --- MINIMALIST HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
              <div className="w-6 h-[1.5px] bg-indigo-500" /> Administrative Hub
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              Schedule<span className="text-slate-300 font-light italic">Sync</span>
            </h1>
          </div>
          
          <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="px-4 py-2 text-right border-r border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Active Slots</p>
              <p className="text-lg font-black text-slate-800 leading-none">{filteredSchedules.length}</p>
            </div>
            <div className="px-4 py-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </header>

        {/* --- GENERATOR SECTION (SOFT & BLENDED) --- */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] p-8 md:p-10 mb-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Automated Slot Engine</h3>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Generate daily schedules based on venue hours.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Resource</label>
              <select 
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Choose Arena...</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.venue?.name} — {f.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Date</label>
              <input 
                type="date" value={genDate} onChange={(e) => setGenDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
              />
            </div>

            <div className="lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hours</label>
              <div className="flex bg-slate-50 rounded-xl border border-slate-100 items-center overflow-hidden">
                <input type="number" value={startH} onChange={(e) => setStartH(parseInt(e.target.value))} className="w-full bg-transparent py-4 text-center font-black text-slate-800 outline-none hover:bg-white transition-colors" />
                <span className="text-slate-300 font-bold px-1">/</span>
                <input type="number" value={endH} onChange={(e) => setEndH(parseInt(e.target.value))} className="w-full bg-transparent py-4 text-center font-black text-slate-800 outline-none hover:bg-white transition-colors" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#4338ca' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => genMutation.mutate({ field_id: selectedField, date: genDate, start_hour: startH, end_hour: endH })}
                disabled={genMutation.isPending}
                className="w-full h-[58px] bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:bg-slate-200 disabled:shadow-none transition-all"
              >
                {genMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Initialize"}
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* --- DATA TABLE AREA --- */}
        <div className="space-y-4">
          <div className="relative group max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search resources..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-200/60 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Schedule</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Arena</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {sLoading ? (
                    <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Syncing...</td></tr>
                  ) : filteredSchedules.map((s) => (
                    <motion.tr layout key={s.id} className="group hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-700">
                          {new Date(s.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="inline-flex mt-1 items-center gap-2 text-slate-400 font-mono font-medium text-[11px]">
                          {new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — {new Date(s.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-700 text-sm">{s.field?.name}</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <MapPin size={10} /> {s.field?.venue?.name}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          s.status === 'booked' 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                          : 'bg-slate-100 text-slate-500'
                        }`}>
                          {s.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => delMutation.mutate(s.id)}
                          disabled={s.status === 'booked'}
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}