import React, { useState, useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
Plus, Edit, Trash2, X, MapPin, DollarSign, UploadCloud,
ChevronDown, Search, Loader2, Sparkles,
Volleyball
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
  type: z.enum(["futsal", "badminton", "basket", "tennis", "volleyball", "padel"]),
  price: z.coerce.number().min(1000, "Harga minimal Rp 1.000"),
  status: z.enum(["active", "inactive"]),
  image: z.any().optional(),
});

const TYPE_CONFIG = {
  futsal: { label: "Futsal", color: "bg-emerald-500", icon: "⚽" },
  badminton: { label: "Badminton", color: "bg-blue-500", icon: "🏸" },
  basket: { label: "Basketball", color: "bg-orange-500", icon: "🏀" },
  tennis: { label: "Tennis", color: "bg-lime-500", icon: "🎾" },
  volleyball: { label: "Volleyball", color: "bg-purple-500", icon: "🏐" },
  padel : { label: "Padel", color: "bg-pink-500", icon: "🥎" },
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

  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "futsal", status: "active", price: 0 },
  });

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: (payload) => editing ? updateField(editing.id, payload) : createField(payload),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteField,
  });

  useEffect(() => {
    if (editing) {
    reset({
    venue_id: editing.venue?.id || editing.venue_id,
    name: editing.name,
    type: editing.type,
    price: Number(editing.price),
    status: editing.status,
    });
    setPreview(getImageUri(editing.image));
    }
    }, [editing, reset]);

  // --- HANDLERS ---
  const handleFormSubmit = async (data) => {
  // ✅ GANTI DI SINI: Tidak perlu panggil preparePayload
  // Langsung kirim 'data' mentah

  toast.promise(
    saveMutation.mutateAsync(data), // <-- Kirim data mentah ke service
    {
      loading: editing ? '🛠️ Memperbarui lapangan...' : '🚀 Menambahkan lapangan...',
      success: () => {
        qc.invalidateQueries(["fields"]);
        closeModal();
        return editing ? 'Berhasil diperbarui!' : 'Lapangan baru telah aktif!';
      },
      error: (err) => {
        const serverErrors = err.response?.data?.errors;
        if (serverErrors) {
          Object.keys(serverErrors).forEach(key => {
            // ✅ GANTI DI SINI: Mapping jika backend kirim 'price_per_hour'
            const fieldName = key === 'price_per_hour' ? 'price' : key;
            setError(fieldName, { message: serverErrors[key][0] });
          });
        }
        return err.response?.data?.message || "Gagal menyimpan data";
      },
    },
    { id: "field-mutation" }
  );
};

  const handleDelete = (id) => {
    toast.promise(
      deleteMutation.mutateAsync(id),
      {
        loading: '🗑️ Menghapus data...',
        success: () => {
          qc.invalidateQueries(["fields"]);
          return 'Lapangan dihapus selamanya.';
        },
        error: 'Gagal menghapus data.',
      },
      { id: "delete-field" }
    );
  };

  const getImageUri = (img) => {
    if (!img) return null;
    if (typeof img === "string" && img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_BASE_URL}/storage/${img}`;
  };

  const openModal = (field = null) => {
    setEditing(field);
    if (field) {
      reset({ 
        venue_id: field.venue?.id || field.venue_id, 
        name: field.name, 
        type: field.type, 
        price: Number(field.price), 
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

  // --- FILTER & SEARCH ---
  const processedFields = useMemo(() => {
    let result = [...fields];
    if (searchTerm) result = result.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filters.venue) result = result.filter(f => f.venue?.id === Number(filters.venue));
    if (filters.type) result = result.filter(f => f.type === filters.type);
    if (filters.status) result = result.filter(f => f.status === filters.status);

    result.sort((a, b) => {
      let valA = a[sort.key], valB = b[sort.key];
      if (typeof valA === 'string') return sort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sort.asc ? valA - valB : valB - valA;
    });
    return result;
  }, [fields, filters, sort, searchTerm]);

  const paginated = processedFields.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(processedFields.length / perPage) || 1;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4">
          <div className="bg-slate-950 p-4 rounded-[2rem] shadow-2xl rotate-3">
             <Sparkles className="text-cyan-400" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
              Field<span className="text-cyan-500">.Management</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Management Portal v2.0</p>
          </div>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => openModal()} 
          className="group flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black rounded-2xl shadow-xl hover:bg-cyan-600 transition-all italic"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> ADD NEW COURT
        </motion.button>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name..." 
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
           <div className="p-32 flex flex-col items-center gap-4 text-center">
              <Loader2 className="animate-spin text-cyan-500" size={48} />
              <p className="font-black text-slate-300 italic tracking-widest uppercase text-xs">Syncing Database...</p>
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
                <AnimatePresence mode="popLayout">
                  {paginated.map(f => (
                    <motion.tr 
                      layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      key={f.id} className="group hover:bg-cyan-50/20 transition-all cursor-pointer" onClick={() => setDetailModal(f)}
                    >
                      <td className="px-8 py-5">
                        <div className="w-24 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white group-hover:scale-105 transition-all">
                          {f.image ? (
                             <img src={getImageUri(f.image)} className="w-full h-full object-cover" alt="" />
                          ) : (
                             <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-300">NO MEDIA</div>
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
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${TYPE_CONFIG[f.type]?.color || 'bg-slate-400'}`}>
                          {TYPE_CONFIG[f.type]?.icon || '❓'} {TYPE_CONFIG[f.type]?.label || f.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-800 italic">
                        Rp {Number(f.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 ${f.status === 'active' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openModal(f); }} className="p-3 bg-white border border-slate-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl shadow-sm transition-all active:scale-90"><Edit size={18}/></button>
                          <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Hapus lapangan ini?")) handleDelete(f.id); }} className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-sm transition-all active:scale-90"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">PAGE {page} OF {totalPages}</p>
           <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="p-3 px-6 rounded-xl bg-white border border-slate-200 hover:bg-slate-950 hover:text-white disabled:opacity-30 transition-all font-black text-[10px] uppercase italic">Prev</button>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="p-3 px-6 rounded-xl bg-white border border-slate-200 hover:bg-slate-950 hover:text-white disabled:opacity-30 transition-all font-black text-[10px] uppercase italic">Next</button>
           </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setDetailModal(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: 'spring', damping: 25 }}
              className="relative bg-white h-full w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative h-72">
                <img src={getImageUri(detailModal.image)} className="w-full h-full object-cover" alt="" />
                <button onClick={() => setDetailModal(null)} className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all"><X size={24}/></button>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                   <h2 className="text-3xl font-black text-white italic uppercase leading-none">{detailModal.name}</h2>
                </div>
              </div>
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-5 bg-slate-50 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rate/Hr</p>
                       <p className="text-xl font-black text-slate-900 italic">Rp {detailModal.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                       <p className="text-xl font-black text-emerald-600 uppercase italic">{detailModal.status}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-6 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <MapPin className="text-cyan-500 shrink-0" />
                    <div>
                       <p className="text-xs font-black text-slate-900 uppercase italic leading-none">{detailModal.venue?.name}</p>
                       <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">{detailModal.venue?.address || "No detail address."}</p>
                    </div>
                 </div>
                 <button onClick={() => { openModal(detailModal); setDetailModal(null); }} className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black italic uppercase tracking-widest hover:bg-cyan-600 transition-all">Edit Records</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

     {/* FORM MODAL */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
            {/* Backdrop dengan Blur Premium */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeModal} 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white rounded-[4rem] w-full max-w-5xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] z-10 overflow-hidden flex flex-col max-h-[95vh]"
            >
              {/* Header Section dengan Padding Luas */}
              <div className="px-12 py-10 flex justify-between items-start border-b border-slate-100 bg-slate-50/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-1 bg-cyan-500 rounded-full" />
                    <p className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.3em]">Inventory System</p>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                    {editing ? "Edit" : "Register"} <span className="text-slate-400">Court</span>
                  </h2>
                </div>
                <button 
                  onClick={closeModal} 
                  className="group p-5 bg-white border border-slate-100 hover:bg-rose-500 hover:text-white rounded-[2rem] shadow-sm transition-all duration-300"
                >
                  <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Scrollable Body: Grid Layout */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  
                  {/* KIRI (5 Kolom): Media & Status */}
                  <div className="lg:col-span-5 space-y-10">
                    <section>
                      <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-5 block italic">
                        Visual Identity
                      </label>
                      <div 
                        className="group relative border-2 border-dashed border-slate-200 rounded-[3rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-cyan-400 transition-all duration-500 aspect-[4/3] bg-slate-50/50"
                        onClick={() => fileInputRef.current.click()}
                      >
                        {preview ? (
                          <img src={preview} className="w-full h-full object-cover rounded-[2rem] shadow-2xl" alt="" />
                        ) : (
                          <div className="text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                              <UploadCloud size={32} className="text-cyan-500" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Upload Court Image</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => { 
                          const f = e.target.files[0]; 
                          if(f) { setValue("image", f); setPreview(URL.createObjectURL(f)); }
                        }} />
                      </div>
                    </section>

                    <section>
                      <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-5 block italic">
                        Availability Status
                      </label>
                      <div className="flex gap-6 p-3 bg-slate-100/50 rounded-[2.5rem] border border-slate-100">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="active" {...register("status")} className="sr-only peer" />
                          <div className="py-5 rounded-[1.8rem] text-center font-black text-xs uppercase transition-all duration-300 peer-checked:bg-white peer-checked:text-emerald-500 peer-checked:shadow-xl text-slate-400">
                            Active
                          </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="inactive" {...register("status")} className="sr-only peer" />
                          <div className="py-5 rounded-[1.8rem] text-center font-black text-xs uppercase transition-all duration-300 peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-xl text-slate-400">
                            Inactive
                          </div>
                        </label>
                      </div>
                    </section>
                  </div>

                  {/* KANAN (7 Kolom): Details & Action */}
                  <div className="lg:col-span-7 space-y-12">
                    <section className="grid grid-cols-1 gap-10">
                      <div>
                        <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-4 block">
                          Court Name
                        </label>
                        <input {...register("name")} placeholder="e.g. Grand Slam Arena A" className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black text-slate-900 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none text-lg shadow-inner"/>
                        {errors.name && <p className="text-rose-500 text-[10px] font-black mt-3 ml-4 uppercase tracking-tighter">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-4 block">
                          Location / Venue
                        </label>
                        <select {...register("venue_id")} className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black text-slate-900 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none appearance-none shadow-inner">
                          <option value="">Select Venue...</option>
                          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-4 block">
                            Sport Category
                          </label>
                          <select {...register("type")} className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black text-slate-900 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none appearance-none shadow-inner">
                            {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest ml-1 mb-4 block">
                            Hourly Rate
                          </label>
                          <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-cyan-500 text-sm">IDR</div>
                            <input type="number" {...register("price")} className="w-full bg-slate-50 border-none rounded-3xl p-6 pl-16 font-black text-slate-900 focus:ring-4 focus:ring-cyan-500/20 transition-all outline-none shadow-inner text-lg"/>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Action Button */}
                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={saveMutation.isPending} 
                        className="w-full bg-slate-950 text-white py-8 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:bg-slate-200 flex items-center justify-center gap-6"
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="animate-spin" size={28} />
                        ) : (
                          <>
                            <span className="text-lg">Finalize Records</span>
                            <Sparkles size={24} className="text-cyan-400" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .input-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2 block; }
        .input-field { @apply w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-black text-slate-900; }
        .filter-input { @apply bg-slate-50 border-none rounded-xl px-4 py-3 font-black text-[10px] uppercase italic text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500; }
      `}</style>
    </div>
  );
}