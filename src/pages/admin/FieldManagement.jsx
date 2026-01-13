import React, { useState, useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus, Edit, Trash2, X, MapPin, DollarSign, UploadCloud, 
  ChevronDown, Eye, Search, Filter, Loader2, Sparkles
} from "lucide-react";

import {
  getFields,
  createField,
  updateField,
  deleteField,
  getVenuesForSelect
} from "../../services/admin/field.service";

/* =========================
   SCHEMATIC & CONSTANTS
========================= */
const schema = z.object({
  venue_id: z.coerce.number().min(1, "Wajib memilih venue"),
  name: z.string().min(2, "Nama lapangan minimal 2 karakter"),
  type: z.enum(["futsal", "badminton", "basket", "tennis"]),
  price: z.coerce.number().min(1000, "Harga minimal Rp 1.000"),
  status: z.enum(["active", "inactive"]),
  image: z.any().optional(),
});

const TYPE_CONFIG = {
  futsal: { label: "Futsal", color: "bg-emerald-500", icon: "⚽" },
  badminton: { label: "Badminton", color: "bg-blue-500", icon: "🏸" },
  basket: { label: "Basket", color: "bg-orange-500", icon: "🏀" },
  tennis: { label: "Tennis", color: "bg-lime-500", icon: "🎾" },
};

