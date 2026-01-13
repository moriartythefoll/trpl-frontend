import { useAuthStore } from "../../store/auth.store";
import { 
  HiMenuAlt2, 
  HiOutlineBell, 
  HiOutlineSearch, 
  HiOutlineAdjustments, 
  HiOutlineLogout,
  HiOutlineLightningBolt 
} from "react-icons/hi";

export default function AdminHeader({ toggleSidebar }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* LEFT SECTION: Branding & Search */}
        <div className="flex items-center gap-6 flex-1">
          <button 
            onClick={toggleSidebar}
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-cyan-50 hover:text-cyan-600 lg:hidden"
          >
            <HiMenuAlt2 size={22} className="transition-transform group-active:scale-90" />
          </button>

          {/* Smart Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md group relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Type / to search commands..." 
              className="w-full h-11 pl-11 pr-4 bg-slate-100/50 border border-transparent rounded-2xl text-sm transition-all focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none"
            />
            <div className="absolute right-3 hidden md:block">
              <kbd className="px-2 py-1 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-5">
          
          {/* Action Icons */}
          <div className="hidden sm:flex items-center gap-2">
             <button className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all hover:text-slate-800">
                <HiOutlineLightningBolt size={20} />
             </button>
             <button className="relative h-10 w-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all hover:text-slate-800">
                <HiOutlineBell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
             </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

          {/* User Profile Deep Design */}
          <div className="flex items-center gap-4 pl-2">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {user?.name || "Premium Admin"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 tracking-tighter uppercase">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                {user?.role || "System Architect"}
              </span>
            </div>

            <div className="relative group cursor-pointer">
              {/* Avatar Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              
              <div className="relative h-11 w-11 rounded-2xl bg-white p-0.5 shadow-sm overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </div>

              {/* Status Ring */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-green-500 shadow-sm"></div>
            </div>

            <button
              onClick={logout}
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
              title="Logout"
            >
              <HiOutlineLogout size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}