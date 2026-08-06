import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabaseClient";

export default function AIInsightsPanel({ stats, recentNegativeComments }) {
  const supabase = createClient();

  const [insights, setInsights] = useState(null);
  const [digest, setDigest] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingDigest, setLoadingDigest] = useState(false);

  const generate = async (mode) => {
    const setLoading = mode === "insights" ? setLoadingInsights : setLoadingDigest;
    const setResult = mode === "insights" ? setInsights : setDigest;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-insights", {
        body: { mode, stats, recentNegativeComments },
      });

      if (error) throw error;

      setResult(data.narrative);
    } catch {
      showToast(
        `Failed to generate the AI ${mode === "digest" ? "digest" : "insights"}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-rule p-4 bg-paper-3 md:col-span-2 xl:col-span-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <p className="text-sm font-semibold text-ink">AI Insights</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => generate("insights")}
            disabled={loadingInsights}
            className="px-3 py-1.5 text-xs font-medium rounded-pill border border-ink text-ink bg-transparent
              hover:bg-paper-3 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {loadingInsights && <Loader2 size={12} className="animate-spin" />}
            Generate AI Insights
          </button>
          <button
            type="button"
            onClick={() => generate("digest")}
            disabled={loadingDigest}
            className="px-3 py-1.5 text-xs font-medium rounded-pill bg-accent text-accent-ink
              hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-1.5"
          >
            {loadingDigest && <Loader2 size={12} className="animate-spin" />}
            Generate Weekly Digest
          </button>
        </div>
      </div>

      {insights && (
        <div className="bg-paper-2 border border-rule rounded-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2 mb-1.5">
            Insights
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">{insights}</p>
        </div>
      )}

      {digest && (
        <div className="bg-paper-2 border border-rule rounded-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2 mb-1.5">
            Weekly Digest
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">{digest}</p>
        </div>
      )}

      {!insights && !digest && (
        <p className="text-xs text-muted">
          Generate an AI-written summary of current trends, or a longer weekly digest for leadership.
        </p>
      )}
    </div>
  );
}
