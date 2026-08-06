import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, MessageSquareText, BarChart2, FileText } from "lucide-react";
import { signOut } from "@/lib/auth";
import { showToast } from "../ui/toast";

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
};

const navLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "All Feedback", href: "/admin/feedback", icon: MessageSquareText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

export default function AdminHeader({ adminName, adminInitials }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link to="/admin" className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 bg-accent rounded-[var(--radius-input)] flex items-center justify-center shrink-0">
              <span className="text-accent-ink font-display font-semibold text-xs">CV</span>
            </div>
          </Link>

          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">{meta.title}</h1>
            <p className="text-xs text-muted hidden sm:block mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
              <span className="text-paper text-xs font-semibold">{adminInitials}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink leading-tight">{adminName}</p>
              <p className="text-xs text-muted">Administrator</p>
            </div>
          </div>

          <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-ink shrink-0">
            <span className="text-paper text-xs font-semibold">{adminInitials}</span>
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
