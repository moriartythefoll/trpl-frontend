import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { LucidePlus, LucideEdit, LucideTrash, LucideX, LucideLayers } from "lucide-react";
import { getFields, createField, updateField, deleteField, getVenuesForSelect } from "../../services/admin/field.service";

const fieldSchema = z.object({
  venue_id: z.string().min(1, "Wajib pilih Venue"),
  name: z.string().min(2, "Minimal 2 karakter"),
  type: z.enum(["futsal", "badminton", "basket", "tennis"]),
  price_per_hour: z.coerce.number().min(1000, "Harga minimal 1.000"),
  is_active: z.boolean().default(true),
});

export default function AdminFieldPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const { data: fields = [], isLoading } = useQuery({ queryKey: ["admin", "fields"], queryFn: getFields });
  const { data: venues = [] } = useQuery({ queryKey: ["admin", "venues-select"], queryFn: getVenuesForSelect });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(fieldSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => editingField ? updateField(editingField.id, data) : createField(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "fields"]);
      toast.success(editingField ? "Lapangan diperbarui" : "Lapangan ditambah");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal menyimpan"),
  });

  const delMutation = useMutation({
    mutationFn: deleteField,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "fields"]);
      toast.success("Lapangan dihapus");
    },
  });

  const openModal = (field = null) => {
    setEditingField(field);
    reset(field ? { ...field, venue_id: field.venue_id.toString() } : { is_active: true });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); reset(); };

  const formatIDR = (price) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Toaster />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">Data Lapangan</h2>
          <p className="text-sm text-gray-500">Kelola unit lapangan di setiap venue</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">
          <LucidePlus size={20} /> Tambah Lapangan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama & Venue</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Tipe</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Harga / Jam</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold">{f.name}</div>
                  <div className="text-xs text-indigo-600 font-medium">📍 {f.venue?.name}</div>
                </td>
                <td className="p-4 text-sm capitalize"><span className="px-2 py-1 bg-gray-100 rounded-md">{f.type}</span></td>
                <td className="p-4 text-center font-mono text-sm font-semibold text-green-700">{formatIDR(f.price_per_hour)}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${f.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {f.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => openModal(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><LucideEdit size={18} /></button>
                  <button onClick={() => confirm("Hapus lapangan?") && delMutation.mutate(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><LucideTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between mb-6">
                <h3 className="text-lg font-bold">{editingField ? "Edit Lapangan" : "Tambah Lapangan"}</h3>
                <button onClick={closeModal}><LucideX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pilih Venue</label>
                  <select {...register("venue_id")} className="w-full mt-1 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                    <option value="">-- Pilih Venue --</option>
                    {venues.map(v => <option key={v.id} value={v.id.toString()}>{v.name}</option>)}
                  </select>
                  {errors.venue_id && <p className="text-red-500 text-[10px] mt-1">{errors.venue_id.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama Lapangan</label>
                  <input {...register("name")} className="w-full mt-1 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Misal: Lapangan A" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipe</label>
                    <select {...register("type")} className="w-full mt-1 border p-3 rounded-xl outline-none appearance-none">
                      <option value="futsal">Futsal</option>
                      <option value="badminton">Badminton</option>
                      <option value="basket">Basket</option>
                      <option value="tennis">Tennis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Harga / Jam</label>
                    <input type="number" {...register("price_per_hour")} className="w-full mt-1 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" {...register("is_active")} id="is_active" className="w-4 h-4 text-indigo-600" />
                  <label htmlFor="is_active" className="text-sm font-medium">Lapangan Aktif & Bisa Disewa</label>
                </div>
                <button type="submit" disabled={mutation.isPending} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {mutation.isPending ? "Menyimpan..." : "Simpan Data"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}