import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { createClient } from "../lib/supabaseClient";

const supabase = createClient();

export default function ChangePasswordPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-center text-gray-600">
          Unable to load your account profile. Please refresh the page or sign
          in again.
        </p>
      </div>
    );
  }

  if (profile.is_active === false) {
    return <Navigate to="/account-disabled" replace />;
  }

  if (profile.must_change_password !== true) {
    const isAdmin = ["admin", "sub_admin"].includes(profile.role);

    return <Navigate to={isAdmin ? "/admin/feedback" : "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8 || password.length > 128) {
      setError("Your password must contain between 12 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "complete-password-change",
        {
          body: { password },
        },
      );

      if (functionError) {
        let message = functionError.message;

        try {
          const response = functionError.context;
          if (response && typeof response.json === "function") {
            const details = await response.json();
            message = details.error || message;
          }
        } catch {
          // Keep the original error message if no response body is available.
        }

        throw new Error(message || "Unable to change your password.");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Unable to change your password.");
      }

      setSuccess("Password changed successfully. Redirecting to sign in...");

      const isAdmin = ["admin", "sub_admin"].includes(profile.role);
      const loginPath = isAdmin ? "/admin-login" : "/login";

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(
          "Your password was changed, but automatic sign-out failed. Please sign out manually and sign in again.",
        );
        return;
      }

      navigate(loginPath, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-[30rem] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center self-center rounded-xl bg-gray-100">
          <LockKeyhole size={24} />
        </div>

        <h1 className="text-2xl font-semibold font-display text-gray-900">
          Change your password
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          You must create a new password before continuing to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-input border bg-paper text-ink placeholder-ink-2/60
            focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-transparent transition-colors"
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-input border bg-paper text-ink placeholder-ink-2/60
            focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-transparent transition-colors"
              placeholder="Re-enter your new password"
            />
          </div>

          <p className="text-xs text-gray-500">
            Use at least 8 characters. Avoid reusing a password from another
            account.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-accent-ink text-sm font-medium py-2.5 rounded-pill
          hover:opacity-90 active:opacity-80 transition-opacity duration-200
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
