import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        {/* Nanti isi menu navigasi */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-16 bg-gray-100 shadow">
          {/* Nanti isi navbar */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="h-12 bg-gray-100 text-center text-sm">
          © 2026 Sport Booking Admin
        </footer>
      </div>
    </div>
  );
}
