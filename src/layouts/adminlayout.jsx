import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { useAuthStore } from "../store/auth.store";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminLayout() {
  const { token, user, fetchMe } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  // Handle auto-close sidebar di layar tablet/mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Jalankan saat mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* 1. SIDEBAR - Sekarang kita buat tetap di kiri */}
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 2. MAIN WRAPPER */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* 3. HEADER - Sticky di atas */}
        <AdminHeader 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        {/* 4. CONTENT AREA */}
        <main className="flex-1 transition-all duration-300">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {/* Animasi sederhana saat perpindahan halaman */}
            <div className="animate-in fade-in duration-500">
              <Outlet context={{ user }} />
            </div>
          </div>
        </main>

        {/* Footer Kecil (Opsional) */}
        <footer className="py-4 px-8 text-sm text-slate-500 border-t border-slate-200 bg-white/50">
         <AdminFooter />
        </footer>
      </div>

      {/* Mobile Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[30] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}
    </div>
  );
}