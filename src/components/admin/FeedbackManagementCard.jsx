import { useState } from "react";
import StatusBadge from "./StatusBadge";
import SentimentBadge from "./SentimentBadge";
import RatingDots from "./RatingDots";

import { Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabaseClient";

export default function FeedbackManagementCard({
  item,
  onStatusChange,
  onReplySave,
  isUpdating,
}) {
  const supabase = createClient();

  const [replyText, setReplyText] = useState(item.adminReply || "");
  const [isDrafting, setIsDrafting] = useState(false);

  const handleGenerateDraft = async () => {
    setIsDrafting(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-draft-reply", {
        body: { id: item.id },
      });

      if (error) throw error;

      setReplyText(data.draft);
    } catch {
      showToast("Failed to generate an AI draft. Please try again.", "error");
    } finally {
      setIsDrafting(false);
    }
  };
  return (
    <div className="bg-paper border border-rule rounded-card p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{item.title}</h3>
          <p className="text-sm text-muted mt-1">{item.category}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <SentimentBadge sentiment={item.sentiment} />
        </div>
      </div>

      <p className="text-sm text-ink-2 leading-relaxed">{item.comment}</p>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-rule">
        <RatingDots rating={item.rating} />

        <span
          className={`text-xs px-2.5 py-1 rounded-pill ${
            item.isAnonymous ? "bg-paper-3 text-ink-2" : "bg-paper-3 text-ink-2"
          }`}
        >
          {item.isAnonymous ? "Anonymous Submission" : "Identified Submission"}
        </span>

        {!item.isAnonymous && (item.studentName || item.studentEmail) && (
          <span className="text-xs bg-paper-3 text-ink-2 px-2.5 py-1 rounded-pill">
            {item.studentName || item.studentEmail}
          </span>
        )}

        <span className="text-xs font-outlier text-muted ml-auto">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {item.systemResponse && (
        <div className="bg-paper-2 border border-rule rounded-card p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText size={16} className="text-ink-2 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-2 mb-1">
                System Response
              </p>
              <p className="text-sm text-ink leading-relaxed">
                {item.systemResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-rule pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Reply to Student
          </p>
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={isDrafting}
            className="px-3 py-1.5 text-xs font-medium rounded-pill border border-ink text-ink bg-transparent
              hover:bg-paper-3 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {isDrafting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            Generate AI Draft
          </button>
        </div>

        <textarea
          rows={3}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply to the student, or generate an AI draft to start from..."
          className="w-full px-3 py-2.5 text-sm rounded-input border border-rule bg-paper text-ink
            placeholder-muted focus:outline-none focus:ring-2 focus:ring-focus
            focus:border-transparent transition resize-none"
        />

        <div className="flex items-center justify-between gap-3">
          {item.adminReplyAt ? (
            <span className="text-xs font-outlier text-muted">
              Last replied {formatDate(item.adminReplyAt)}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => onReplySave(item.id, replyText.trim())}
            disabled={isUpdating || !replyText.trim() || replyText.trim() === (item.adminReply || "")}
            className="px-4 py-1.5 text-xs font-medium rounded-pill bg-accent text-accent-ink
              hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Reply
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
            Update Status
          </p>
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value)}
            disabled={isUpdating}
            className="px-3 py-2 text-sm rounded-input border border-rule bg-paper text-ink-2
              focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition
              disabled:opacity-60"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {isUpdating && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" />
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}
