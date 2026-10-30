import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  MessageSquarePlus,
  ClipboardList,
  Bell,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "../../lib/supabaseClient";
import { useAuth } from "../../context/useAuth";
import { signOut } from "../../lib/auth";
import { showToast } from "../ui/toast";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Submit Feedback",
    href: "/dashboard/submit-feedback",
    icon: MessageSquarePlus,
  },
  { label: "My Feedback", href: "/dashboard/my-feedback", icon: ClipboardList },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const pageConfig = {
  "/dashboard": {
    title: "Student Dashboard",
    subtitle: "Manage your feedback activities",
  },
  "/dashboard/submit-feedback": {
    title: "Submit Feedback",
    subtitle: "Share your experience with the institution",
  },
  "/dashboard/my-feedback": {
    title: "My Feedback",
    subtitle: "Track the feedback you have submitted",
  },
  "/dashboard/notifications": {
    title: "Notifications",
    subtitle: "Updates about your feedback",
  },
};

export default function DashboardHeader({
  title = "",
  subtitle = "",
  studentName = "David Okafor",
  studentInitials = "DO",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return undefined;
    }

    let active = true;
    const loadUnreadCount = async () => {
      const { count, error } = await supabase
        .from("student_notifications")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user.id)
        .eq("is_read", false);
      if (!error && active) setUnreadCount(count || 0);
    };

    loadUnreadCount();
    const channel = supabase
      .channel(`student-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "student_notifications",
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          setUnreadCount((count) => count + 1);
          const notification = payload.new;
          toast.custom(
            (t) => (
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/dashboard/notifications");
                }}
                className="w-100 rounded-xl border border-rule bg-paper p-4 text-left shadow-xl transition hover:bg-paper-2"
              >
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-pending-bg p-2 text-pending">
                    <Bell size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-sm">
                      {notification.title || "Your feedback has been answered"}
                    </span>
                    <span className="block mt-1 text-sm">
                      An administrator has replied to your feedback.
                    </span>
                    <span className="block mt-2 text-xs underline">
                      View notification
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
          table: "student_notifications",
          filter: `student_id=eq.${user.id}`,
        },
        loadUnreadCount,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, navigate]);

  const currentPage = pageConfig[pathname] || {
    title: "Student Dashboard",
    subtitle: "Manage your feedback activities",
  };

  const finalTitle = title || currentPage.title;
  const finalSubtitle = subtitle || currentPage.subtitle;

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Logged out successfully", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      showToast("Failed to log out, please try again.", "error");
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-rule">
      {/* Main header row */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* LEFT — Logo (mobile only) + Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <img
              src="/images/school-logo.jpg"
              alt="School logo"
              className="h-9 w-9 shrink-0 object-contain"
            />
          </Link>

          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">
              {finalTitle}
            </h1>
            <p className="text-xs text-muted hidden sm:block mt-0.5">
              {finalSubtitle}
            </p>
          </div>
        </div>

        {/* RIGHT — Desktop actions + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/submit-feedback"
            className="hidden md:flex items-center gap-2 bg-accent text-accent-ink text-sm
              font-medium px-4 py-2 rounded-pill hover:opacity-90 transition-opacity duration-200"
          >
            <Send size={15} />
            Submit Feedback
          </Link>

          <Link
            to="/dashboard/notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-pill
              text-ink-2 hover:bg-paper-2 transition-colors duration-200"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-negative text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-paper-3 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-ink-2">
                {studentInitials}
              </span>
            </div>
            <span className="text-sm font-medium text-ink-2">
              {studentName}
            </span>
          </div>

          <Link
            to="/dashboard/profile"
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-full bg-paper-3 shrink-0"
          >
            <span className="text-sm font-semibold text-ink-2">
              {studentInitials}
            </span>
          </Link>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-ink-2 hover:text-ink transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-rule bg-paper px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
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
                {label}
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
