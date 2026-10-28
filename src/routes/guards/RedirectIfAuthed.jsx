import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function RedirectIfAuthed() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const isAdminRole = ["admin", "sub_admin"].includes(profile?.role);

    return (
      <Navigate to={isAdminRole ? "/admin/feedback" : "/dashboard"} replace />
    );
  }

  return <Outlet />;
}
