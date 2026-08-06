import { Link } from "react-router-dom";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">CampusVoice</span>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Admin Portal
            </span>

            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Admin Login
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Access the institutional feedback management panel.
            </p>

            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-medium text-amber-700">
                Restricted Access
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Only authorized administrative users can access this portal.
              </p>
            </div>
          </div>

          <AdminLoginForm />

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Authorized staff access only.
            </p>

            <Link
              to="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
