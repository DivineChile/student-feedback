import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { generateText } from "../_shared/gemini.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildPrompt(body) {
  const { stats, recentNegativeComments } = body;

  const statsBlock = `Total feedback: ${stats.totalFeedback}
Category breakdown: ${stats.categoryData
    .map((c) => `${c.category} (${c.count}, ${c.percent}%)`)
    .join(", ")}
Sentiment distribution: ${stats.sentimentData
    .map((s) => `${s.label} ${s.value} (${s.percent}%)`)
    .join(", ")}
Status: pending ${stats.statusData.pending}, reviewed ${stats.statusData.reviewed}, resolved ${stats.statusData.resolved}, resolution rate ${stats.statusData.resolutionRate}%
Recent submission trend (by day): ${stats.trendData
    .map((t) => `${t.label}: ${t.count}`)
    .join(", ")}
Most reported category: ${stats.topCategory}
Most common sentiment: ${stats.dominantSentiment}
Lowest rated category: ${stats.lowestRatedCategory} (${stats.lowestAverage.toFixed(1)}/5)`;

  const commentsBlock = recentNegativeComments?.length
    ? `\n\nSample of recent negative feedback comments:\n${recentNegativeComments
        .map((c, i) => `${i + 1}. ${c}`)
        .join("\n")}`
    : "";

  return `${statsBlock}${commentsBlock}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { isAdmin } = await requireAdmin(req);

  if (!isAdmin) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  if (!body?.stats) {
    return jsonResponse({ error: "stats is required" }, 400);
  }

  const mode = body.mode || "insights";
  const dataBlock = buildPrompt(body);

  const prompt =
    mode === "digest"
      ? `You are writing a weekly digest for an institution's leadership team, summarizing student feedback activity. Here is the current data:\n\n${dataBlock}\n\nWrite a 4-6 sentence digest covering: the most significant trend or issue, any notable shift in sentiment, and what deserves attention this week. Be concrete and reference the actual numbers/categories - do not be generic.`
      : `You are analyzing student feedback data for an institution's admin dashboard. Here is the current data:\n\n${dataBlock}\n\nWrite a 2-4 sentence narrative identifying the most important trend, anomaly, or emerging issue in this data. Be specific and reference actual categories/numbers - do not restate every stat, synthesize what matters most.`;

  try {
    const narrative = await generateText(prompt, {
      system:
        "You are an analytics assistant for a student feedback platform, writing concise, specific, decision-useful narratives for administrators.",
      maxTokens: mode === "digest" ? 800 : 500,
    });

    return jsonResponse({ narrative });
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return jsonResponse({ error: "Failed to generate insights. Please try again." }, 502);
  }
});
