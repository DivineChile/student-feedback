import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquareText,
  BarChart2,
  FileText,
  Clock,
  CheckCheck,
  ThumbsUp,
  ThumbsDown,
  Star,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import SummaryCard from "@/components/admin/SummaryCard";
import QuickActionCard from "@/components/admin/QuickActionCard";
import RecentFeedbackItem from "@/components/admin/RecentFeedbackItem";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateAverageRating(rows) {
  const rated = rows.filter((row) => typeof row.rating === "number");
  if (rated.length === 0) return "0.0 / 5";

  const total = rated.reduce((sum, row) => sum + (row.rating || 0), 0);
  const average = total / rated.length;

  return `${average.toFixed(1)} / 5`;
}

export default function AdminOverviewPage() {
  const supabase = createClient();

  const [feedbackRows, setFeedbackRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("feedback")
          .select("id, title, category, comment, status, created_at, sentiment, rating")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setFeedbackRows(data || []);
        setHasError(false);
      } catch (error) {
        showToast(error?.message || "Failed to load dashboard data.", "error");
        setHasError(true);
        setFeedbackRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl">
        <section>
          <h2 className="text-2xl font-display font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted">
            Monitor feedback activity, review student concerns, and track institutional response.
          </p>
        </section>
        <div className="flex items-center justify-center gap-2 text-sm text-muted py-14">
          <Loader2 size={16} className="animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl">
        <section>
          <h2 className="text-2xl font-display font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-negative">
            Failed to load dashboard data. Please try again.
          </p>
        </section>
      </div>
    );
  }

  const totalFeedback = feedbackRows.length;
  const pendingCount = feedbackRows.filter((item) => item.status === "pending").length;
  const reviewedCount = feedbackRows.filter((item) => item.status === "reviewed").length;
  const resolvedCount = feedbackRows.filter((item) => item.status === "resolved").length;

  const positiveSentimentCount = feedbackRows.filter(
    (item) => item.sentiment === "positive"
  ).length;

  const negativeSentimentCount = feedbackRows.filter(
    (item) => item.sentiment === "negative"
  ).length;

  const averageRating = calculateAverageRating(feedbackRows);

  const recentFeedback = feedbackRows.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status,
    date: formatDate(item.created_at),
    comment: item.comment,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <section>
        <h2 className="text-2xl font-display font-semibold text-ink mb-1">Welcome back</h2>
        <p className="text-sm text-muted">
          Monitor feedback activity, review student concerns, and track institutional response.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
          Feedback Overview
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SummaryCard
            size="lg"
            label="Total Feedback"
            value={totalFeedback}
            icon={<MessageSquareText size={22} className="text-ink-2" />}
            iconBg="bg-paper-3"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:col-span-2">
            <SummaryCard
              label="Pending"
              value={pendingCount}
              valueColor="text-pending"
              icon={<Clock size={20} className="text-pending" />}
              iconBg="bg-pending-bg"
            />
            <SummaryCard
              label="Reviewed"
              value={reviewedCount}
              valueColor="text-reviewed"
              icon={<MessageSquareText size={20} className="text-reviewed" />}
              iconBg="bg-reviewed-bg"
            />
            <SummaryCard
              label="Resolved"
              value={resolvedCount}
              valueColor="text-positive"
              icon={<CheckCheck size={20} className="text-positive" />}
              iconBg="bg-positive-bg"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
          Sentiment Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Positive Sentiment"
            value={positiveSentimentCount}
            valueColor="text-positive"
            icon={<ThumbsUp size={20} className="text-positive" />}
            iconBg="bg-positive-bg"
          />
          <SummaryCard
            label="Negative Sentiment"
            value={negativeSentimentCount}
            valueColor="text-negative"
            icon={<ThumbsDown size={20} className="text-negative" />}
            iconBg="bg-negative-bg"
          />
          <SummaryCard
            label="Average Rating"
            value={averageRating}
            valueColor="text-accent"
            icon={<Star size={20} className="text-accent" />}
            iconBg="bg-paper-3"
          />
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="bg-paper border border-rule rounded-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
              <h3 className="text-sm font-semibold text-ink">Recent Feedback</h3>
              <Link
                to="/admin/feedback"
                className="text-xs text-accent hover:opacity-80 font-medium transition-opacity"
              >
                View all →
              </Link>
            </div>

            <div className="px-6">
              {recentFeedback.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">
                  No feedback available yet.
                </div>
              ) : (
                recentFeedback.map((item) => (
                  <RecentFeedbackItem key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">
            Quick Actions
          </h3>

          <QuickActionCard
            title="Review Feedback"
            description="Browse and manage all student feedback submissions."
            href="/admin/feedback"
            buttonLabel="Go to Feedback"
            icon={<MessageSquareText size={20} className="text-ink-2" />}
          />

          <QuickActionCard
            title="View Analytics"
            description="Explore trends and patterns across all categories."
            href="/admin/analytics"
            buttonLabel="Open Analytics"
            icon={<BarChart2 size={20} className="text-ink-2" />}
          />

          <QuickActionCard
            title="Generate Reports"
            description="Export institutional summaries and activity reports."
            href="/admin/reports"
            buttonLabel="View Reports"
            icon={<FileText size={20} className="text-ink-2" />}
          />
        </section>
      </div>
    </div>
  );
}
