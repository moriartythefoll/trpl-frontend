import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { uploadPayment } from "../../services/user/booking.service";
import Navbar from "../../components/public/Navbar";
import toast from "react-hot-toast";
import { CloudUpload, X, CheckCircle2, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";

export default function UploadPayment() {
  const { code } = useParams(); // Mengambil BK-XXXX dari URL
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("File terlalu besar! Maksimal 2MB");
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadPayment(code, formData),
    onSuccess: () => {
      toast.success("Bukti pembayaran terkirim! Menunggu verifikasi admin.");
      navigate("/my-bookings");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal mengunggah bukti.");
    }
  });

  const handleSubmit = () => {
    if (!selectedFile) return toast.error("Pilih gambar bukti transfer dulu, Sensei!");
    
    const formData = new FormData();
    // Key harus 'payment_proof' sesuai dengan request->validate di Controller kamu
    formData.append("payment_proof", selectedFile); 
    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm mb-6 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Detail
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Konfirmasi Bayar</h1>
            <p className="text-slate-500 font-medium">Upload bukti transfer untuk <span className="text-emerald-600 font-bold">#{code}</span></p>
          </div>

          <div className="space-y-6">
            {!preview ? (
              <label className="relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 shadow-sm mb-4 transition-colors">
                    <CloudUpload size={32} />
                  </div>
                  <p className="text-sm text-slate-600 font-bold">Klik untuk pilih gambar</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">PNG, JPG (MAX 2MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            ) : (
              <div className="relative group">
                <button 
                  onClick={() => { setSelectedFile(null); setPreview(null); }}
                  className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>
                <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-xl">
                  <img src={preview} alt="Preview" className="w-full h-80 object-cover" />
                </div>
              </div>
            )}

            <div className="bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 flex gap-4">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                Pastikan nama pengirim dan nominal terlihat jelas. Admin akan melakukan verifikasi dalam waktu maksimal 1x24 jam.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploadMutation.isPending || !selectedFile}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:bg-slate-200 flex items-center justify-center gap-3"
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
              {uploadMutation.isPending ? "Sedang Mengirim..." : "Kirim Bukti Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}