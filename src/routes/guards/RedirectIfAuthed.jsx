import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function RedirectIfAuthed() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Outlet />;

  if (!profile) return null;

  if (profile.is_active === false) {
    return <Navigate to="/account-disabled" replace />;
  }

  if (profile.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  const isAdminRole = ["admin", "sub_admin"].includes(profile.role);

  return (
    <Navigate to={isAdminRole ? "/admin/feedback" : "/dashboard"} replace />
  );
}
