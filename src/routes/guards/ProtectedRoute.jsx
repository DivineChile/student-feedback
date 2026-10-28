import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.is_active === false) {
    return <Navigate to="/login" replace />;
  }

  if (profile.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
