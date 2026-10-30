import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[30rem]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/school-logo.jpg"
              alt="Federal Polytechnic of Oil and Gas logo"
              className="h-16 w-16 object-contain"
            />
            <div>
              <p className="font-display font-semibold text-ink text-base">
                Student Feedback
              </p>
              <p className="text-xs text-ink-2">
                Federal Polytechnic of Oil and Gas
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-paper border border-rule rounded-card px-6 py-10 sm:px-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-semibold text-ink">
              Create Your Student Account
            </h1>
            <p className="text-sm text-ink-2 mt-1.5">
              Join FPOG Student Fedback and make your campus better.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Login Link */}
          <p className="text-sm text-center text-ink-2 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-ink-2 mt-6">
          Your identity is always kept anonymous on FPOG Student Feedback.
        </p>
      </div>
    </main>
  );
}
