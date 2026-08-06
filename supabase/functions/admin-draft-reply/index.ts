import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { generateText } from "../_shared/gemini.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { supabase, isAdmin } = await requireAdmin(req);

  if (!isAdmin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { id } = body;

  if (!id) {
    return jsonResponse({ error: "id is required" }, 400);
  }

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("category, title, comment, sentiment, rating")
    .eq("id", id)
    .single();

  if (error || !feedback) {
    return jsonResponse({ error: "Feedback not found" }, 404);
  }

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

  try {
    const draft = await generateText(prompt, {
      system:
        "You are drafting replies on behalf of a university administration to student feedback. Replies are reviewed and edited by a human admin before being sent, but should be usable as-is.",
      maxTokens: 700,
    });

    return jsonResponse({ draft: draft.trim() });
  } catch (error) {
    console.error("AI reply drafting failed:", error);
    return jsonResponse({ error: "Failed to generate a draft reply. Please try again." }, 502);
  }
});
