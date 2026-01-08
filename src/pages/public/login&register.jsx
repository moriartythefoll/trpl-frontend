import { useNavigate } from "react-router-dom"

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register"
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Di sini nanti bisa tambahkan logika validasi:
    // if (password !== confirmPassword) { alert("Password tidak sama!") }
    console.log(`Submitting form: ${mode}`)
  }

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

            <input 
              required
              type="text"
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition" 
              placeholder="Nama Lengkap" 
            />
            <input 
              required
              type="email"
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition" 
              placeholder="Email" 
            />
            <input 
              required
              type="password"
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition" 
              placeholder="Password" 
            />
            
            {/* INPUT BARU: KONFIRMASI PASSWORD */}
            <input 
              required
              type="password"
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

            <input 
              required
              type="email"
              className="w-full bg-gray-100 p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-sky-300 transition" 
              placeholder="Email" 
            />
            <input 
              required
              type="password"
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