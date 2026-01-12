import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { 
  Plus, Edit2, Trash2, X, Search, 
  MapPin, Activity, DollarSign, Filter, ChevronRight
} from "lucide-react";
import { 
  getFields, createField, updateField, deleteField, getVenuesForSelect 
} from "../../services/admin/field.service";

const fieldSchema = z.object({
  venue_id: z.coerce.number().min(1, "Venue is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["futsal", "badminton", "basket", "tennis"]),
  price: z.coerce.number().min(0),
  status: z.enum(["active", "inactive"]),
});

export default function AdminFieldPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: fields = [], isLoading } = useQuery({ 
    queryKey: ["admin", "fields"], 
    queryFn: getFields 
  });
  
  const { data: venues = [] } = useQuery({ 
    queryKey: ["admin", "venues-select"], 
    queryFn: getVenuesForSelect 
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: { type: "futsal", status: "active", price: 0 }
  });

  const mutation = useMutation({
    mutationFn: (data) => editingField ? updateField(editingField.id, data) : createField(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "fields"]);
      toast.success("Database synchronized successfully");
      closeModal();
    },
  });

  const openModal = (field = null) => {
    setEditingField(field);
    if (field) {
      reset({
        venue_id: field.venue_id,
        name: field.name,
        type: field.type,
        price: field.price,
        status: field.status,
      });
    } else {
      reset({ venue_id: "", name: "", type: "futsal", price: 0, status: "active" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    reset();
    setEditingField(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      <Toaster position="bottom-right" />
      
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
              <Activity size={14} /> Admin Console
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic">ARENA.<span className="text-gray-300">HUB</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="pl-12 pr-6 py-4 bg-gray-100 border-none rounded-2xl w-80 text-sm font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => openModal()}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shadow-2xl shadow-black/10 active:scale-95"
            >
              <Plus size={18} /> New Entry
            </button>
          </div>
        </header>

        {/* Minimalist Table */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resource Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                 <tr><td colSpan="5" className="p-20 text-center animate-pulse font-bold text-gray-300">SYNCING DATA...</td></tr>
              ) : fields.map((f) => (
                <tr key={f.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                        {f.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-base tracking-tight">{f.name}</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 mt-0.5">
                          <MapPin size={12} /> {f.venue?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xs font-black uppercase px-3 py-1 bg-gray-100 rounded-lg text-gray-500">
                      {f.type}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-right font-mono font-bold text-sm">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(f.price)}
                    <span className="block text-[10px] font-black text-gray-300 uppercase tracking-tighter">per hour</span>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      f.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {f.status}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(f)} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-gray-100 text-gray-400 hover:text-black">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => window.confirm("Delete?") && deleteField(f.id)} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-gray-100 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ultra Clean Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              className="relative w-full max-w-2xl bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] p-12 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black italic tracking-tighter">{editingField ? 'EDIT RESOURCE' : 'NEW RESOURCE'}</h2>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global Field Identification</p>
                </div>
                <button onClick={closeModal} className="p-4 bg-gray-50 rounded-full hover:rotate-90 transition-all"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Venue Assignment</label>
                    <select {...register("venue_id")} className="w-full bg-gray-50 border-none p-5 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all">
                      <option value="">Select Location</option>
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Arena Designation</label>
                    <input {...register("name")} className="w-full bg-gray-50 border-none p-5 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="e.g. ALPHA_01" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {["futsal", "badminton", "basket", "tennis"].map(t => (
                        <button key={t} type="button" onClick={() => setValue("type", t)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${watch("type") === t ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Base Price (IDR)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input type="number" {...register("price")} className="w-full bg-gray-50 border-none py-5 pl-12 pr-6 rounded-2xl font-mono font-bold text-lg focus:ring-2 focus:ring-black/5 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2rem]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Availability Status</p>
                    <p className="text-sm font-bold tracking-tight">Set resource to {watch("status") === 'active' ? 'Active' : 'Maintenance'}</p>
                  </div>
                  <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {['active', 'inactive'].map((s) => (
                      <button key={s} type="button" onClick={() => setValue("status", s)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${watch("status") === s ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-300'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={mutation.isPending}
                  className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-gray-900 transition-all flex justify-center items-center gap-3 active:scale-[0.99]"
                >
                  {mutation.isPending ? "SYNCHRONIZING..." : "CONFIRM DATA ENTRY"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}