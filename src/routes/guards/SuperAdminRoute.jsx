import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function SuperAdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/admin/feedback" replace />;
  }

  return <Outlet />;
}
