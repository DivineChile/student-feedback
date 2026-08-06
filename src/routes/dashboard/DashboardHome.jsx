import { useEffect, useState } from "react";
import {
  MessageSquarePlus,
  ClipboardList,
  UserCircle,
  Loader2,
} from "lucide-react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { createClient } from "@/lib/supabaseClient";
import { getUser } from "@/lib/auth";
import { showToast } from "@/components/ui/toast";
import SummaryCard from "@/components/dashboard/SummaryCard";

const quickActions = [
  {
    title: "Submit Feedback",
    description:
      "Report an issue or share your thoughts about academics, facilities, or campus life.",
    href: "/dashboard/submit-feedback",
    icon: MessageSquarePlus,
    buttonLabel: "Submit Now",
  },
  {
    title: "My Feedback",
    description:
      "View all the feedback you have submitted and track their current status.",
    href: "/dashboard/my-feedback",
    icon: ClipboardList,
    buttonLabel: "View Feedback",
  },
  {
    title: "Profile Overview",
    description:
      "Review your account details and manage your student profile settings.",
    href: "/dashboard/profile",
    icon: UserCircle,
    buttonLabel: "View Profile",
  },
];

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewed: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function DashboardHome() {
  const supabase = createClient();

  const [studentName, setStudentName] = useState("Student");
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const user = await getUser();

        if (!user) {
          showToast("Your session has expired. Please log in again.", "error");
          return;
        }

        const [{ data: profileData, error: profileError }, { data: feedbackData, error: feedbackError }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .single(),
            supabase
              .from("feedback")
              .select("id, title, status, created_at")
              .eq("student_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

        if (profileError) throw profileError;
        if (feedbackError) throw feedbackError;

        setStudentName(profileData?.full_name || "Student");
        setFeedbackItems(feedbackData || []);
      } catch (error) {
        showToast(
          error?.message || "Failed to load dashboard data.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const totalFeedback = feedbackItems.length;
  const pendingCount = feedbackItems.filter(
    (item) => item.status === "pending"
  ).length;
  const resolvedCount = feedbackItems.filter(
    (item) => item.status === "resolved"
  ).length;
  const recentFeedback = feedbackItems.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {studentName} 👋
        </h2>
        <p className="text-sm text-gray-500">
          Use this dashboard to submit feedback about your campus experience and
          track responses from your institution.
        </p>
      </section>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Total Submitted"
            count={totalFeedback}
            color="text-gray-900"
          />
          <SummaryCard
            label="Pending"
            count={pendingCount}
            color="text-yellow-600"
          />
          <SummaryCard
            label="Resolved"
            count={resolvedCount}
            color="text-green-600"
          />
        </div>
      </section>

      {/* Quick Action Cards */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Recent Activity
        </h3>

        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Loading activity...
            </div>
          </div>
        ) : recentFeedback.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              No recent feedback yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your submitted feedback will appear here once you get started.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
            {recentFeedback.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted on{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
