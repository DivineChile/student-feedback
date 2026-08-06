import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquarePlus, ClipboardList, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { showToast } from "../ui/toast";

export const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Submit Feedback", href: "/dashboard/submit-feedback", icon: MessageSquarePlus },
  { label: "My Feedback", href: "/dashboard/my-feedback", icon: ClipboardList },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Logged out successfully", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      showToast("Failed to log out, please try again.", "error");
    }
  };

  return (
    <aside className="w-60 h-full bg-paper-2 border-r border-rule flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-rule">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-[var(--radius-input)] flex items-center justify-center shrink-0">
            <span className="text-accent-ink font-display font-semibold text-xs">CV</span>
          </div>
          <span className="font-display font-semibold text-ink text-base">CampusVoice</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm transition-colors duration-200
                ${
                  isActive
                    ? "bg-accent text-accent-ink"
                    : "text-ink-2 hover:bg-paper-3 hover:text-ink"
                }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-5 border-t border-rule">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-pill text-sm
            text-ink-2 hover:bg-paper-3 hover:text-ink transition-colors duration-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
