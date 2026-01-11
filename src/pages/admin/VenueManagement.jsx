import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { LucidePlus, LucideEdit, LucideTrash, LucideX, LucideImageOff } from "lucide-react";
import { getVenues, createVenue, updateVenue, deleteVenue } from "../../services/admin/venue.service";

const VENUE_QUERY_KEY = ["admin", "venues"];

// Validasi Schema
const venueSchema = z.object({
  name: z.string().min(2, "Minimal 2 karakter"),
  address: z.string().min(5, "Alamat terlalu pendek"),
  description: z.string().optional().nullable(),
  open_time: z.string().min(1, "Jam buka wajib diisi"),
  close_time: z.string().min(1, "Jam tutup wajib diisi"),
  image: z.any().optional(),
}).refine((data) => data.close_time > data.open_time, {
  message: "Jam tutup harus lebih lambat dari jam buka",
  path: ["close_time"],
});

export default function AdminVenuePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- Data Fetching ---
  const { data, isLoading, isError } = useQuery({
    queryKey: VENUE_QUERY_KEY,
    queryFn: getVenues,
  });
  const venues = data ?? [];

  // --- Form Setup ---
  const { register, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(venueSchema),
  });

  // --- Image Preview Logic ---
  const watchImage = watch("image");
  useEffect(() => {
    if (watchImage && watchImage[0] instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(watchImage[0]);
    }
  }, [watchImage]);

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.success("Venue berhasil ditambahkan!");
      closeModal();
    },
    onError: (err) => handleServerError(err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateVenue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.success("Venue berhasil diperbarui!");
      closeModal();
    },
    onError: (err) => handleServerError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUE_QUERY_KEY });
      toast.success("Venue dihapus!");
    },
  });

  const handleServerError = (err) => {
    const serverErrors = err.response?.data?.errors;
    if (serverErrors) {
      Object.keys(serverErrors).forEach((key) => {
        setError(key, { message: serverErrors[key][0] });
      });
    }
    toast.error(err.response?.data?.message || "Terjadi kesalahan");
  };

  // --- Modal Handlers ---
  const openCreateModal = () => {
    setEditingVenue(null);
    setImagePreview(null);
    reset({ name: "", address: "", description: "", open_time: "", close_time: "", image: null });
    setModalOpen(true);
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
      image: null,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    reset();
  };

  const onSubmit = (formData) => {
    const payload = { ...formData, image: formData.image?.[0] || null };
    if (editingVenue) {
      updateMutation.mutate({ id: editingVenue.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Venue Management</h2>
          <p className="text-sm text-gray-500">Kelola lokasi GOR dan fasilitas olahraga</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all active:scale-95"
        >
          <LucidePlus size={20} /> Tambah Venue
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 animate-pulse">Memuat data venue...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="p-4 text-xs uppercase tracking-wider font-bold text-gray-500">Detail Venue</th>
                <th className="p-4 text-xs uppercase tracking-wider font-bold text-gray-500">Alamat & Deskripsi</th>
                <th className="p-4 text-xs uppercase tracking-wider font-bold text-gray-500 text-center">Jam Operasional</th>
                <th className="p-4 text-xs uppercase tracking-wider font-bold text-gray-500 text-center">Gambar</th>
                <th className="p-4 text-xs uppercase tracking-wider font-bold text-gray-500 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {venues.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{v.name}</div>
                    <div className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full inline-block mt-1 font-mono uppercase">
                      {v.slug}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm text-gray-600 line-clamp-1 italic mb-1">{v.description || "Tanpa deskripsi"}</div>
                    <div className="text-xs text-gray-400 line-clamp-2">{v.address}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                      {v.open_time?.slice(0, 5)} - {v.close_time?.slice(0, 5)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {v.image ? (
                        <img 
                          src={v.image} 
                          alt={v.name} 
                          className="w-14 h-14 object-cover rounded-lg ring-1 ring-gray-200 shadow-sm" 
                          onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Error"; }}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                          <LucideImageOff size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditModal(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <LucideEdit size={18} />
                      </button>
                      <button
                        onClick={() => confirm("Hapus venue ini?") && deleteMutation.mutate(v.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <LucideTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900">{editingVenue ? "Edit Venue" : "Venue Baru"}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><LucideX size={20} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama GOR / Venue</label>
                    <input {...register("name")} className={`w-full mt-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${errors.name ? "border-red-500 bg-red-50" : "border-gray-200"}`} placeholder="Contoh: GOR Merdeka" />
                    {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Alamat Lengkap</label>
                    <textarea {...register("address")} rows="2" className={`w-full mt-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${errors.address ? "border-red-500 bg-red-50" : "border-gray-200"}`} placeholder="Alamat lengkap..." />
                    {errors.address && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Deskripsi (Opsional)</label>
                    <textarea {...register("description")} className="w-full mt-1 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="Ceritakan tentang fasilitas di sini..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Jam Buka</label>
                      <input type="time" {...register("open_time")} className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Jam Tutup</label>
                      <input type="time" {...register("close_time")} className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500" />
                      {errors.close_time && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.close_time.message}</p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Foto Venue</label>
                    <input type="file" {...register("image")} accept="image/*" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
                    {imagePreview && (
                      <div className="mt-4 flex justify-center">
                        <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl shadow-md border-4 border-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">Batal</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-[2] bg-cyan-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:bg-gray-400 transition-all">
                    {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : editingVenue ? "Simpan Perubahan" : "Buat Venue"}
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