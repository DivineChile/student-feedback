import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
              Create Your Student Account
            </h1>
            <p className="text-sm text-ink-2 mt-1.5">
              Join CampusVoice and make your campus better.
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
          Your identity is always kept anonymous on CampusVoice.
        </p>
      </div>
    </main>
  );
}
