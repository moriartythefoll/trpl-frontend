import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";
import { 
  FaEnvelope, FaShieldAlt, FaClock, FaTimes, 
  FaArrowLeft, FaLock, FaEye, FaEyeSlash, 
  FaSignOutAlt, FaExclamationTriangle, FaUserCog,
  FaDatabase, FaHistory, FaCrown, FaGlobe, FaIdCard
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/public/Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, fetchMe, updateProfile, logout, isLoading: isAuthLoading } = useAuthStore();
  const { pendingCount, fetchPending } = useBookingStore();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [formData, setFormData] = useState({ 
    name: "", 
    password: "", 
    password_confirmation: "" 
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchMe(), fetchPending()]);
      } catch (err) {
        toast.error("REALTIME_SYNC_FAILED");
      } finally {
        setPageLoading(false);
      }
    };
    loadInitialData();

    const syncInterval = setInterval(() => {
      fetchMe();
      fetchPending();
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [fetchMe, fetchPending]);

  const trustScore = useMemo(() => {
    const base = 95;
    const penalty = pendingCount > 5 ? 5 : 0;
    return `${base - penalty}%`;
  }, [pendingCount]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "2026"; 
    return new Date(user.createdAt).getFullYear().toString();
  }, [user]);

  const openEditModal = (tab = "profil") => {
    setFormData({ name: user?.name || "", password: "", password_confirmation: "" });
    setErrorMsg("");
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const payload = { name: formData.name };
      if (activeTab === "keamanan" && formData.password) {
        if (formData.password !== formData.password_confirmation) throw new Error("Passwords do not match");
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }
      await updateProfile(payload);
      toast.success("Identity updated in real-time");
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Uplink failed");
    }
  };

  if (pageLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-sans selection:bg-blue-500/30">
      <Navbar />
      <Toaster position="top-center" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.1),transparent_70%)]" />
      </div>

      <main className="container mx-auto px-6 max-w-7xl pt-32 pb-24">
        
        {/* TOP NAVIGATION / BACK BUTTON */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-blue-500 transition-colors">
            <FaArrowLeft size={10} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return</span>
        </motion.button>

        {/* HEADER SECTION */}
        <div className="mb-12 border-b border-slate-800/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">Account Control</h1>
            <p className="text-slate-500 text-sm">Monitoring and managing active session for <span className="text-blue-500 font-mono">{user?.name}</span></p>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Last Server Pulse</div>
             <div className="text-xs font-mono text-blue-500">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-400 p-[1px]">
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[2.45rem] flex items-center justify-center overflow-hidden">
                      <span className="text-5xl font-medium text-white select-none">{user?.name?.[0]}</span>
                    </div>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl shadow-lg"
                  >
                    <FaCrown size={12} />
                  </motion.div>
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-1">{user?.name}</h2>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live Session</span>
                </div>
                
                <div className="w-full mt-8 space-y-4 text-left border-t border-slate-800/50 pt-8">
                  <ProfileInfoItem icon={<FaEnvelope />} label="Uplink Node" value={user?.email} />
                  <ProfileInfoItem icon={<FaIdCard />} label="Citizen Serial" value={`ARK-USR-${user?.id}`} />
                  <ProfileInfoItem icon={<FaGlobe />} label="Access Region" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => { if(window.confirm("Terminate secure session?")) { logout(); navigate("/"); } }}
              className="w-full py-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-medium hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-rose-500/5"
            >
              <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> Terminate Access
            </button>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsCard 
                title="Identity Matrix"
                description="Real-time update for your display name and public credentials."
                icon={<FaUserCog className="text-blue-500" />}
                onClick={() => openEditModal("profil")}
                actionLabel="Configure"
              />
              <SettingsCard 
                title="Security Protocol"
                description="Hardening access with AES-256 encrypted password update."
                icon={<FaLock className="text-blue-500" />}
                onClick={() => openEditModal("keamanan")}
                actionLabel="Update Key"
              />
            </div>

            <div className="bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <FaDatabase size={120} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-600 rounded-full" /> Live Core Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatItem label="Active Passes" value={pendingCount} icon={<FaClock />} highlight={pendingCount > 0} />
                <StatItem label="Integrity Score" value={trustScore} icon={<FaShieldAlt />} />
                <StatItem label="Entry Cycle" value={memberSince} icon={<FaHistory />} />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <FaDatabase className="text-blue-500 animate-pulse" />
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
                  Status: <span className="text-blue-500 font-bold">Encrypted Uplink</span> | Latency: 24ms
                </div>
              </div>
              <div className="hidden md:block h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                    animate={{ x: [-100, 100] }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-full w-1/2 bg-blue-500/40"
                 />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <ModalFrame onClose={() => setIsModalOpen(false)} title={activeTab === 'profil' ? 'Identity Configuration' : 'Security Hardening'}>
            <form onSubmit={handleUpdate} className="space-y-6">
              {activeTab === 'profil' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Display Designation</label>
                  <input 
                    type="text" required value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Access Key</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Verify Key</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-bold uppercase flex items-center gap-2">
                  <FaExclamationTriangle /> {errorMsg}
                </div>
              )}

              <button 
                type="submit" disabled={isAuthLoading} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isAuthLoading ? "Syncing..." : "Commit Changes"}
              </button>
            </form>
          </ModalFrame>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- REUSABLE COMPONENTS --- */

const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col gap-1 group">
    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
      {icon} {label}
    </div>
    <div className="text-sm font-medium text-slate-300 truncate group-hover:text-blue-400 transition-colors">{value || "---"}</div>
  </div>
);

const SettingsCard = ({ title, description, icon, onClick, actionLabel }) => (
  <div className="p-8 bg-[#0a0a0a] border border-slate-800/60 rounded-[2.5rem] hover:border-blue-500/50 transition-all group relative overflow-hidden">
    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-xl text-blue-500">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed mb-8">{description}</p>
    <button onClick={onClick} className="text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors flex items-center gap-2">
      {actionLabel} <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const StatItem = ({ label, value, icon, highlight }) => (
  <div className="flex flex-col gap-1 p-6 rounded-3xl bg-white/[0.02] border border-slate-800/40">
    <div className="flex items-center justify-between text-slate-600 mb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {React.cloneElement(icon, { size: 14, className: highlight ? 'text-blue-500' : '' })}
    </div>
    <div className={`text-3xl font-bold tracking-tight ${highlight ? 'text-blue-500' : 'text-white'}`}>{value}</div>
  </div>
);

const ModalFrame = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="relative w-full max-w-lg bg-[#0a0a0a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl"
    >
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
          <FaTimes />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-[#020202] flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-blue-500/10 rounded-full" />
        <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin absolute inset-0" />
      </div>
      <span className="text-[10px] font-bold text-slate-500 tracking-[0.5em] uppercase animate-pulse">Establishing Uplink</span>
    </div>
  </div>
);

export default ProfilePage;