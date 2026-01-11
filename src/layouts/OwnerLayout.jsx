import React from "react";
import { Outlet } from "react-router-dom";


export default function OwnerLayout() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-gray-700">
          Owner Panel
        </h1>

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {user?.role}
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-xs text-gray-500">
        © 2026 Sport Booking Owner
      </footer>
    </div>
  )
}
