import { createClient } from "npm:@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateTemporaryPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const randomValues = new Uint32Array(24);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues, (value) => chars[value % chars.length]).join(
    "",
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // 1. Verify the requester is an active super-admin.
  let authResult;

  try {
    authResult = await requireAdmin(req);
  } catch (error) {
    console.error("Sub-admin authorization failed:", error);
    return jsonResponse({ error: "Authorization check failed" }, 500);
  }

  if (!authResult.isAdmin || !authResult.user) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  // 2. Validate the request.
  let body: { fullName?: unknown; email?: unknown; officeName?: unknown };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const officeName =
    typeof body.officeName === "string" ? body.officeName.trim() : "";

  if (
    fullName.length < 2 ||
    fullName.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !officeName ||
    officeName.length > 120
  ) {
    return jsonResponse(
      { error: "Enter a valid name, email address, and office." },
      400,
    );
  }

  // 3. Create a service-role client for privileged account operations.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("Required Supabase server configuration is missing.");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 4. Ensure the selected office exists in the category assignments.
  const { data: officeAssignment, error: officeError } = await adminClient
    .from("feedback_category_office_assignments")
    .select("office_name")
    .eq("office_name", officeName)
    .limit(1)
    .maybeSingle();

  if (officeError) {
    console.error("Office validation failed:", officeError);
    return jsonResponse(
      { error: "Unable to validate the selected office." },
      500,
    );
  }

  if (!officeAssignment) {
    return jsonResponse(
      { error: "The selected office has no category assignments." },
      400,
    );
  }

  // 5. Create the authentication user with a generated temporary password.
  const temporaryPassword = generateTemporaryPassword();

  const { data: createdUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (createError || !createdUser.user) {
    console.error("Sub-admin auth creation failed:", createError);

    return jsonResponse(
      {
        error:
          createError?.code === "email_exists"
            ? "An account with this email address already exists."
            : "Unable to create the account. Check whether this email is already registered.",
      },
      400,
    );
  }

  const userId = createdUser.user.id;

  try {
    // 6. Create or update the profile with restricted first-login access.
    const { data: existingProfile, error: profileLookupError } =
      await adminClient
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (profileLookupError) {
      throw new Error("Unable to check the new account profile.");
    }

    const profileData = {
      id: userId,
      full_name: fullName,
      email,
      role: "sub_admin",
      is_active: true,
      must_change_password: true,
    };

    const { error: profileError } = existingProfile
      ? await adminClient.from("profiles").update(profileData).eq("id", userId)
      : await adminClient.from("profiles").insert(profileData);

    if (profileError) {
      throw new Error("Unable to save the sub-admin profile.");
    }

    // 7. Assign the account to the selected office.
    const { error: assignmentError } = await adminClient
      .from("sub_admin_assignments")
      .upsert(
        {
          user_id: userId,
          office_name: officeName,
        },
        { onConflict: "user_id" },
      );

    if (assignmentError) {
      throw new Error("Unable to assign the account to the selected office.");
    }
  } catch (error) {
    console.error("Sub-admin provisioning failed:", error);

    // Roll back the auth account to avoid leaving a partially configured user.
    const { error: rollbackError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (rollbackError) {
      console.error("Sub-admin rollback failed:", rollbackError);
    }

    return jsonResponse(
      {
        error:
          "The account could not be fully configured. No credentials have been returned. Check the server logs before retrying.",
      },
      500,
    );
  }

  // 8. Return the temporary password only after all setup steps succeed.
  return jsonResponse(
    {
      success: true,
      user: {
        id: userId,
        fullName,
        email,
        role: "sub_admin",
        officeName,
        mustChangePassword: true,
      },
      temporaryPassword,
      message:
        "Sub-admin account created. The user must change this temporary password before accessing administrative features.",
    },
    201,
  );
});
