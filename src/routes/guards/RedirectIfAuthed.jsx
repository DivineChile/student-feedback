import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function RedirectIfAuthed() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={profile?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
