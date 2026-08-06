import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2, Search } from "lucide-react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/toast";
import FeedbackCard from "@/components/dashboard/FeedbackCard";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { CATEGORIES } from "@/utils/categories";
import { STATUSES } from "@/utils/status";

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-14 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ClipboardList size={22} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        No feedback submitted yet
      </h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
        You haven&apos;t submitted any feedback. Help improve your institution by
        sharing your experience.
      </p>
      <Link
        to="/dashboard/submit-feedback"
        className="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg
          hover:bg-blue-700 transition-colors duration-200"
      >
        Submit Feedback
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-14 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        Loading your feedback...
      </div>
    </div>
  );
}

function mapFeedbackRow(row) {
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
  };
}

export default function MyFeedbackPage() {
  const supabase = createClient();

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);

      try {
        const user = await getUser();

        if (!user) {
          showToast("Your session has expired. Please log in again.", "error");
          setFeedbackItems([]);
          return;
        }

        const { data, error } = await supabase
          .from("feedback")
          .select(
            "id, title, category, comment, rating, status, sentiment, system_response, admin_reply, admin_reply_at, is_anonymous, created_at"
          )
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const mappedData = (data || []).map(mapFeedbackRow);

        setFeedbackItems(mappedData);
      } catch (error) {
        showToast(
          error?.message || "Failed to load your feedback. Please try again.",
          "error"
        );
        setFeedbackItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [supabase]);

  const total = feedbackItems.length;
  const pending = feedbackItems.filter((item) => item.status === "pending").length;
  const resolved = feedbackItems.filter((item) => item.status === "resolved").length;

  const filteredItems = useMemo(() => {
    return feedbackItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [feedbackItems, search, statusFilter, categoryFilter]);

  return (
    <main className="flex-1">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Feedback</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track the feedback you have submitted.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Total Submitted" count={total} color="text-gray-900" />
          <SummaryCard label="Pending" count={pending} color="text-yellow-600" />
          <SummaryCard label="Resolved" count={resolved} color="text-green-600" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white
                text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            className="px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
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
            <p className="text-xs text-gray-400">
              Showing {filteredItems.length} of {total} feedback
              {total !== 1 ? "s" : ""}
            </p>

            {filteredItems.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
