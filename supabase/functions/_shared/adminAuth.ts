import { createClient } from "npm:@supabase/supabase-js@2";

export function getSupabaseForRequest(req) {
  const authHeader = req.headers.get("Authorization") || "";

  return createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_ANON_KEY"),
    {
      global: { headers: { Authorization: authHeader } },
    },
  );
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

export async function requireAdminOrAssignedSubAdmin(req) {
  const supabase = getSupabaseForRequest(req);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      role: null,
      officeName: null,
      authorized: false,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      user,
      role: null,
      officeName: null,
      authorized: false,
    };
  }

  if (profile.role === "admin") {
    return {
      supabase,
      user,
      role: "admin",
      officeName: null,
      authorized: true,
    };
  }

  if (profile.role !== "sub_admin") {
    return {
      supabase,
      user,
      role: profile.role,
      officeName: null,
      authorized: false,
    };
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("sub_admin_assignments")
    .select("office_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return {
      supabase,
      user,
      role: "sub_admin",
      officeName: null,
      authorized: false,
    };
  }

  return {
    supabase,
    user,
    role: "sub_admin",
    officeName: assignment.office_name,
    authorized: true,
  };
}
