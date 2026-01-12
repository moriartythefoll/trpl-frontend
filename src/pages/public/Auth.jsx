import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast"; // 1. Import Toast

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const isRegister = location.pathname === "/register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loadId = toast.loading(isRegister ? "Mendaftarkan profil baru..." : "Sedang masuk...");

    try {
      if (isRegister) {
        // --- LOGIC REGISTER ---
        
        // 1. Validasi Input Dasar
        if (password !== passwordConfirm) {
          setLoading(false);
          return toast.error("Konfirmasi password tidak sesuai!", { id: loadId });
        }

        if (password.length < 8) {
          setLoading(false);
          return toast.error("Password minimal 8 karakter!", { id: loadId });
        }

        // 2. Kirim ke Service
        // Pastikan key 'password_confirmation' sesuai dengan BE
        await register({
          name: name,
          email: email,
          password: password,
          password_confirmation: passwordConfirm, 
        });

        // 3. Sukses
        toast.success("Akun berhasil dibuat! Silakan login.", { id: loadId });
        
        // Bersihkan form
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirm("");

        // Pindah ke halaman login
        setTimeout(() => {
          navigate("/login");
        }, 1000);

      } else {
        // --- LOGIC LOGIN ---
        const userData = await login({ email, password });

        if (userData) {
          toast.success(`Welcome back, ${userData.name}!`, { 
            id: loadId,
            icon: '👋'
          });

          // JEDA KRUSIAL: Memberi waktu Zustand & LocalStorage sinkron
          setTimeout(() => {
            const role = userData.role;
            if (role === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else if (role === "owner") {
              navigate("/owner/dashboard", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          }, 600);
        }
      }
    } catch (err) {
      // TANGKAP ERROR DARI BE SECARA DETAIL
      const responseError = err.response?.data;
      let msg = "Terjadi kesalahan sistem";

      if (err.response?.status === 422) {
        // Jika error validasi dari Laravel/BE
        const validationErrors = responseError.errors;
        msg = Object.values(validationErrors)[0][0]; // Ambil pesan error pertama
      } else if (responseError?.message) {
        msg = responseError.message;
      }

      toast.error(msg, { id: loadId });
      setError(msg);
    } finally {
      // Matikan loading hanya jika gagal atau di mode register
      // Untuk login sukses, biarkan tetap loading sampai halaman pindah
      if (isRegister || error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans">
      <div
        className={`relative w-full max-w-[850px] min-h-[500px] bg-white rounded-[20px] overflow-hidden
        shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)]`}
      >
        {/* --- SIGN UP FORM --- */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10
          transition-all duration-700 ease-in-out
          ${isRegister 
            ? "translate-x-full opacity-100 z-20 pointer-events-auto" 
            : "opacity-0 z-10 pointer-events-none"}`}
        >
          <form onSubmit={handleSubmit} className="w-full text-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Buat Akun</h1>
            <span className="text-xs text-gray-400 mb-6 block">Gunakan email aktif Anda</span>
            
            <input
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Nama Lengkap"
            />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Email"
            />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Password"
            />
            <input
              type="password" required value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Konfirmasi Password"
            />
            <button 
              disabled={loading}
              className="mt-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-12 py-3 font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>
        </div>

        {/* --- SIGN IN FORM --- */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10
          transition-all duration-700 ease-in-out
          ${isRegister 
            ? "translate-x-full opacity-0 z-10 pointer-events-none" 
            : "opacity-100 z-20 pointer-events-auto"}`}
        >
          <form onSubmit={handleSubmit} className="w-full text-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Masuk</h1>
            <span className="text-xs text-gray-400 mb-6 block">Selamat datang kembali!</span>
            
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Email"
            />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Password"
            />
            <div className="text-right mb-4">
               <a href="#" className="text-xs text-gray-600 hover:text-sky-600 font-medium transition">Lupa Password?</a>
            </div>

            <button 
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-12 py-3 font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Mencocokkan..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* --- OVERLAY CONTAINER --- */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50
          ${isRegister ? "-translate-x-full" : ""}`}
        >
          <div
            className={`relative left-[-100%] w-[200%] h-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white
            transition-transform duration-700 ease-in-out
            ${isRegister ? "translate-x-1/2" : ""}`}
          >
            {/* OVERLAY LEFT */}
            <div
              className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center
              transition-transform duration-700 ease-in-out
              ${isRegister ? "translate-x-0" : "-translate-x-[20%]"}`}
            >
              <h1 className="text-3xl font-bold mb-4">Sudah Punya Akun?</h1>
              <p className="text-sm mb-8 leading-relaxed opacity-90">
                Masuk kembali untuk melihat history booking dan mengelola jadwal lapangan Anda.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-sky-500 transition shadow-md"
              >
                Masuk
              </button>
            </div>

            {/* OVERLAY RIGHT */}
            <div
              className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center
              transition-transform duration-700 ease-in-out
              ${isRegister ? "translate-x-[20%]" : "translate-x-0"}`}
            >
              <h1 className="text-3xl font-bold mb-4">Halo, Penyewa!</h1>
              <p className="text-sm mb-8 leading-relaxed opacity-90">
                Daftarkan data diri Anda untuk mulai melakukan booking lapangan dengan mudah.
              </p>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="bg-transparent border-2 border-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-sky-500 transition shadow-md"
              >
                Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}