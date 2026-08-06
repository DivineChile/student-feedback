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
    <div className="rounded-xl border border-gray-200 p-4 bg-slate-50 md:col-span-2 xl:col-span-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">AI Insights</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generate("insights")}
            disabled={loadingInsights}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-white text-blue-700
              hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {loadingInsights && <Loader2 size={12} className="animate-spin" />}
            Generate AI Insights
          </button>
          <button
            type="button"
            onClick={() => generate("digest")}
            disabled={loadingDigest}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-white text-blue-700
              hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {loadingDigest && <Loader2 size={12} className="animate-spin" />}
            Generate Weekly Digest
          </button>
        </div>
      </div>

      {insights && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1.5">
            Insights
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{insights}</p>
        </div>
      )}

      {digest && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1.5">
            Weekly Digest
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{digest}</p>
        </div>
      )}

      {!insights && !digest && (
        <p className="text-xs text-gray-500">
          Generate an AI-written summary of current trends, or a longer weekly digest for leadership.
        </p>
      )}
    </div>
  );
}
