import { useAuthStore } from "../../store/auth.store";

export default function AdminHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* LEFT */}
      <h1 className="text-lg font-semibold text-gray-700">Admin Panel</h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {user?.role}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold uppercase">
          {user?.name?.charAt(0)}
        </div>

        <button
          onClick={logout}
          className="text-xs text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
