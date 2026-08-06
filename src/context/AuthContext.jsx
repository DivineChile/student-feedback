import { createContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let requestId = 0;
    // undefined (not null) so the very first event — whatever it is — always
    // runs the profile load below at least once.
    let resolvedUserId;

    const loadProfile = async (currentUser, myRequestId) => {
      if (!currentUser) {
        if (isMounted && myRequestId === requestId) setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (isMounted && myRequestId === requestId) setProfile(data || null);
    };

    // onAuthStateChange fires immediately with the current session on
    // subscribe (no separate getUser() network round-trip needed), then
    // again on every sign-in/sign-out/token-refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;

      if (!isMounted) return;

      setUser(nextUser);

      // Only re-fetch the profile (and show a loading state) when the signed-in
      // user actually changes — a real sign-in, sign-out, or account switch.
      // Supabase fires this same event on routine background token refreshes
      // too (same user, new token) — treating those as a "loading" transition
      // made the whole app flash back to a spinner on every refresh tick for
      // no reason, and repeated concurrent refreshes could even race each
      // other into an erroneous sign-out.
      if (nextUserId === resolvedUserId) return;
      resolvedUserId = nextUserId;

      requestId += 1;
      const myRequestId = requestId;

      setLoading(true);
      loadProfile(nextUser, myRequestId).finally(() => {
        if (isMounted && myRequestId === requestId) setLoading(false);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
  );
}
