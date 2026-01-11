import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleProfileClick = () => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "owner") {
      navigate("/owner/reports");
    } else {
      navigate("/profile"); // atau "/"
    }
  };

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-12 py-6">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer w-12 h-12 bg-black/60 rounded-full flex items-center justify-center border border-white/20 shadow-lg"
      >
        <div
          className="w-5 h-5 bg-yellow-500"
          style={{
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          }}
        />
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex gap-12 text-white/80 text-[10px] font-bold tracking-widest uppercase">
        <li
          onClick={() => navigate("/")}
          className="cursor-pointer hover:text-white"
        >
          Home
        </li>
        <li className="cursor-pointer hover:text-white">Destination</li>
        <li className="cursor-pointer hover:text-white">Contact Us</li>
        <li className="cursor-pointer hover:text-white">Blog</li>
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 text-xs placeholder-white outline-none w-48 focus:w-64 transition-all"
          />
          <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-xs" />
        </div>

        {/* AUTH ACTION */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-black/40 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all"
          >
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleProfileClick}
              className="text-xs text-white/90 hover:text-white font-semibold"
            >
              {user.name}
            </button>
            <button
              onClick={logout}
              className="bg-red-500/70 hover:bg-red-500 px-4 py-2 rounded-full text-xs font-bold text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
