import React, { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus, Edit, Trash2, X, MapPin, DollarSign, UploadCloud, ChevronDown, Eye
} from "lucide-react";

import {
  getFields,
  createField,
  updateField,
  deleteField,
  getVenuesForSelect
} from "../../services/admin/field.service";

/* =========================
   SCHEMA
========================= */
const schema = z.object({
  venue_id: z.coerce.number().min(1),
  name: z.string().min(1),
  type: z.enum(["futsal", "badminton", "basket", "tennis"]),
  price: z.coerce.number().min(0),
  status: z.enum(["active", "inactive"]),
  image: z.any().optional(),
});

const TYPE_COLOR = {
  futsal: "bg-green-600",
  badminton: "bg-blue-600",
  basket: "bg-orange-600",
  tennis: "bg-emerald-600",
};

const STATUS_COLOR = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-200 text-gray-500",
};

export default function AdminFieldPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({ venue: "", type: "", status: "" });
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data: fields = [] } = useQuery({ queryKey: ["fields"], queryFn: getFields });
  const { data: venues = [] } = useQuery({ queryKey: ["venues"], queryFn: getVenuesForSelect });

  const { register, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "futsal", status: "active", price: 0 },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? updateField(editing.id, data) : createField(data),
    onSuccess: () => { qc.invalidateQueries(["fields"]); toast.success("Field saved"); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteField,
    onSuccess: () => { qc.invalidateQueries(["fields"]); toast.success("Field deleted"); },
  });

  const openModal = (field = null) => {
    setEditing(field);
    if (field) {
      reset({ 
        venue_id: field.venue?.id || "", 
        name: field.name, 
        type: field.type, 
        price: field.price, 
        status: field.status, 
        image: null 
      });
      setPreview(field.image ? (field.image.startsWith("http") ? field.image : `${import.meta.env.VITE_STORAGE_URL}/${field.image}`) : null);
    } else {
      reset({ venue_id: "", name: "", type: "futsal", price: 0, status: "active", image: null });
      setPreview(null);
    }
    setModal(true);
  };

  const openDetail = (field) => setDetailModal(field);
  const closeModal = () => { setModal(false); setEditing(null); reset(); setPreview(null); };
  const closeDetail = () => setDetailModal(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if(file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ================= FILTER & SORT LOGIC =================
  const filteredSortedFields = useMemo(() => {
    let temp = [...fields];
    if(filters.venue) temp = temp.filter(f => f.venue?.id === Number(filters.venue));
    if(filters.type) temp = temp.filter(f => f.type === filters.type);
    if(filters.status) temp = temp.filter(f => f.status === filters.status);

    temp.sort((a, b) => {
      if(sortKey === "price") return sortAsc ? a.price - b.price : b.price - a.price;
      if(sortKey === "name") return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if(sortKey === "type") return sortAsc ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      return 0;
    });

    return temp;
  }, [fields, filters, sortKey, sortAsc]);

  // ================= PAGINATION =================
  const paginatedFields = useMemo(() => {
    const start = (page-1)*perPage;
    return filteredSortedFields.slice(start, start+perPage);
  }, [filteredSortedFields, page]);

  const totalPages = Math.ceil(filteredSortedFields.length / perPage);

  const toggleSort = (key) => {
    if(sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <Toaster />
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">ARENA HUB</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your sport fields & booking</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
          <Plus size={18} /> Add Field
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-4">
        <select value={filters.venue} onChange={e => setFilters(f => ({...f, venue: e.target.value}))} className="input">
          <option value="">All Venues</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="input">
          <option value="">All Types</option>
          {["futsal","badminton","basket","tennis"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="input">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="w-full table-auto border-separate border-spacing-0">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Image</th>
              <th className="px-6 py-4 text-left cursor-pointer" onClick={() => toggleSort("name")}>
                Field <ChevronDown className={`inline-block ml-1 transition-transform ${sortKey==="name" && !sortAsc ? "rotate-180" : ""}`} size={16}/>
              </th>
              <th className="px-6 py-4 text-center cursor-pointer" onClick={() => toggleSort("type")}>
                Type <ChevronDown className={`inline-block ml-1 transition-transform ${sortKey==="type" && !sortAsc ? "rotate-180" : ""}`} size={16}/>
              </th>
              <th className="px-6 py-4 text-right cursor-pointer" onClick={() => toggleSort("price")}>
                Price <ChevronDown className={`inline-block ml-1 transition-transform ${sortKey==="price" && !sortAsc ? "rotate-180" : ""}`} size={16}/>
              </th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFields.map(f => (
              <tr key={f.id} className="hover:bg-gray-100 transition cursor-pointer" onClick={() => openDetail(f)}>
                <td className="px-6 py-3">
                  {f.image ? <img src={f.image.startsWith("http") ? f.image : `${import.meta.env.VITE_STORAGE_URL}/${f.image}`} alt={f.name} className="w-28 h-16 object-cover rounded-full shadow-lg" /> : <div className="w-28 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">NO IMG</div>}
                </td>
                <td className="px-6 py-3">
                  <div className="font-bold">{f.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {f.venue?.name || "-"}</div>
                </td>
                <td className="px-6 py-3 text-center"><span className={`px-3 py-1 rounded-full text-white text-xs ${TYPE_COLOR[f.type]}`}>{f.type}</span></td>
                <td className="px-6 py-3 text-right font-mono font-bold">Rp {f.price.toLocaleString("id-ID")}</td>
                <td className="px-6 py-3 text-center"><span className={`px-4 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[f.status]}`}>{f.status}</span></td>
                <td className="px-6 py-3 flex justify-end gap-3">
                  <button onClick={(e) => { e.stopPropagation(); openModal(f); }} className="hover:text-blue-600 transition"><Edit size={18}/></button>
                  <button onClick={(e) => { e.stopPropagation(); window.confirm("Delete this field?") && deleteMutation.mutate(f.id); }} className="text-red-500 hover:text-red-700 transition"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-end gap-2 mt-2 text-sm">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded hover:bg-gray-200">Prev</button>
          <span className="px-3 py-1 border rounded">{page} / {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded hover:bg-gray-200">Next</button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={closeDetail} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <button onClick={closeDetail} className="absolute top-4 right-4 hover:text-gray-700 transition"><X size={22}/></button>
              <h2 className="text-2xl font-extrabold mb-4">{detailModal.name}</h2>
              <img src={detailModal.image.startsWith("http") ? detailModal.image : `${import.meta.env.VITE_STORAGE_URL}/${detailModal.image}`} alt={detailModal.name} className="w-full h-56 object-cover rounded-xl mb-4"/>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> {detailModal.venue?.name}</p>
              <p className="mt-2"><span className="font-bold">Type:</span> {detailModal.type}</p>
              <p><span className="font-bold">Price:</span> Rp {detailModal.price.toLocaleString("id-ID")}</p>
              <p><span className="font-bold">Status:</span> {detailModal.status}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-xl shadow-2xl"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 hover:text-gray-700 transition"><X size={22}/></button>

              <h2 className="text-2xl font-extrabold mb-6">{editing ? "Edit Field" : "New Field"}</h2>

              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-5">
                {/* IMAGE */}
                <div 
                  className="flex flex-col gap-2 border-2 border-dashed rounded-xl p-4 items-center justify-center cursor-pointer hover:border-black transition"
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <UploadCloud size={36} className="text-gray-400" />
                  <p className="text-sm text-gray-500">Drag & Drop image here or click to select</p>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => { const f = e.target.files[0]; setValue("image", f); setPreview(URL.createObjectURL(f)); }} />
                  {preview && <img src={preview} alt="preview" className="h-48 w-48 object-cover rounded-full shadow-lg mt-2"/>}
                </div>

                {/* VENUE & NAME */}
                <div className="grid grid-cols-2 gap-4">
                  <select {...register("venue_id")} className="input">
                    <option value="">Select Venue</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <input {...register("name")} placeholder="Field Name" className="input"/>
                </div>

                {/* TYPE & PRICE */}
                <div className="grid grid-cols-2 gap-4">
                  <select {...register("type")} className="input">
                    <option value="futsal">Futsal</option>
                    <option value="badminton">Badminton</option>
                    <option value="basket">Basket</option>
                    <option value="tennis">Tennis</option>
                  </select>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="number" {...register("price")} placeholder="Price / Hour" className="input pl-10"/>
                  </div>
                </div>

                {/* STATUS */}
                <select {...register("status")} className="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button type="submit" disabled={saveMutation.isPending} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-105 transition transform shadow-lg">
                  {saveMutation.isPending ? "Saving..." : "Save Field"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
