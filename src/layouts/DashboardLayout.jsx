import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Outlet />
    </div>
  );
}
