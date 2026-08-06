import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseForRequest } from "../_shared/adminAuth.ts";
import { generateStructured } from "../_shared/gemini.ts";
import { processFeedback } from "../_shared/feedbackEngine.ts";

const ANALYZE_SCHEMA = {
  type: "object",
  properties: {
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative"],
    },
    confidence: {
      type: "number",
      description: "Confidence in the sentiment classification, from 0 to 1.",
    },
    systemResponse: {
      type: "string",
      description:
        "A short (1-3 sentence), empathetic, specific acknowledgement addressed to the student, referencing what they actually described.",
    },
  },
  required: ["sentiment", "confidence", "systemResponse"],
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function analyzeWithAI(category, title, comment) {
  const prompt = `A student submitted this feedback to their institution's feedback system.

Category: ${category}
Title: ${title}
Comment: ${comment}

Classify the sentiment of this feedback and write a short, genuine, specific system response acknowledging it (do not use generic filler - reference the actual content).`;

  return generateStructured(prompt, ANALYZE_SCHEMA, {
    system:
      "You are an assistant embedded in a student feedback system. You classify sentiment and draft brief, warm, specific automated acknowledgements shown to students immediately after they submit feedback.",
    timeoutMs: 8000,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = getSupabaseForRequest(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { category, title, comment } = body;

  if (!category || !title || !comment) {
    return jsonResponse({ error: "category, title, and comment are required" }, 400);
  }

  try {
    const result = await analyzeWithAI(category, title, comment);
    return jsonResponse({ ...result, source: "ai" });
  } catch (error) {
    console.error("AI sentiment analysis failed, falling back to rule engine:", error);
    const fallback = processFeedback(category, title, comment);
    return jsonResponse({
      sentiment: fallback.sentiment,
      confidence: fallback.confidence,
      systemResponse: fallback.systemResponse,
      source: "fallback",
    });
  }
});
