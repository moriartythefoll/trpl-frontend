import { NavLink } from "react-router-dom"
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChartBar,
  FaBuilding,
  FaLayerGroup,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa"
import { useAuthStore } from "../../store/auth.store"

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const menu = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt />,
      roles: ["admin"],
    },
    {
      label: "Venue Management",
      path: "/admin/venues",
      icon: <FaBuilding />,
      roles: ["admin"],
    },
    {
      label: "Field Management",
      path: "/admin/fields",
      icon: <FaLayerGroup />,
      roles: ["admin"],
    },
    {
      label: "Schedule Management",
      path: "/admin/schedules",
      icon: <FaClock />,
      roles: ["admin"],
    },
    {
      label: "Confirm Booking",
      path: "/admin/bookings", // ✅ FIX
      icon: <FaCheckCircle />,
      roles: ["admin"],
    },
    {
      label: "Reports",
      path: "/owner/reports",
      icon: <FaChartBar />,
      roles: ["owner"],
    },
  ]

  return (
    <aside className="h-full flex flex-col bg-gray-900 text-white">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-lg font-bold tracking-wide">SportCenter</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg
          text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  )
}
