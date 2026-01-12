import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { uploadPayment } from "../../services/user/booking.service";
import Navbar from "../../components/public/Navbar";
import toast from "react-hot-toast";
import { 
  CloudUpload, X, CheckCircle2, ArrowLeft, 
  Loader2, Image as ImageIcon, Zap, ShieldCheck 
} from "lucide-react";

export default function UploadPayment() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("FILE TOO LARGE! MAX 2MB", {
          id: "upload-size-error",
        });
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      
      // ABA-ABA: Feedback saat file masuk
      toast.success("RECEIPT SCANNED", {
        icon: '📸',
        id: "file-selected"
      });
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadPayment(code, formData),
    onMutate: () => {
      // ABA-ABA: Loading State Global (Menimpa notif sebelumnya)
      toast.loading("TRANSMITTING PROOF...", { id: "upload-status" });
    },
    onSuccess: () => {
      // ABA-ABA: Berhasil
      toast.success("TRANSMISSION SUCCESSFUL!", { 
        id: "upload-status",
        icon: '🚀' 
      });
      
      // Memberi jeda agar user melihat pesan sukses sebelum pindah
      setTimeout(() => navigate("/my-bookings"), 1200);
    },
    onError: (err) => {
      // ABA-ABA: Gagal
      toast.error(err.response?.data?.message || "TRANSMISSION FAILED", { 
        id: "upload-status" 
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedFile) return toast.error("ATTACH RECEIPT FIRST!");
    
    const formData = new FormData();
    formData.append("payment_proof", selectedFile); 
    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32 selection:bg-[#ccff00] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 max-w-2xl">
        {/* BACK BUTTON */}
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#ccff00] font-black text-[10px] uppercase tracking-[0.4em] mb-10 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0f0f] rounded-[4rem] border border-white/5 p-10 md:p-14 relative overflow-hidden"
        >
          {/* DECORATIVE BACKGROUND */}
          <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
            <Zap size={400} strokeWidth={1} />
          </div>

          {/* HEADER */}
          <div className="text-center mb-12 space-y-3 relative z-10">
            <div className="flex justify-center mb-4">
               <div className="bg-[#ccff00]/10 p-4 rounded-[2rem] text-[#ccff00]">
                  <CreditCardIcon />
               </div>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Secure <span className="text-[#ccff00]">Payment</span></h1>
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em]">Confirmation for <span className="text-white">#{code}</span></p>
          </div>

          <div className="space-y-8 relative z-10">
            {/* UPLOAD BOX */}
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.label 
                  key="upload"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-[#151515] hover:border-[#ccff00]/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-500 group-hover:text-[#ccff00] group-hover:scale-110 shadow-sm mb-6 transition-all">
                      <CloudUpload size={40} />
                    </div>
                    <p className="text-[11px] text-white font-black uppercase tracking-widest">Select Transfer Receipt</p>
                    <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-[0.3em] font-black italic">PNG, JPG (MAX 2MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </motion.label>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <button 
                    onClick={() => { 
                      setSelectedFile(null); 
                      setPreview(null);
                      toast("RECEIPT REMOVED", { icon: '🗑️', id: 'remove-img' });
                    }}
                    className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                  <div className="rounded-[3.5rem] overflow-hidden border-4 border-[#ccff00]/20 shadow-2xl">
                    <img src={preview} alt="Preview" className="w-full h-96 object-cover" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INFO PANEL */}
            <div className="bg-[#ccff00]/5 p-6 rounded-[2.5rem] border border-[#ccff00]/10 flex gap-5 items-center">
              <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] shrink-0">
                 <ShieldCheck size={20} />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-black uppercase tracking-tight">
                Pastikan nama pengirim & nominal sesuai. Admin akan memvalidasi dalam 1x24 jam untuk mengaktifkan kode akses arena.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileHover={selectedFile ? { scale: 1.02, backgroundColor: '#ffffff', color: '#000000' } : {}}
              whileTap={selectedFile ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={uploadMutation.isPending || !selectedFile}
              className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] italic text-xs transition-all flex items-center justify-center gap-4 shadow-2xl
                ${selectedFile 
                  ? "bg-[#ccff00] text-black" 
                  : "bg-white/5 text-gray-800 cursor-not-allowed border border-white/5"}`}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Zap size={18} fill="currentColor" />
              )}
              {uploadMutation.isPending ? "TRANSMITTING DATA..." : "SEND PROOF NOW"}
            </motion.button>
          </div>
        </motion.div>

        {/* FOOTER NOTE */}
        <p className="text-center mt-10 text-[9px] font-black text-gray-700 uppercase tracking-[0.5em]">
          End-to-End Encrypted Verification
        </p>
      </div>
    </div>
  );
}

// Icon Helper
const CreditCardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);