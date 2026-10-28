import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2, LogOut } from "lucide-react";
import { createClient } from "../lib/supabaseClient";

const supabase = createClient();

export default function AccountDisabledPage() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Unable to sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert size={28} className="text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Account disabled
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Access to this account has been disabled. Please contact the system
          administrator if you believe this is a mistake.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} />
          )}
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}
