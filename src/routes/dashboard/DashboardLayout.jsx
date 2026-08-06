import { Outlet } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashbardHeader";
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

export default function DashboardLayout() {
  const { user, profile } = useAuth();

  const studentName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const studentInitials = getInitials(studentName);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block fixed top-0 left-0 h-screen w-60 z-40">
        <Sidebar />
      </div>

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardHeader studentName={studentName} studentInitials={studentInitials} />
        <main className="flex-1 px-6 md:px-8 py-8 flex flex-col gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
