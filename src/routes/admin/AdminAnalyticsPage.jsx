import { useEffect, useState } from "react";
import {
  MessageSquareText,
  ThumbsDown,
  CheckCheck,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import SummaryCard from "@/components/admin/SummaryCard";
import SectionCard from "@/components/admin/SectionCard";
import StatusBadge from "@/components/admin/StatusBadge";
import AIInsightsPanel from "@/components/admin/AIInsightsPanel";

function getPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function formatAverageRating(rows) {
  const rated = rows.filter((row) => typeof row.rating === "number");
  if (!rated.length) return "0.0 / 5";

  const total = rated.reduce((sum, row) => sum + (row.rating || 0), 0);
  return `${(total / rated.length).toFixed(1)} / 5`;
}

function getTopCategory(rows) {
  const counts = new Map();

  for (const row of rows) {
    counts.set(row.category, (counts.get(row.category) || 0) + 1);
  }

  let topCategory = "N/A";
  let topCount = 0;

  for (const [category, count] of counts.entries()) {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return { topCategory, topCount };
}

function getMostCommonSentiment(rows) {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const row of rows) {
    if (row.sentiment && row.sentiment in counts) {
      counts[row.sentiment] += 1;
    }
  }

  let top = "neutral";
  let topCount = counts.neutral;

  if (counts.positive > topCount) {
    top = "positive";
    topCount = counts.positive;
  }

  if (counts.negative > topCount) {
    top = "negative";
    topCount = counts.negative;
  }

  return { sentiment: top, count: topCount };
}

function getLowestRatedCategory(rows) {
  const categoryRatings = new Map();

  for (const row of rows) {
    if (typeof row.rating !== "number") continue;

    const existing = categoryRatings.get(row.category) || { total: 0, count: 0 };
    categoryRatings.set(row.category, {
      total: existing.total + row.rating,
      count: existing.count + 1,
    });
  }

  let lowestCategory = "N/A";
  let lowestAverage = Infinity;

  for (const [category, stats] of categoryRatings.entries()) {
    if (!stats.count) continue;
    const average = stats.total / stats.count;

    if (average < lowestAverage) {
      lowestAverage = average;
      lowestCategory = category;
    }
  }

  return {
    category: lowestCategory,
    average: lowestAverage === Infinity ? 0 : lowestAverage,
  };
}

function buildCategoryData(rows) {
  const counts = new Map();

  for (const row of rows) {
    counts.set(row.category, (counts.get(row.category) || 0) + 1);
  }

  const total = rows.length;

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percent: getPercent(count, total),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildSentimentData(rows) {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
    unprocessed: 0,
  };

  for (const row of rows) {
    if (row.sentiment === "positive") counts.positive += 1;
    else if (row.sentiment === "neutral") counts.neutral += 1;
    else if (row.sentiment === "negative") counts.negative += 1;
    else counts.unprocessed += 1;
  }

  const total = rows.length;

  return [
    {
      label: "Positive",
      value: counts.positive,
      percent: getPercent(counts.positive, total),
      barClass: "bg-positive",
      textClass: "text-positive",
      bgClass: "bg-positive-bg",
    },
    {
      label: "Neutral",
      value: counts.neutral,
      percent: getPercent(counts.neutral, total),
      barClass: "bg-ink-2",
      textClass: "text-ink-2",
      bgClass: "bg-paper-3",
    },
    {
      label: "Negative",
      value: counts.negative,
      percent: getPercent(counts.negative, total),
      barClass: "bg-negative",
      textClass: "text-negative",
      bgClass: "bg-negative-bg",
    },
    {
      label: "Unprocessed",
      value: counts.unprocessed,
      percent: getPercent(counts.unprocessed, total),
      barClass: "bg-rule-2",
      textClass: "text-muted",
      bgClass: "bg-paper-3",
    },
  ];
}

function buildStatusData(rows) {
  const pending = rows.filter((row) => row.status === "pending").length;
  const reviewed = rows.filter((row) => row.status === "reviewed").length;
  const resolved = rows.filter((row) => row.status === "resolved").length;
  const total = rows.length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return { pending, reviewed, resolved, total, resolutionRate };
}

function buildTrendData(rows) {
  const counts = new Map();

  for (const row of rows) {
    const dateKey = new Date(row.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
  }

  const result = Array.from(counts.entries()).map(([label, count]) => ({
    label,
    count,
  }));

  return result.slice(-7);
}

export default function AdminAnalyticsPage() {
  const supabase = createClient();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("feedback")
          .select("id, category, status, sentiment, rating, comment, created_at")
          .order("created_at", { ascending: true });

        if (error) throw error;

        setRows(data || []);
        setHasError(false);
      } catch (error) {
        showToast(error?.message || "Failed to load analytics data.", "error");
        setHasError(true);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-2xl font-display font-semibold text-ink">Analytics</h2>
          <p className="text-sm text-muted mt-1">
            Understand trends, sentiment, and performance across institutional feedback.
          </p>
        </section>
        <div className="flex items-center justify-center gap-2 text-sm text-muted py-14">
          <Loader2 size={16} className="animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-2xl font-display font-semibold text-ink">Analytics</h2>
          <p className="text-sm text-negative mt-1">
            Failed to load analytics data. Please try again.
          </p>
        </section>
      </div>
    );
  }

  const totalFeedback = rows.length;
  const negativeFeedback = rows.filter((row) => row.sentiment === "negative").length;
  const resolvedFeedback = rows.filter((row) => row.status === "resolved").length;
  const averageRating = formatAverageRating(rows);

  const categoryData = buildCategoryData(rows);
  const sentimentData = buildSentimentData(rows);
  const statusData = buildStatusData(rows);
  const trendData = buildTrendData(rows);

  const { topCategory, topCount } = getTopCategory(rows);
  const { sentiment: dominantSentiment, count: dominantSentimentCount } =
    getMostCommonSentiment(rows);
  const { category: lowestRatedCategory, average: lowestAverage } =
    getLowestRatedCategory(rows);

  const maxTrendCount = Math.max(...trendData.map((item) => item.count), 1);

  const recentNegativeComments = rows
    .filter((row) => row.sentiment === "negative" && row.comment)
    .slice(-10)
    .map((row) => row.comment);

  const insightsStats = {
    totalFeedback,
    categoryData,
    sentimentData: sentimentData.map(({ label, value, percent }) => ({
      label,
      value,
      percent,
    })),
    statusData,
    trendData,
    topCategory,
    dominantSentiment,
    lowestRatedCategory,
    lowestAverage,
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      <section>
        <h2 className="text-2xl font-display font-semibold text-ink mb-1">Analytics</h2>
        <p className="text-sm text-muted">
          Understand trends, sentiment, and performance across institutional feedback.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Feedback"
          value={totalFeedback}
          icon={<MessageSquareText size={20} className="text-ink-2" />}
          iconBg="bg-paper-3"
        />
        <SummaryCard
          label="Negative Feedback"
          value={negativeFeedback}
          valueColor="text-negative"
          icon={<ThumbsDown size={20} className="text-negative" />}
          iconBg="bg-negative-bg"
        />
        <SummaryCard
          label="Resolved Feedback"
          value={resolvedFeedback}
          valueColor="text-positive"
          icon={<CheckCheck size={20} className="text-positive" />}
          iconBg="bg-positive-bg"
        />
        <SummaryCard
          label="Average Rating"
          value={averageRating}
          valueColor="text-accent"
          icon={<Star size={20} className="text-accent" />}
          iconBg="bg-paper-3"
        />
      </section>

      <div className="grid xl:grid-cols-2 gap-6">
        <SectionCard
          title="Category Breakdown"
          subtitle="Distribution of feedback across institutional areas"
        >
          <div className="flex flex-col gap-4">
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted">No category data available yet.</p>
            ) : (
              categoryData.map((item) => (
                <div key={item.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-2">{item.category}</p>
                    <p className="text-xs font-outlier text-muted">
                      {item.count} ({item.percent}%)
                    </p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-paper-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Sentiment Distribution"
          subtitle="Overview of how students feel about institutional issues"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sentimentData.map((item) => (
              <div
                key={item.label}
                className={`rounded-card border border-rule p-4 ${item.bgClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink-2">{item.label}</p>
                  <p className={`text-sm font-outlier font-semibold ${item.textClass}`}>
                    {item.value}
                  </p>
                </div>
                <div className="mt-3 w-full h-2 rounded-full bg-paper/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.barClass}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted mt-2">{item.percent}% of total</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <SectionCard
          title="Status Performance"
          subtitle="Track institutional response workflow"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-card border border-rule p-4">
              <p className="text-xs uppercase tracking-wide text-muted font-medium">
                Pending
              </p>
              <p className="text-2xl font-outlier font-semibold text-pending mt-2">
                {statusData.pending}
              </p>
              <div className="mt-3">
                <StatusBadge status="pending" />
              </div>
            </div>

            <div className="rounded-card border border-rule p-4">
              <p className="text-xs uppercase tracking-wide text-muted font-medium">
                Reviewed
              </p>
              <p className="text-2xl font-outlier font-semibold text-reviewed mt-2">
                {statusData.reviewed}
              </p>
              <div className="mt-3">
                <StatusBadge status="reviewed" />
              </div>
            </div>

            <div className="rounded-card border border-rule p-4">
              <p className="text-xs uppercase tracking-wide text-muted font-medium">
                Resolved
              </p>
              <p className="text-2xl font-outlier font-semibold text-positive mt-2">
                {statusData.resolved}
              </p>
              <div className="mt-3">
                <StatusBadge status="resolved" />
              </div>
            </div>

            <div className="rounded-card border border-rule p-4">
              <p className="text-xs uppercase tracking-wide text-muted font-medium">
                Resolution Rate
              </p>
              <p className="text-2xl font-outlier font-semibold text-ink mt-2">
                {statusData.resolutionRate}%
              </p>
              <div className="mt-3 w-full h-2 rounded-full bg-paper-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-positive"
                  style={{ width: `${statusData.resolutionRate}%` }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Feedback Trend"
          subtitle="Submission volume over the most recent periods"
        >
          <div className="flex items-end gap-3 h-56">
            {trendData.length === 0 ? (
              <p className="text-sm text-muted">No trend data available yet.</p>
            ) : (
              trendData.map((item) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-outlier text-muted">{item.count}</div>
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className="w-full max-w-[36px] rounded-t-lg bg-accent"
                      style={{
                        height: `${(item.count / maxTrendCount) * 100}%`,
                        minHeight: item.count > 0 ? "16px" : "0px",
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-outlier text-muted text-center">{item.label}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Key Insights"
        subtitle="Automatically summarized insights from feedback activity"
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-card border border-rule p-4 bg-paper-2">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-accent" />
              <p className="text-sm font-semibold text-ink">Most Reported Category</p>
            </div>
            <p className="text-sm text-ink-2">
              {topCategory}{" "}
              <span className="text-muted font-outlier">({topCount} submissions)</span>
            </p>
          </div>

          <div className="rounded-card border border-rule p-4 bg-paper-2">
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={16} className="text-accent" />
              <p className="text-sm font-semibold text-ink">Most Common Sentiment</p>
            </div>
            <p className="text-sm text-ink-2 capitalize">
              {dominantSentiment}{" "}
              <span className="text-muted font-outlier">({dominantSentimentCount} entries)</span>
            </p>
          </div>

          <div className="rounded-card border border-rule p-4 bg-paper-2">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-accent" />
              <p className="text-sm font-semibold text-ink">Lowest Rated Category</p>
            </div>
            <p className="text-sm text-ink-2">
              {lowestRatedCategory}{" "}
              <span className="text-muted font-outlier">
                ({lowestAverage ? lowestAverage.toFixed(1) : "0.0"}/5)
              </span>
            </p>
          </div>

          <AIInsightsPanel stats={insightsStats} recentNegativeComments={recentNegativeComments} />
        </div>
      </SectionCard>
    </div>
  );
}
