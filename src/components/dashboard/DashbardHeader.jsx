import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, MessageSquarePlus, ClipboardList, Bell, Send } from "lucide-react";
import { signOut } from "@/lib/auth";
import { showToast } from "../ui/toast";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Submit Feedback", href: "/dashboard/submit-feedback", icon: MessageSquarePlus },
  { label: "My Feedback", href: "/dashboard/my-feedback", icon: ClipboardList },
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
            <div className="w-7 h-7 bg-accent rounded-[var(--radius-input)] flex items-center justify-center shrink-0">
              <span className="text-accent-ink font-display font-semibold text-xs">CV</span>
            </div>
          </Link>

          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">{finalTitle}</h1>
            <p className="text-xs text-muted hidden sm:block mt-0.5">{finalSubtitle}</p>
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

          <button
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-pill
              text-ink-2 hover:bg-paper-2 transition-colors duration-200"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-paper-3 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-ink-2">{studentInitials}</span>
            </div>
            <span className="text-sm font-medium text-ink-2">{studentName}</span>
          </div>

          <Link to="/dashboard/profile" className="flex md:hidden items-center justify-center w-9 h-9 rounded-full bg-paper-3 shrink-0">
            <span className="text-sm font-semibold text-ink-2">{studentInitials}</span>
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
