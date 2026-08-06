import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/context/useAuth";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminLayout() {
  const { profile } = useAuth();

  const adminName = profile?.full_name || "Administrator";
  const adminInitials = getInitials(adminName);

  return (
    <div className="min-h-screen bg-paper">
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-40">
        <AdminSidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen">
        <AdminHeader adminName={adminName} adminInitials={adminInitials} />
        <main className="flex-1 px-6 md:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
