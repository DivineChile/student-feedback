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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h2>
          <p className="text-sm text-gray-500">
            Monitor feedback activity, review student concerns, and track institutional response.
          </p>
        </section>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-14">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h2>
          <p className="text-sm text-red-500">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h2>
        <p className="text-sm text-gray-500">
          Monitor feedback activity, review student concerns, and track institutional response.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Feedback Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Feedback"
            value={totalFeedback}
            icon={<MessageSquareText size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <SummaryCard
            label="Pending"
            value={pendingCount}
            valueColor="text-yellow-600"
            icon={<Clock size={20} className="text-yellow-600" />}
            iconBg="bg-yellow-50"
          />
          <SummaryCard
            label="Reviewed"
            value={reviewedCount}
            valueColor="text-blue-600"
            icon={<MessageSquareText size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <SummaryCard
            label="Resolved"
            value={resolvedCount}
            valueColor="text-green-600"
            icon={<CheckCheck size={20} className="text-green-600" />}
            iconBg="bg-green-50"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Sentiment Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Positive Sentiment"
            value={positiveSentimentCount}
            valueColor="text-green-600"
            icon={<ThumbsUp size={20} className="text-green-600" />}
            iconBg="bg-green-50"
          />
          <SummaryCard
            label="Negative Sentiment"
            value={negativeSentimentCount}
            valueColor="text-red-500"
            icon={<ThumbsDown size={20} className="text-red-500" />}
            iconBg="bg-red-50"
          />
          <SummaryCard
            label="Average Rating"
            value={averageRating}
            valueColor="text-orange-500"
            icon={<Star size={20} className="text-orange-500" />}
            iconBg="bg-orange-50"
          />
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Feedback</h3>
              <Link
                to="/admin/feedback"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="px-6">
              {recentFeedback.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
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
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Quick Actions
          </h3>

          <QuickActionCard
            title="Review Feedback"
            description="Browse and manage all student feedback submissions."
            href="/admin/feedback"
            buttonLabel="Go to Feedback"
            icon={<MessageSquareText size={20} className="text-blue-600" />}
          />

          <QuickActionCard
            title="View Analytics"
            description="Explore trends and patterns across all categories."
            href="/admin/analytics"
            buttonLabel="Open Analytics"
            icon={<BarChart2 size={20} className="text-blue-600" />}
          />

          <QuickActionCard
            title="Generate Reports"
            description="Export institutional summaries and activity reports."
            href="/admin/reports"
            buttonLabel="View Reports"
            icon={<FileText size={20} className="text-blue-600" />}
          />
        </section>
      </div>
    </div>
  );
}
