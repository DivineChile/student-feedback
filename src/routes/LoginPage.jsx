import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
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

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-10">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Login to your Account
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Register Link */}
          <p className="text-sm text-center text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Your identity is always kept anonymous on CampusVoice.
        </p>

      </div>
    </main>
  );
}
