import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/useAuth";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
}

export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;

  if (!user) return <Navigate to="/admin-login" replace />;

  const allowedRoles = ["admin", "sub_admin"];

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
