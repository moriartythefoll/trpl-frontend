import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";
import { 
  FaEnvelope, FaShieldAlt, FaClock, FaTimes, FaEdit, 
  FaCheckCircle, FaArrowLeft, FaLock, FaEye, FaEyeSlash, 
  FaInfoCircle, FaSignOutAlt, FaExclamationTriangle, FaUserCog 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, fetchMe, updateProfile, logout, isLoading: isAuthLoading } = useAuthStore();
  const { pendingCount, fetchPending } = useBookingStore();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profil"); // 'profil' atau 'keamanan'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({ 
    name: "", 
    password: "", 
    password_confirmation: "" 
  });

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([fetchMe(), fetchPending()]);
      } catch (err) {
        toast.error("Gagal sinkronisasi data cloud.");
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [fetchMe, fetchPending]);

  const openEditModal = (tab = "profil") => {
    setFormData({ name: user?.name || "", password: "", password_confirmation: "" });
    setErrorMsg("");
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (activeTab === "keamanan") {
      if (formData.password && formData.password !== formData.password_confirmation) {
        setErrorMsg("Konfirmasi password tidak cocok!");
        return;
      }
      if (formData.password && formData.password.length < 6) {
        setErrorMsg("Password minimal 6 karakter!");
        return;
      }
    }

    try {
      const payload = { name: formData.name };
      if (activeTab === "keamanan" && formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      await updateProfile(payload);
      
      toast.success("Data Berhasil Diperbarui!", {
        style: { background: "#000", color: "#06b6d4", border: "1px solid #06b6d4" }
      });
      
      setIsModalOpen(false);
      setShowPassword(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Terjadi kesalahan sistem");
      toast.error("Pembaruan Gagal!");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Akhiri sesi ini, Sensei?")) {
      logout();
      navigate("/login");
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    if (formData.password.length < 6) return 1;
    if (formData.password.match(/[A-Z]/) && formData.password.match(/[0-9]/)) return 3;
    return 2;
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-cyan-500 font-black italic tracking-[0.8em] text-xs"
        >
          MENYINKRONKAN...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-32 px-6 relative overflow-hidden flex flex-col items-center font-sans">
      <Toaster position="bottom-right" />
      
      {/* Tombol Kembali */}
      <motion.button 
        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-10 left-6 md:left-24 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-cyan-400 transition-all group z-50"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Arena
      </motion.button>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full -z-10" />

      <div className="container max-w-6xl flex flex-col items-center">
        
        {/* Header Profil */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center text-center mb-20"
        >
          <div className="relative mb-8 group">
            <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1.5 shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-700 group-hover:rotate-6">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                <span className="text-7xl font-black italic text-white uppercase select-none group-hover:scale-110 transition-transform duration-500">
                  {user?.name?.[0]}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 bg-white text-black text-[9px] font-black px-5 py-2 rounded-full uppercase italic tracking-widest shadow-2xl border-2 border-black">
              {user?.role || "PENGGUNA"}
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
            {user?.name}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase italic">
              <FaEnvelope className="text-cyan-500" /> {user?.email}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase italic text-cyan-500/80">
              <FaShieldAlt /> Terverifikasi ID #{user?.id}
            </div>
          </div>
        </motion.div>

        {/* Grid Informasi */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          <motion.div 
            initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="md:col-span-4 space-y-6"
          >
            <StatCard 
              label="Status Sistem" value="AKTIF" icon={<FaCheckCircle />} 
              desc="Akun dalam kondisi baik"
            />
            <StatCard 
              label="Tahun Bergabung" value={user?.created_at ? new Date(user.created_at).getFullYear() : "2024"} icon={<FaClock />} 
              desc={`Sejak ${user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long' }) : 'Baru'}`}
            />
          </motion.div>

          {/* Tombol Utama */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="md:col-span-4"
          >
            <div className="h-full p-10 rounded-[3rem] bg-gradient-to-b from-zinc-900 to-black border border-white/10 flex flex-col items-center justify-center text-center group hover:border-cyan-500/50 transition-all relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
               <p className="text-[10px] font-black text-cyan-500 tracking-[0.4em] uppercase mb-8 italic">Manajemen Identitas</p>
               <div className="flex gap-4 mb-8">
                  <button onClick={() => openEditModal("profil")} className="p-4 bg-white/5 rounded-2xl hover:bg-cyan-500/20 text-white transition-all"><FaUserCog size={20}/></button>
                  <button onClick={() => openEditModal("keamanan")} className="p-4 bg-white/5 rounded-2xl hover:bg-purple-500/20 text-white transition-all"><FaLock size={20}/></button>
               </div>
               <h4 className="text-lg font-black italic uppercase text-white mb-6 tracking-widest">Pengaturan Akun</h4>
               <button 
                onClick={() => openEditModal("profil")}
                className="w-full py-5 bg-white text-black font-black uppercase italic tracking-widest text-[11px] rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl active:scale-95"
              >
                Buka Pengaturan
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="md:col-span-4 space-y-6"
          >
             <StatCard 
              label="Pesanan Tertunda" value={pendingCount} icon={<FaClock />} 
              highlight={pendingCount > 0} desc="Total menunggu pembayaran"
            />
             <div className="p-8 h-[calc(100%-14rem)] rounded-[2.5rem] bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center gap-3">
                <FaInfoCircle className="text-zinc-700 text-xl" />
                <p className="italic text-[9px] text-gray-600 font-bold tracking-widest text-center uppercase leading-relaxed">
                  Sinkronisasi Cloud Aktif <br/> Sports Center v2.0
                </p>
             </div>
          </motion.div>
        </div>

        {/* Zona Bahaya */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-20">
          <button onClick={handleLogout} className="flex items-center gap-4 px-10 py-4 rounded-full border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all duration-500 italic">
            <FaSignOutAlt /> Akhiri Sesi
          </button>
        </motion.div>
      </div>

      {/* MODAL EDIT (TABBED SYSTEM) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[3.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,1)]">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Pengaturan</h2>
                  <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Otomasi Akun</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors"><FaTimes size={24} /></button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-6 mb-8 border-b border-white/5">
                {['profil', 'keamanan'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${activeTab === tab ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-white/20'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase italic">
                  <FaExclamationTriangle /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                {activeTab === 'profil' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-2">Nama Tampilan</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-cyan-500 outline-none transition-all italic" />
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex justify-between items-center px-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic flex items-center gap-2"><FaLock className="text-cyan-500" /> Password Baru</p>
                      {formData.password && (
                        <div className="flex gap-1">
                          {[1,2,3].map((s) => (
                            <div key={s} className={`h-1 w-4 rounded-full transition-all duration-500 ${getPasswordStrength() >= s ? 'bg-cyan-500' : 'bg-white/10'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Masukkan password baru" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-cyan-500 outline-none transition-all tracking-widest" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-cyan-500 transition-colors">
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    <input type={showPassword ? "text" : "password"} placeholder="Ulangi password baru" value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-cyan-500 outline-none transition-all tracking-widest" />
                  </div>
                )}

                <button type="submit" disabled={isAuthLoading} className="w-full py-6 mt-4 bg-cyan-600 text-white rounded-[2rem] font-black uppercase italic tracking-[0.2em] text-[12px] hover:bg-cyan-500 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                  {isAuthLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sinkronisasi Identitas"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight, desc }) => (
  <div className={`p-8 rounded-[2.5rem] bg-zinc-900/50 border transition-all duration-500 group hover:scale-[1.02] ${highlight ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.05)]' : 'border-white/5 hover:border-white/20'}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase italic">{label}</p>
      <div className={`${highlight ? 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-cyan-500 group-hover:text-white'} transition-all p-2 rounded-xl bg-white/5`}>{icon}</div>
    </div>
    <h3 className={`text-5xl font-black italic uppercase tracking-tighter mb-1 ${highlight ? 'text-red-500 animate-pulse' : 'text-white'}`}>{value}</h3>
    <p className="text-[10px] text-gray-600 font-bold italic uppercase tracking-tighter leading-tight">{desc}</p>
  </div>
);

export default ProfilePage;