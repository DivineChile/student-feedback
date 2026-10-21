import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  MessageSquareText,
} from "lucide-react";
import { createClient } from "../../lib/supabaseClient";
import { showToast } from "../../components/ui/toast";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/useAuth";

export default function StudentNotificationsPage() {
  const supabase = createClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("student_notifications")
      .select("id, feedback_id, title, message, is_read, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showToast(error.message || "Could not load notifications.", "error");
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }
    setIsLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markReadAndOpen = async (notification) => {
    setUpdatingId(notification.id);
    if (!notification.is_read) {
      const { error } = await supabase
        .from("student_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notification.id)
        .eq("student_id", user.id);
      if (error) {
        showToast(
          error.message || "Could not mark notification as read.",
          "error",
        );
        setUpdatingId(null);
        return;
      }
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    }
    setUpdatingId(null);
    navigate(
      notification.feedback_id
        ? `/dashboard/my-feedback?feedbackId=${notification.feedback_id}`
        : "/dashboard/my-feedback",
    );
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("student_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("student_id", user.id)
      .eq("is_read", false);
    if (error) {
      showToast(
        error.message || "Could not mark notifications as read.",
        "error",
      );
      return;
    }
    setNotifications((items) =>
      items.map((item) => ({ ...item, is_read: true })),
    );
    showToast("All notifications marked as read.", "success");
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-muted">
            Updates when an administrator replies to your feedback.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 rounded-pill border border-rule px-4 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-card border border-rule bg-paper py-14 text-sm text-muted">
          <Loader2 size={17} className="animate-spin" /> Loading
          notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-card border border-rule bg-paper px-6 py-14 text-center">
          <Bell size={26} className="mx-auto mb-3 text-muted" />
          <h3 className="text-sm font-semibold text-ink">
            You are all caught up
          </h3>
          <p className="mt-1 text-sm text-muted">
            A notification will appear here when an administrator replies.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-rule bg-paper divide-y divide-rule">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => markReadAndOpen(notification)}
              disabled={updatingId === notification.id}
              className={`flex w-full items-start gap-4 p-5 text-left transition hover:bg-paper-2 disabled:opacity-60 ${notification.is_read ? "" : "bg-accent/5"}`}
            >
              <span
                className={`mt-0.5 rounded-full p-2 ${notification.is_read ? "bg-paper-3 text-muted" : "bg-pending-bg text-pending"}`}
              >
                <MessageSquareText size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {notification.title}
                  </span>
                  {!notification.is_read && (
                    <span className="rounded-pill bg-negative/10 px-2 py-0.5 text-[10px] font-semibold text-negative">
                      NEW
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                  {notification.message}
                </span>
                <span className="mt-2 block text-xs text-muted">
                  {formatDate(notification.created_at)}
                </span>
              </span>
              <span className="pt-1 text-muted">
                {updatingId === notification.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : notification.is_read ? (
                  <Check size={16} />
                ) : (
                  <Bell size={16} />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
