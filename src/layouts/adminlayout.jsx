import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { useAuthStore } from "../store/auth.store";

export default function AdminLayout() {
  const { user, isLoading } = useAuthStore();

  // Guard extra: jika loading selesai tapi user tidak ada (gagal fetch)
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="h-12 shrink-0 bg-white border-t border-gray-200 flex items-center justify-center text-xs text-gray-500">
          © 2026 Sport Booking Admin
        </footer>
      </div>
    </div>
  );
}