import { Link } from "react-router-dom";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[30rem]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-input flex items-center justify-center">
              <span className="text-accent-ink font-display font-semibold text-sm">
                CV
              </span>
            </div>
            <span className="font-display font-semibold text-ink text-lg">
              CampusVoice
            </span>
          </Link>
        </div>

        <div className="bg-paper border border-rule rounded-card p-6 sm:p-8">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-pill bg-paper-2 text-ink-2 border border-rule px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Admin Portal
            </span>

            <h1 className="text-2xl font-display font-semibold text-ink mt-4">
              Admin Login
            </h1>

            <p className="text-sm text-ink-2 mt-1">
              Access the institutional feedback management panel.
            </p>

            <div className="mt-3 rounded-input border border-pending/30 bg-pending-bg px-3 py-2">
              <p className="text-xs font-medium text-pending">
                Restricted Access
              </p>
              <p className="text-xs text-ink-2 mt-0.5">
                Only authorized administrative users can access this portal.
              </p>
            </div>
          </div>

          <AdminLoginForm />

          <div className="mt-6 pt-5 border-t border-rule flex items-center justify-between gap-3">
            <p className="text-xs text-ink-2">Authorized staff access only.</p>

            <Link
              to="/"
              className="text-sm font-medium text-accent hover:opacity-80 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
