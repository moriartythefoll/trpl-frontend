import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

/* ================= PUBLIC ================= */
import Home from "@/pages/public/Home";
import AuthPage from "@/pages/public/Auth";
import FieldDetails from "@/pages/public/FieldDetails";
import DetailVenue from "@/pages/public/DetailVenue";

/* ================= LAYOUTS ================= */
import AdminLayout from "@/layouts/AdminLayout";
import OwnerLayout from "@/layouts/OwnerLayout";

/* ================= ADMIN PAGES ================= */
import Dashboard from "@/pages/admin/Dashboard";
import VenueManagement from "@/pages/admin/VenueManagement";
import FieldManagement from "@/pages/admin/FieldManagement";
import ScheduleManagement from "@/pages/admin/ScheduleManagement";
import BookingConfirmation from "@/pages/admin/BookingConfirmation";

/* ================= OWNER PAGES ================= */
// Owner pages contoh, bisa ditambah nanti

export default function AppRoutes() {
  return (
    <Routes>
      {/* ========= PUBLIC ========= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/fields/:id" element={<DetailVenue />} />

      {/* ========= ADMIN ========= */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="venues" element={<VenueManagement />} />
          <Route path="fields" element={<FieldManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="bookings" element={<BookingConfirmation />} />
        </Route>
      </Route>

      {/* ========= OWNER ========= */}
      <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="reports" replace />} />
          <Route path="reports" element={<div>Laporan Owner</div>} />
        </Route>
      </Route>

      {/* ========= FALLBACK ========= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
