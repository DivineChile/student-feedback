import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  ClipboardList,
  Clock,
  Loader2,
  MessageSquareText,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/utils/categories";
import { STATUSES } from "@/utils/status";
import { SENTIMENTS } from "@/utils/sentiments";
import SummaryCard from "@/components/admin/SummaryCard";
import FeedbackManagementCard from "@/components/admin/FeedbackManagementCard";

function EmptyState() {
  return (
    <div className="bg-paper border border-rule rounded-card px-6 py-14 text-center">
      <div className="w-12 h-12 bg-paper-3 rounded-full flex items-center justify-center mx-auto mb-4">
        <ClipboardList size={22} className="text-muted" />
      </div>
      <h3 className="text-sm font-semibold text-ink-2 mb-1">
        No feedback found
      </h3>
      <p className="text-sm text-muted">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-paper border border-rule rounded-card px-6 py-14 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" />
        Loading feedback...
      </div>
    </div>
  );
}

function normalizeStudent(student) {
  if (!student) return null;
  return Array.isArray(student) ? student[0] || null : student;
}

function mapFeedbackRow(row) {
  const student = normalizeStudent(row.student);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    comment: row.comment,
    rating: row.rating,
    status: row.status,
    sentiment: row.sentiment,
    systemResponse: row.system_response,
    adminReply: row.admin_reply,
    adminReplyAt: row.admin_reply_at,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
    studentName: student?.full_name || null,
    studentEmail: student?.email || null,
  };
}

export default function AdminFeedbackPage() {
  const supabase = createClient();

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("feedback")
          .select(
            `
              id,
              title,
              category,
              comment,
              rating,
              status,
              sentiment,
              system_response,
              admin_reply,
              admin_reply_at,
              is_anonymous,
              created_at,
              student_id,
              student:profiles!feedback_student_id_fkey(full_name,email)
            `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map(mapFeedbackRow);
        setFeedbackItems(mapped);
      } catch (error) {
        showToast(
          error?.message || "Failed to load admin feedback data.",
          "error"
        );
        setFeedbackItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [supabase]);

  const handleStatusChange = async (feedbackId, nextStatus) => {
    const currentItem = feedbackItems.find((item) => item.id === feedbackId);

    if (!currentItem || currentItem.status === nextStatus) return;

    setUpdatingId(feedbackId);

    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status: nextStatus })
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === feedbackId ? { ...item, status: nextStatus } : item
        )
      );

      showToast("Feedback status updated successfully.", "success");
    } catch (error) {
      showToast(
        error?.message || "Failed to update feedback status.",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReplySave = async (feedbackId, replyText) => {
    setUpdatingId(feedbackId);

    try {
      const adminReplyAt = new Date().toISOString();
      const { error } = await supabase
        .from("feedback")
        .update({ admin_reply: replyText, admin_reply_at: adminReplyAt })
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === feedbackId
            ? { ...item, adminReply: replyText, adminReplyAt }
            : item
        )
      );

      showToast("Reply saved successfully.", "success");
    } catch (error) {
      showToast(error?.message || "Failed to save reply.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = feedbackItems.length;
  const pendingCount = feedbackItems.filter((item) => item.status === "pending").length;
  const reviewedCount = feedbackItems.filter((item) => item.status === "reviewed").length;
  const resolvedCount = feedbackItems.filter((item) => item.status === "resolved").length;

  const filteredItems = useMemo(() => {
    return feedbackItems.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.comment.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchesSentiment =
        sentimentFilter === "all" ||
        (sentimentFilter === "unprocessed" && item.sentiment === null) ||
        item.sentiment === sentimentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesSentiment
      );
    });
  }, [feedbackItems, search, statusFilter, categoryFilter, sentimentFilter]);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">All Feedback</h2>
          <p className="text-sm text-muted mt-1">
            Review, filter, and manage all student feedback submissions.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Feedback"
            value={totalCount}
            icon={<MessageSquareText size={20} className="text-ink-2" />}
            iconBg="bg-paper-3"
          />
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

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by title, category, or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-input border border-rule bg-paper
                text-ink placeholder-muted focus:outline-none focus:ring-2
                focus:ring-focus focus:border-transparent transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
              focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
          >
            {STATUSES.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
              focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink-2
              focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
          >
            {SENTIMENTS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : filteredItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-outlier text-muted">
              Showing {filteredItems.length} of {totalCount} feedback
              {totalCount !== 1 ? "s" : ""}
            </p>

            {filteredItems.map((item) => (
              <FeedbackManagementCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
                onReplySave={handleReplySave}
                isUpdating={updatingId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
