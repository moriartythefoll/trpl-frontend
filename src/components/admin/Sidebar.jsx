import { NavLink } from "react-router-dom";
import { 
  HiOutlineViewGrid, 
  HiOutlineOfficeBuilding, 
  HiOutlineDatabase, 
  HiOutlineCalendar, 
  HiOutlineBadgeCheck,
  HiOutlineLogout,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { useAuthStore } from "../../store/auth.store";

export default function Sidebar({ isOpen, setIsSidebarOpen }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Filtered Menu: Khusus Admin Only
  const adminMenu = [
    { 
      label: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <HiOutlineViewGrid />,
      description: "Overview & Analytics" 
    },
    { 
      label: "Venue Management", 
      path: "/admin/venues", 
      icon: <HiOutlineOfficeBuilding />,
      description: "Manage sport centers" 
    },
    { 
      label: "Field Management", 
      path: "/admin/fields", 
      icon: <HiOutlineDatabase />,
      description: "Setup court details" 
    },
    { 
      label: "Schedule Management", 
      path: "/admin/schedules", 
      icon: <HiOutlineCalendar />,
      description: "Time slot settings" 
    },
    { 
      label: "Confirm Booking", 
      path: "/admin/bookings", 
      icon: <HiOutlineBadgeCheck />,
      description: "Approval center",
      badge: "New" // Penanda jika ada data baru
    },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] border-r border-slate-800 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* 1. BRANDING SECTION */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50 w-full">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-black text-xl italic">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none mb-1">
              Sport<span className="text-cyan-400">Center</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Admin Control
            </span>
          </div>
        </div>
      </div>

      {/* 2. MENU SECTION */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-8 custom-scrollbar">
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-4">
            Main Operation
          </p>
          
          <nav className="space-y-2">
            {adminMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-start gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-600/10 to-transparent text-cyan-400 shadow-[inset_4px_0_0_0_#06b6d4]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`mt-0.5 text-2xl transition-all duration-300 ${isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "text-slate-500 group-hover:text-slate-300"}`}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
                      <span className={`text-[10px] transition-colors ${isActive ? "text-cyan-400/70" : "text-slate-500"}`}>
                        {item.description}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="ml-auto bg-cyan-500 text-[9px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* 3. SYSTEM SECTION */}
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-4">
            System
          </p>
          <div className="px-4 py-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/10 flex items-center gap-3">
             <HiOutlineShieldCheck className="text-cyan-500" size={20}/>
             <div className="flex flex-col">
                <span className="text-[11px] text-slate-300 font-bold">Secure Mode</span>
                <span className="text-[9px] text-cyan-500/70">Verified Admin Only</span>
             </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER LOGOUT */}
      <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-rose-500/5 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 group shadow-lg shadow-rose-500/5"
        >
          <HiOutlineLogout size={18} className="group-hover:-translate-x-1 transition-transform" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}