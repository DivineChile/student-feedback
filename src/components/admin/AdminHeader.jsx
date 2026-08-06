import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, MessageSquareText, BarChart2, FileText } from "lucide-react";
import { signOut } from "@/lib/auth";
import { showToast } from "../ui/toast";

// ── Route title config ────────────────────────

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

// ── Component ─────────────────────────────────

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
    <header className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
      {/* Main header row */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo (mobile) + Page title */}
        <div className="flex items-center gap-3">
          {/* Logo — mobile only */}
          <Link to="/admin" className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">CV</span>
            </div>
          </Link>

          {/* Dynamic title */}
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">{meta.title}</h1>
            <p className="text-xs text-gray-500 hidden sm:block mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: Admin profile + hamburger */}
        <div className="flex items-center gap-3">
          {/* Admin profile — desktop only */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{adminInitials}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 leading-tight">{adminName}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>

          {/* Avatar only — mobile */}
          <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-slate-700 shrink-0">
            <span className="text-white text-xs font-semibold">{adminInitials}</span>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                to={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-slate-200 hover:text-gray-900"
                  }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}

          {/* Logout */}
          <div className="border-t border-slate-200 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                text-gray-600 hover:bg-slate-200 hover:text-gray-900 transition-colors"
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
