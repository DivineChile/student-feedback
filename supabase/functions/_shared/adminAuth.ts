import { createClient } from "npm:@supabase/supabase-js@2";

export function getSupabaseForRequest(req) {
  const authHeader = req.headers.get("Authorization") || "";

  return createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authHeader } },
  });
}

export async function requireAdmin(req) {
  const supabase = getSupabaseForRequest(req);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { supabase, user, isAdmin: false };
  }

  return { supabase, user, isAdmin: true };
}
