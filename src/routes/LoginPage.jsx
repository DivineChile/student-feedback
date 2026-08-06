import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-input flex items-center justify-center">
              <span className="text-accent-ink font-display font-semibold text-sm">CV</span>
            </div>
            <span className="font-display font-semibold text-ink text-lg">CampusVoice</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-paper border border-rule rounded-card px-6 py-10 sm:px-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-semibold text-ink">
              Login to your Account
            </h1>
            <p className="text-sm text-ink-2 mt-1.5">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Register Link */}
          <p className="text-sm text-center text-ink-2 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-accent font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-ink-2 mt-6">
          Your identity is always kept anonymous on CampusVoice.
        </p>

      </div>
    </main>
  );
}
