import { corsHeaders } from "../_shared/cors.ts";
import { requireAdminOrAssignedSubAdmin } from "../_shared/adminAuth.ts";
import { generateText } from "../_shared/gemini.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  console.log("AI draft: request received", {
    method: req.method,
  });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Step 1: Check authorization
  let authResult;

  try {
    authResult = await requireAdminOrAssignedSubAdmin(req);
  } catch (error) {
    console.error("AI draft: authorization helper threw an error", {
      message: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse({ error: "Authorization check failed" }, 500);
  }

  const { supabase, authorized, role, officeName } = authResult;

  console.log("AI draft authorization:", {
    authorized,
    role,
    officeName,
  });

  if (!authorized) {
    console.warn("AI draft rejected: authorization helper returned false");

    return jsonResponse({ error: "Forbidden" }, 403);
  }

  console.log("AI draft: authorization passed");

  // Step 2: Parse request body
  let body;

  try {
    body = await req.json();
    console.log("AI draft: request body parsed", {
      hasId: Boolean(body?.id),
    });
  } catch (error) {
    console.warn("AI draft: invalid request body", {
      message: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { id } = body;

  if (!id) {
    console.warn("AI draft: request rejected because id is missing");
    return jsonResponse({ error: "id is required" }, 400);
  }

  // Step 3: Fetch feedback
  console.log("AI draft: starting feedback lookup");

  const { data: feedback, error: feedbackError } = await supabase
    .from("feedback")
    .select("category, title, comment, sentiment, rating")
    .eq("id", id)
    .maybeSingle();

  console.log("AI draft: feedback lookup completed", {
    found: Boolean(feedback),
    error: feedbackError?.message ?? null,
    errorCode: feedbackError?.code ?? null,
  });

  if (feedbackError || !feedback) {
    console.warn("AI draft: feedback lookup failed", {
      reason: feedbackError ? "database_error" : "record_not_found",
    });

    return jsonResponse({ error: "Feedback not found" }, 404);
  }

  // Step 4: Verify sub-admin category assignment
  if (role === "sub_admin") {
    console.log("AI draft: checking sub-admin category access", {
      officeName,
      category: feedback.category,
    });

    if (feedback.category === "All") {
      console.warn("AI draft: sub-admin rejected for All category");
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("feedback_category_office_assignments")
      .select("category")
      .eq("category", feedback.category)
      .eq("office_name", officeName)
      .maybeSingle();

    console.log("AI draft: category assignment lookup completed", {
      assignmentFound: Boolean(assignment),
      error: assignmentError?.message ?? null,
      errorCode: assignmentError?.code ?? null,
    });

    if (assignmentError || !assignment) {
      console.warn("AI draft: sub-admin category access denied", {
        reason: assignmentError
          ? "assignment_lookup_error"
          : "category_not_assigned_to_office",
      });

      return jsonResponse({ error: "Forbidden" }, 403);
    }

    console.log("AI draft: sub-admin category access granted");
  }

  // Step 5: Build AI prompt
  const prompt = `A student submitted the following feedback to their institution.

Category: ${feedback.category}
Title: ${feedback.title}
Rating: ${feedback.rating}/5
Detected sentiment: ${feedback.sentiment || "unknown"}
Comment: ${feedback.comment}

Draft a reply from the institution's administration directly to the student. It should:
- Acknowledge their specific concern or feedback (reference details, don't be generic)
- Be professional but warm
- State concrete next steps or a resolution where appropriate, without making promises the institution can't keep
- Be 2-4 sentences

Return only the reply text, nothing else.`;

  // Step 6: Generate AI draft
  try {
    console.log("AI draft: calling AI provider");

    const draft = await generateText(prompt, {
      system:
        "You are drafting replies on behalf of a university administration to student feedback. Replies are reviewed and edited by a human admin before being sent, but should be usable as-is.",
      maxTokens: 700,
    });

    console.log("AI draft: AI provider responded successfully", {
      hasDraft: Boolean(draft?.trim()),
    });

    return jsonResponse({ draft: draft.trim() });
  } catch (error) {
    console.error("AI draft: AI provider failed", {
      message: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse(
      { error: "Failed to generate a draft reply. Please try again." },
      502,
    );
  }
});
