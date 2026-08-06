import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
              Create Your Student Account
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Join CampusVoice and make your campus better.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Login Link */}
          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
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