export default function AdminFieldPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({ venue: "", type: "", status: "" });
  const [sort, setSort] = useState({ key: "name", asc: true });
  const [page, setPage] = useState(1);
  const perPage = 8;

  // --- DATA FETCHING ---
  const { data: fields = [], isLoading: fieldsLoading } = useQuery({ 
    queryKey: ["fields"], 
    queryFn: getFields 
  });
  const { data: venues = [] } = useQuery({ 
    queryKey: ["venues"], 
    queryFn: getVenuesForSelect 
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "futsal", status: "active", price: 0 },
  });

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: (payload) => editing ? updateField(editing.id, payload) : createField(payload),
    onSuccess: () => {
      qc.invalidateQueries(["fields"]);
      toast.success(editing ? "Lapangan diperbarui!" : "Lapangan baru ditambahkan!");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal menyimpan data"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteField,
    onSuccess: () => {
      qc.invalidateQueries(["fields"]);
      toast.success("Lapangan dihapus selamanya.");
    },
  });

  // --- HELPERS ---
  const getImageUri = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_STORAGE_URL}/${img}`;
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });
    saveMutation.mutate(formData);
  };

  // --- FILTER & SORT ENGINE ---
  const processedFields = useMemo(() => {
    let result = [...fields];

    // Search
    if (searchTerm) {
      result = result.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Advanced Filters
    if (filters.venue) result = result.filter(f => f.venue?.id === Number(filters.venue));
    if (filters.type) result = result.filter(f => f.type === filters.type);
    if (filters.status) result = result.filter(f => f.status === filters.status);

    // Sorting
    result.sort((a, b) => {
      let valA = a[sort.key], valB = b[sort.key];
      if (typeof valA === 'string') return sort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sort.asc ? valA - valB : valB - valA;
    });

    return result;
  }, [fields, filters, sort, searchTerm]);

  const paginated = processedFields.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(processedFields.length / perPage);

  const openModal = (field = null) => {
    setEditing(field);
    if (field) {
      reset({ 
        venue_id: field.venue?.id, 
        name: field.name, 
        type: field.type, 
        price: field.price, 
        status: field.status 
      });
      setPreview(getImageUri(field.image));
    } else {
      reset({ venue_id: "", name: "", type: "futsal", price: 0, status: "active" });
      setPreview(null);
    }
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); reset(); setPreview(null); };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 font-sans animate-in fade-in duration-500">
      <Toaster position="bottom-center" />
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 p-4 rounded-[2rem] shadow-2xl rotate-3">
             <Sparkles className="text-cyan-400" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
              ARENA<span className="text-cyan-500"> HUB</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Court Inventory System v2.0</p>
          </div>
        </div>
        
        <button 
          onClick={() => openModal()} 
          className="group flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-cyan-600 transition-all hover:-translate-y-1 active:scale-95 italic"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> ADD NEW COURT
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative col-span-1 lg:col-span-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search court name..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 font-bold text-sm outline-none"
          />
        </div>
        <select value={filters.venue} onChange={e => setFilters(f => ({...f, venue: e.target.value}))} className="filter-input">
          <option value="">All Venues</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="filter-input">
          <option value="">All Sports</option>
          {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="filter-input">
          <option value="">Status: All</option>
          <option value="active">🟢 Active</option>
          <option value="inactive">🔴 Inactive</option>
        </select>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {fieldsLoading ? (
           <div className="p-32 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-cyan-500" size={48} />
              <p className="font-black text-slate-300 italic tracking-widest uppercase text-xs">Loading Inventory...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6 text-left">Preview</th>
                  <th className="px-8 py-6 text-left cursor-pointer hover:text-cyan-500" onClick={() => setSort({key: "name", asc: !sort.asc})}>
                    Court Name <ChevronDown size={14} className={`inline ${sort.key==="name" && !sort.asc ? "rotate-180" : ""}`} />
                  </th>
                  <th className="px-8 py-6 text-center">Category</th>
                  <th className="px-8 py-6 text-right cursor-pointer hover:text-cyan-500" onClick={() => setSort({key: "price", asc: !sort.asc})}>
                    Rate/Hr <ChevronDown size={14} className={`inline ${sort.key==="price" && !sort.asc ? "rotate-180" : ""}`} />
                  </th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(f => (
                  <tr key={f.id} className="group hover:bg-cyan-50/20 transition-all cursor-pointer" onClick={() => setDetailModal(f)}>
                    <td className="px-8 py-5">
                      <div className="relative w-24 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500">
                        {f.image ? (
                           <img src={getImageUri(f.image)} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-300">NO IMG</div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900 text-base">{f.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        <MapPin size={10} className="text-cyan-500"/> {f.venue?.name || "Global"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${TYPE_CONFIG[f.type]?.color} shadow-lg shadow-opacity-20`}>
                        {TYPE_CONFIG[f.type]?.icon} {f.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-800 italic">
                      Rp {f.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ring-1 ${f.status === 'active' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openModal(f); }} className="p-3 bg-white border border-slate-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl shadow-sm transition-all"><Edit size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); window.confirm("Hapus lapangan ini?") && deleteMutation.mutate(f.id); }} className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-sm transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PRO */}
        <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
           <p className="text-xs font-bold text-slate-400">SHOWING {paginated.length} OF {processedFields.length} COURTS</p>
           <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white disabled:opacity-30 transition-all font-black text-xs uppercase italic">Prev</button>
              <div className="flex items-center px-4 font-black text-slate-900 italic text-sm">{page} / {totalPages}</div>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white disabled:opacity-30 transition-all font-black text-xs uppercase italic">Next</button>
           </div>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setDetailModal(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: 'spring', damping: 25 }}
              className="relative bg-white h-full w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative h-72">
                <img src={getImageUri(detailModal.image)} className="w-full h-full object-cover" />
                <button onClick={() => setDetailModal(null)} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all"><X size={24}/></button>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                   <span className={`px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-2 inline-block ${TYPE_CONFIG[detailModal.type]?.color}`}>{detailModal.type}</span>
                   <h2 className="text-3xl font-black text-white italic uppercase">{detailModal.name}</h2>
                </div>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hourly Rate</p>
                       <p className="text-xl font-black text-slate-900 italic">Rp {detailModal.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                       <p className="text-xl font-black text-emerald-600 uppercase italic">{detailModal.status}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-6 border-2 border-dashed border-slate-100 rounded-3xl">
                    <MapPin className="text-cyan-500 shrink-0" />
                    <div>
                       <p className="text-xs font-black text-slate-900 uppercase italic">{detailModal.venue?.name}</p>
                       <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed">{detailModal.venue?.address || "No address data available for this location."}</p>
                    </div>
                 </div>
                 <button onClick={() => { openModal(detailModal); setDetailModal(null); }} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black italic uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Edit Court Data</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT MODAL GLASS */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl z-10"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase italic italic">
                {editing ? "MODIFY" : "NEW"} <span className="text-cyan-500">COURT</span>
              </h2>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IMAGE UPLOAD AREA */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Court Media Coverage</label>
                    <div 
                      className="group relative border-4 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-200 hover:bg-cyan-50/30 transition-all overflow-hidden"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {preview ? (
                        <div className="relative w-full h-48">
                           <img src={preview} className="w-full h-full object-cover rounded-2xl shadow-xl" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                              <UploadCloud className="text-white" size={40} />
                           </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <UploadCloud size={48} className="text-slate-200 mb-4 mx-auto group-hover:text-cyan-500 transition-colors" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drop photo or Click to select</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => { const f = e.target.files[0]; setValue("image", f); setPreview(URL.createObjectURL(f)); }} />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Select Location Venue</label>
                    <select {...register("venue_id")} className={`input-field ${errors.venue_id ? 'border-rose-500' : ''}`}>
                      <option value="">Choose Venue...</option>
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Court Name Identifier</label>
                    <input {...register("name")} placeholder="Ex: Central Futsal A1" className={`input-field ${errors.name ? 'border-rose-500' : ''}`}/>
                  </div>
                  <div>
                    <label className="input-label">Sport Category</label>
                    <select {...register("type")} className="input-field">
                      {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Hourly Rental Rate (IDR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 font-black" size={18} />
                      <input type="number" {...register("price")} className={`input-field pl-12 ${errors.price ? 'border-rose-500' : ''}`}/>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="input-label">Inventory Status</label>
                    <div className="flex gap-4">
                       <label className="flex-1 cursor-pointer">
                          <input type="radio" value="active" {...register("status")} className="sr-only peer" />
                          <div className="p-4 rounded-2xl border-2 border-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 text-center font-black text-[10px] uppercase tracking-widest transition-all">Active</div>
                       </label>
                       <label className="flex-1 cursor-pointer">
                          <input type="radio" value="inactive" {...register("status")} className="sr-only peer" />
                          <div className="p-4 rounded-2xl border-2 border-slate-50 peer-checked:border-slate-900 peer-checked:bg-slate-100 text-center font-black text-[10px] uppercase tracking-widest transition-all">Inactive</div>
                       </label>
                    </div>
                  </div>
                  <div className="col-span-1 flex flex-col justify-end">
                      <button type="submit" disabled={saveMutation.isPending} className="w-full bg-slate-950 text-cyan-400 py-5 rounded-[2rem] font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-cyan-600 hover:text-white transition-all active:scale-95 disabled:bg-slate-300">
                        {saveMutation.isPending ? "Syncing..." : "Save Court"}
                      </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block; }
        .input-field { @apply w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-black text-slate-900 placeholder:text-slate-300; }
        .filter-input { @apply bg-slate-50 border-none rounded-xl px-4 py-3 font-black text-xs uppercase italic text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500; }
      `}</style>
    </div>
  );
}