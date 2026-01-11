import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";


export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)

  const isRegister = location.pathname === "/register"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegister) {
        if (password !== passwordConfirm) {
          setError("Password dan konfirmasi tidak sama")
          setLoading(false)
          return
        }

        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        })

        navigate("/login")
        return
      }

      const user = await login({ email, password })
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true })
          break

        case "owner":
          navigate("/owner/reports", { replace: true })
          break

        default:
          navigate("/", { replace: true })
      }

    } catch (err) {
      const status = err.response?.status

      if (status === 401) {
        setError("Email atau password salah")
      } else if (status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors)[0][0])
      } else {
        setError("Terjadi kesalahan, coba lagi")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true })
    } else if (user.role === "owner") {
      navigate("/owner/reports", { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div
        className={`relative w-full max-w-[850px] min-h-[500px] bg-white rounded-[20px] overflow-hidden
        shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)]`}
      >

        {/* --- SIGN UP FORM (BUAT AKUN) --- */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10
          transition-all duration-700 ease-in-out
          ${isRegister 
            ? "translate-x-full opacity-100 z-20 pointer-events-auto" 
            : "opacity-0 z-10 pointer-events-none"}`}
        >
          <form onSubmit={handleSubmit} className="w-full text-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Buat Akun</h1>
            <span className="text-xs text-gray-500 mb-6 block">
              Gunakan email aktif untuk pendaftaran
            </span>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Nama Lengkap"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Password"
            />

            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Konfirmasi Password"
            />
            <button className="mt-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-12 py-3 font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg">
              Daftar
            </button>
          </form>
        </div>

        {/* --- SIGN IN FORM (MASUK) --- */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10
          transition-all duration-700 ease-in-out
          ${isRegister 
            ? "translate-x-full opacity-0 z-10 pointer-events-none" 
            : "opacity-100 z-20 pointer-events-auto"}`}
        >
          <form onSubmit={handleSubmit} className="w-full text-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Masuk</h1>
            <span className="text-xs text-gray-500 mb-6 block">
              Gunakan akun yang sudah terdaftar
            </span>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition"
              placeholder="Password"
            />
            <div className="text-right mb-4">
               <a href="#" className="text-xs text-gray-600 hover:text-sky-600">Lupa Password?</a>
            </div>

            <button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-12 py-3 font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg">
              Masuk
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
              <p className="text-sm mb-8 leading-relaxed">
                Masuk kembali untuk melihat history booking dan mengelola jadwal lapangan Anda.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-sky-500 transition"
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
              <p className="text-sm mb-8 leading-relaxed">
                Daftarkan data diri Anda untuk mulai melakukan booking lapangan dengan mudah.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-transparent border-2 border-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-sky-500 transition"
              >
                Daftar
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}