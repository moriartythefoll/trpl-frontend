import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { 
  LucidePlus, LucideEdit, LucideTrash, LucideX, 
  LucideImageOff, LucideSearch, LucideMapPin, 
  LucideClock, LucideInfo, LucideUploadCloud 
} from "lucide-react";
import { getVenues, createVenue, updateVenue, deleteVenue } from "../../services/admin/venue.service";

const VENUE_QUERY_KEY = ["admin", "venues"];

// Validasi Schema - Diperketat
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

  // --- Data Fetching ---
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: VENUE_QUERY_KEY,
    queryFn: getVenues,
  });

  // --- Search Logic ---
  const filteredVenues = useMemo(() => {
    const venues = data ?? [];
    return venues.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // --- Form Setup ---
  const { register, handleSubmit, reset, watch, setError, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(venueSchema),
  });

  // --- Optimized Image Preview ---
  const watchImage = watch("image");
  useEffect(() => {
    if (watchImage && watchImage[0] instanceof File) {
      const objectUrl = URL.createObjectURL(watchImage[0]);
      setImagePreview(objectUrl);
      // Clean up memory
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [watchImage]);

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.success("Venue baru berhasil diterbitkan!");
      closeModal();
    },
    onError: (err) => handleServerError(err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateVenue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.success("Perubahan venue berhasil disimpan!");
      closeModal();
    },
    onError: (err) => handleServerError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVenue,
    onMutate: () => toast.loading("Menghapus venue..."),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.dismiss();
      toast.success("Venue telah dihapus selamanya.");
    },
    onError: () => {
      toast.dismiss();
      toast.error("Gagal menghapus venue.");
    }
  });

  const handleServerError = (err) => {
    const serverErrors = err.response?.data?.errors;
    if (serverErrors) {
      Object.keys(serverErrors).forEach((key) => {
        setError(key, { message: serverErrors[key][0] });
      });
    }
    toast.error(err.response?.data?.message || "Gagal memproses data");
  };

  // --- Handlers ---
  const onSubmit = (data) => {
    // Debug: Pastikan data dari form tertangkap (Opsional)
    console.log("Data siap dikirim ke service:", data);

    if (editingVenue) {
      // Kirim objek mentah 'data', service akan mengurus FormData & _method: PUT
      updateMutation.mutate({ 
        id: editingVenue.id, 
        payload: data 
      });
    } else {
      // Kirim objek mentah 'data' untuk Create
      createMutation.mutate(data);
    }
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

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans animate-in fade-in duration-700">
      <Toaster position="top-right" />

      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
            Venue<span className="text-cyan-500"> Master</span>
          </h1>
          <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-cyan-500 inline-block"></span> 
            Manajemen Lokasi & Fasilitas Olahraga
          </p>
        </div>
        <button
          onClick={() => { setEditingVenue(null); reset(); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-cyan-900/10 transition-all active:scale-95 group"
        >
          <LucidePlus size={20} className="group-hover:rotate-90 transition-transform" /> 
          TAMBAH VENUE BARU
        </button>
      </div>

      {/* 2. FILTER BAR */}
      <div className="relative group max-w-2xl">
        <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Cari nama GOR atau alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm font-medium"
        />
      </div>

      {/* 3. MODERN TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">Synchronizing Venues...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Information</th>
                  <th className="px-8 py-6 text-center">Operation Time</th>
                  <th className="px-8 py-6 text-center">Visual</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVenues.length > 0 ? filteredVenues.map((v) => (
                  <tr key={v.id} className="hover:bg-cyan-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 text-lg group-hover:text-cyan-600 transition-colors">{v.name}</div>
                      <div className="text-[10px] bg-slate-900 text-cyan-400 px-3 py-1 rounded-lg inline-block mt-2 font-black uppercase tracking-tighter italic">
                        {v.slug}
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-sm">
                      <div className="flex items-start gap-2 mb-2">
                        <LucideInfo size={14} className="text-cyan-500 mt-1 shrink-0" />
                        <p className="text-sm text-slate-600 line-clamp-1 italic font-medium">{v.description || "No description provided."}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <LucideMapPin size={14} className="text-slate-400 mt-1 shrink-0" />
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{v.address}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-black text-xs">
                        <LucideClock size={14} />
                        {v.open_time?.slice(0, 5)} — {v.close_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        {v.image ? (
                          <div className="relative group/img">
                            <img 
                              src={v.image} 
                              alt={v.name} 
                              className="w-16 h-16 object-cover rounded-2xl ring-4 ring-white shadow-xl group-hover/img:scale-110 transition-transform duration-500" 
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                            <LucideImageOff size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(v)} className="p-3 bg-white border border-slate-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90">
                          <LucideEdit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm(`Hapus permanen ${v.name}? Tindakan ini tidak bisa dibatalkan.`)) {
                              deleteMutation.mutate(v.id);
                            }
                          }}
                          className="p-3 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-90"
                        >
                          <LucideTrash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30 italic font-black text-slate-400 uppercase tracking-widest">
                         <LucideSearch size={48} className="mb-4" />
                         No Venues Found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL CRUD - GLASSMORPHISM STYLE */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeModal} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }} 
              className="relative bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-2xl p-10 z-10 overflow-y-auto max-h-[90vh] border border-white"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-3xl ${editingVenue ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                    {editingVenue ? <LucideEdit size={28}/> : <LucidePlus size={28}/>}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic">
                      {editingVenue ? "Modify Venue" : "Create New Venue"}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">SportCenter Administrative Panel</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full transition-all group">
                   <LucideX size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Venue Official Name</label>
                  <input 
                    {...register("name")} 
                    className={`w-full bg-slate-50 border p-4 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold ${errors.name ? "border-rose-500 bg-rose-50" : "border-slate-100 focus:border-cyan-500"}`} 
                    placeholder="Contoh: GOR Merdeka Jakarta" 
                  />
                  {errors.name && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.name.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Full Address Location</label>
                  <textarea 
                    {...register("address")} 
                    rows="2" 
                    className={`w-full bg-slate-50 border p-4 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold ${errors.address ? "border-rose-500 bg-rose-50" : "border-slate-100 focus:border-cyan-500"}`} 
                    placeholder="Masukkan jalan, kota, dan kode pos..." 
                  />
                  {errors.address && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.address.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Description & Facilities</label>
                  <textarea 
                    {...register("description")} 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium" 
                    placeholder="Fasilitas AC, Kantin, Parkir Luas..." 
                  />
                  {errors.description && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block text-emerald-600">Open Time</label>
                  <input type="time" {...register("open_time")} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black focus:border-emerald-500 outline-none" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block text-rose-600">Close Time</label>
                  <input type="time" {...register("close_time")} className={`w-full bg-slate-50 border p-4 rounded-2xl font-black focus:border-rose-500 outline-none ${errors.close_time ? "border-rose-500" : "border-slate-100"}`} />
                  {errors.close_time && <p className="text-rose-500 text-[10px] mt-2 ml-2 font-black italic">{errors.close_time.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Venue Cover Image</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      {...register("image")} 
                      accept="image/*" 
                      className="hidden" 
                      id="venue-image"
                    />
                    <label 
                      htmlFor="venue-image"
                      className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl p-8 bg-slate-50/50 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all cursor-pointer group"
                    >
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img src={imagePreview} alt="Preview" className="w-full max-h-52 object-cover rounded-2xl shadow-lg border-4 border-white" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-all">
                             <LucideUploadCloud className="text-white" size={40} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <LucideUploadCloud className="text-slate-300 group-hover:text-cyan-500 mb-4 transition-colors" size={48} />
                          <p className="text-sm font-black text-slate-400 group-hover:text-cyan-600 transition-colors uppercase tracking-tighter">Click to upload photo</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-6">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending} 
                    className="flex-[2] bg-slate-900 text-cyan-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-cyan-600 hover:text-white disabled:bg-slate-200 transition-all active:scale-95"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Processing..." : editingVenue ? "Update Venue" : "Publish Venue"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}