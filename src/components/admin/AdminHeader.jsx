import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  MessageSquareText,
  BarChart2,
  FileText,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabaseClient";
import { signOut } from "@/lib/auth";
import { showToast } from "../ui/toast";
import { useAuth } from "../../context/useAuth";

const routeMeta = {
  "/admin": {
    title: "Admin Dashboard",
    subtitle: "Monitor and manage institutional feedback",
  },
  "/admin/feedback": {
    title: "All Feedback",
    subtitle: "Review and manage student submissions",
  },
  "/admin/analytics": {
    title: "Analytics",
    subtitle: "Understand patterns and trends in feedback",
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "Export and review institutional summaries",
  },
  "/admin/notifications": {
    title: "Notifications",
    subtitle: "Review new feedback and administrative alerts",
  },
};

const navLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "All Feedback", href: "/admin/feedback", icon: MessageSquareText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Sub Admins", href: "/admin/sub-admins", icon: ShieldCheck },
];

export default function AdminHeader({ adminName, adminInitials, adminId }) {
  const supabase = createClient();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!adminId) return undefined;

    let active = true;
    const loadUnreadCount = async () => {
      const { count, error } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("admin_id", adminId)
        .eq("is_read", false);

      if (!error && active) setUnreadCount(count || 0);
    };

    loadUnreadCount();

    const channel = supabase
      .channel(`admin-notifications-${adminId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
          filter: `admin_id=eq.${adminId}`,
        },
        (payload) => {
          if (!active) return;
          const notification = payload.new;
          setUnreadCount((count) => count + 1);

          toast.custom(
            (t) => (
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/admin/notifications");
                }}
                className="w-100 rounded-xl border border-rule bg-paper p-4 text-left shadow-xl transition hover:bg-paper-2"
                aria-label="Open new feedback notification"
              >
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-pending-bg p-2 text-pending">
                    <Bell size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      New feedback received
                    </span>
                    <span className="mt-1 block text-sm text-ink-2">
                      {notification.title ||
                        "A student submitted new feedback."}
                    </span>
                    <span className="mt-2 block text-xs font-medium text-accent">
                      Click to view notification
                    </span>
                  </span>
                </span>
              </button>
            ),
            { duration: 9000, position: "top-right" },
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_notifications",
          filter: `admin_id=eq.${adminId}`,
        },
        () => loadUnreadCount(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [adminId, supabase, navigate]);

  const meta = routeMeta[pathname] ?? {
    title: "Admin Panel",
    subtitle: "Institutional feedback management",
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Logged out successfully", "success");
      setMenuOpen(false);
      navigate("/admin-login", { replace: true });
    } catch (error) {
      showToast("Failed to log out, please try again.", "error");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-rule">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            to={isSuperAdmin ? "/admin" : "/admin/feedback"}
            className="flex items-center gap-2 md:hidden"
          >
            <img
              src="/images/school-logo.jpg"
              alt="School logo"
              className="h-9 w-9 shrink-0 object-contain"
            />
          </Link>

          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">
              {meta.title}
            </h1>
            <p className="text-xs text-muted hidden sm:block mt-0.5">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-paper-2 hover:text-ink"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            title="Notifications"
          >
            <Bell size={21} />
            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 flex min-w-[19px] h-[19px] items-center justify-center rounded-full bg-negative px-1 text-[10px] font-bold leading-none text-white ring-2 ring-paper">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
              <span className="text-paper text-xs font-semibold">
                {adminInitials}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink leading-tight">
                {adminName}
              </p>
              <p className="text-xs text-muted">Administrator</p>
            </div>
          </div>

          <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-ink shrink-0">
            <span className="text-paper text-xs font-semibold">
              {adminInitials}
            </span>
          </div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-ink-2 hover:text-ink transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-rule bg-paper px-4 py-3 flex flex-col gap-1">
          {(isSuperAdmin
            ? navLinks
            : navLinks.filter(({ href }) =>
                ["/admin/feedback", "/admin/notifications"].includes(href),
              )
          ).map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            const displayLabel =
              !isSuperAdmin && href === "/admin/feedback"
                ? "Assigned Feedback"
                : label;

            return (
              <Link
                key={href}
                to={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm transition-colors
        ${
          isActive
            ? "bg-accent text-accent-ink"
            : "text-ink-2 hover:bg-paper-2 hover:text-ink"
        }`}
              >
                <Icon size={17} />
                {displayLabel}
              </Link>
            );
          })}

          <div className="border-t border-rule mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm
                text-ink-2 hover:bg-paper-2 hover:text-ink transition-colors"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
