import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  LucidePlus, LucideEdit, LucideTrash, LucideX, 
  LucideImageOff, LucideSearch, LucideMapPin, 
  LucideInfo, LucideUploadCloud 
} from "lucide-react";
import { getVenues, createVenue, updateVenue, deleteVenue } from "../../services/admin/venue.service";
import { useAuthStore } from "../../store/auth.store";

const VENUE_QUERY_KEY = ["admin", "venues"];

const venueSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  description: z.string().min(10, "Berikan deskripsi singkat minimal 10 karakter"),
  open_time: z.string().min(1, "Jam buka wajib diisi"),
  close_time: z.string().min(1, "Jam tutup wajib diisi"),
  image: z.any().optional(),
}).refine((data) => data.close_time > data.open_time, {
  message: "Jam tutup harus setelah jam buka",
  path: ["close_time"],
});

export default function AdminVenuePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: VENUE_QUERY_KEY,
    queryFn: getVenues,
  });

  const { register, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(venueSchema),
  });

  // --- Image Preview Logic ---
  const watchImage = watch("image");
  useEffect(() => {
    if (watchImage?.[0] instanceof File) {
      const objectUrl = URL.createObjectURL(watchImage[0]);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [watchImage]);

  // --- Mutations ---
  const createMutation = useMutation({ mutationFn: createVenue });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => updateVenue(id, payload) });
  const deleteMutation = useMutation({ mutationFn: deleteVenue });

  const handleServerError = (err) => {
    const serverErrors = err.response?.data?.errors;
    if (serverErrors) {
      Object.keys(serverErrors).forEach((key) => {
        setError(key, { message: serverErrors[key][0] });
      });
    }
  };

  // --- IMPROVED SUBMIT HANDLER ---
  const onSubmit = async (formData) => {
    if (!currentUserId) {
      toast.error("SESI BERAKHIR. SILAKAN LOGIN ULANG.", { id: "auth-err" });
      return;
    }

    const finalPayload = { ...formData, owner_id: currentUserId };

    // Bungkus proses dalam satu variabel promise
    const venueProcess = async () => {
      if (editingVenue) {
        return await updateMutation.mutateAsync({ id: editingVenue.id, payload: finalPayload });
      } else {
        return await createMutation.mutateAsync(finalPayload);
      }
    };

    toast.promise(
      venueProcess(),
      {
        loading: editingVenue ? '🛠️ Memperbarui venue...' : '🚀 Menerbitkan venue baru...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
          closeModal();
          return editingVenue ? 'Update Berhasil!' : 'Venue Berhasil Terbit!';
        },
        error: (err) => {
          handleServerError(err);
          return err.response?.data?.message || 'Gagal memproses data';
        },
      },
      { 
        id: "venue-mutation",
        style: { minWidth: '250px' } 
      }
    );
  };

  // --- IMPROVED DELETE HANDLER ---
  const handleDelete = async (id) => {
    toast.promise(
      deleteMutation.mutateAsync(id),
      {
        loading: '🗑️ Menghapus data...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
          return 'Venue telah dihapus.';
        },
        error: 'Gagal menghapus venue.',
      },
      { id: "delete-action" }
    );
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setImagePreview(venue.image);
    reset({
      name: venue.name,
      address: venue.address,
      description: venue.description || "",
      open_time: venue.open_time?.slice(0, 5),
      close_time: venue.close_time?.slice(0, 5),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVenue(null);
    setImagePreview(null);
    reset();
  };

  const filteredVenues = useMemo(() => {
    return (data || []).filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
            Venue<span className="text-cyan-500">.Management</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-500 inline-block"></span> 
            Operator: <span className="text-slate-900 font-black underline decoration-cyan-500">{user?.name || "Admin"}</span>
          </p>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingVenue(null); reset(); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl transition-all group"
        >
          <LucidePlus size={20} className="group-hover:rotate-90 transition-transform" /> 
          REGISTER NEW VENUE
        </motion.button>
      </div>

      {/* SEARCH */}
      <div className="relative group max-w-2xl">
        <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Cari nama GOR atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm font-bold placeholder:font-medium"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Venue Identity</th>
                  <th className="px-8 py-6">Status & Details</th>
                  <th className="px-8 py-6 text-center">Operating Hours</th>
                  <th className="px-8 py-6 text-center">Visual</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredVenues.map((v) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      key={v.id} 
                      className="hover:bg-cyan-50/30 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-lg group-hover:text-cyan-600 transition-colors">{v.name}</div>
                        <div className="text-[10px] bg-slate-900 text-cyan-400 px-3 py-1 rounded-lg inline-block mt-2 font-black uppercase italic">
                          {v.slug}
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-sm">
                        <div className="flex items-start gap-2 mb-2">
                          <LucideInfo size={14} className="text-cyan-500 mt-1 shrink-0" />
                          <p className="text-sm text-slate-600 line-clamp-1 italic font-medium">{v.description || "No info."}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideMapPin size={14} className="text-slate-400 mt-1 shrink-0" />
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">{v.address}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-black text-xs">
                          {v.open_time?.slice(0, 5)} — {v.close_time?.slice(0, 5)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {v.image ? (
                          <img src={v.image} alt="" className="w-14 h-14 mx-auto object-cover rounded-xl shadow-md border-2 border-white" />
                        ) : (
                          <div className="w-14 h-14 mx-auto bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200">
                             <LucideImageOff className="text-slate-200" size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(v)} className="p-2.5 bg-white border border-slate-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                            <LucideEdit size={18} />
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Hapus venue ini secara permanen?')) handleDelete(v.id) }} 
                            className="p-2.5 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                          >
                            <LucideTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }} 
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl p-8 z-10 border border-white my-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${editingVenue ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                    {editingVenue ? <LucideEdit size={24}/> : <LucidePlus size={24}/>}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
                      {editingVenue ? "Modify Database" : "Register Venue"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Admin Configuration Portal</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-3 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full transition-all">
                   <LucideX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Venue Name</label>
                    <input {...register("name")} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 font-bold transition-all" placeholder="Contoh: GOR Sudirman" />
                    {errors.name && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Full Address</label>
                    <textarea {...register("address")} rows="2" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-cyan-500 font-bold" placeholder="Alamat lengkap..." />
                    {errors.address && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Short Description</label>
                    <textarea {...register("description")} rows="3" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-cyan-500 font-medium" placeholder="Fasilitas, keunggulan, dll..." />
                    {errors.description && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.description.message}</p>}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2 mb-2 block">Open Time</label>
                      <input type="time" {...register("open_time")} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2 mb-2 block">Close Time</label>
                      <input type="time" {...register("close_time")} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black" />
                    </div>
                    {errors.close_time && <p className="col-span-2 text-rose-500 text-[10px] ml-2 font-black italic">{errors.close_time.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Cover Image</label>
                    <input type="file" {...register("image")} accept="image/*" className="hidden" id="venue-image" />
                    <label htmlFor="venue-image" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-4 bg-slate-50 hover:bg-cyan-50/50 cursor-pointer transition-all h-[160px] group">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-sm" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                             <p className="text-white text-[10px] font-black uppercase">Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <LucideUploadCloud className="text-slate-300 mx-auto mb-2 group-hover:text-cyan-500 transition-colors" size={40} />
                          <span className="text-[10px] font-black text-slate-400 uppercase">Drop or click to upload</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending} 
                      className="flex-[2] bg-slate-900 text-cyan-400 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-900/10 hover:bg-cyan-600 hover:text-white disabled:opacity-50 transition-all"
                    >
                      {editingVenue ? "Update Records" : "Publish Venue"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}