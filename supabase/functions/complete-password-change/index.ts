import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authorization = req.headers.get("Authorization") || "";

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authorization } },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  let body: { password?: string };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const password = body.password;

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    return jsonResponse(
      { error: "Password must be between 12 and 128 characters" },
      400,
    );
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("is_active, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return jsonResponse({ error: "Profile not found" }, 404);
  }

  if (profile.is_active !== true) {
    return jsonResponse({ error: "Account is disabled" }, 403);
  }

  if (profile.must_change_password !== true) {
    return jsonResponse(
      { error: "Password change is not required for this account" },
      409,
    );
  }

  const { error: passwordError } = await adminClient.auth.admin.updateUserById(
    user.id,
    {
      password,
    },
  );

  if (passwordError) {
    console.error("Password update failed:", passwordError.message);
    return jsonResponse({ error: "Unable to update password" }, 400);
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  if (updateError) {
    console.error("Password flag update failed:", updateError.message);

    return jsonResponse(
      {
        error:
          "Your password was changed, but account setup is incomplete. Please retry or contact the administrator.",
      },
      500,
    );
  }

  return jsonResponse({ success: true });
});
