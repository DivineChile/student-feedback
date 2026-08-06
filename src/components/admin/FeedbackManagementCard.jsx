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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <SentimentBadge sentiment={item.sentiment} />
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{item.comment}</p>

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100">
        <RatingDots rating={item.rating} />

        <span
          className={`text-xs px-2.5 py-1 rounded-md ${
            item.isAnonymous
              ? "bg-purple-50 text-purple-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.isAnonymous ? "Anonymous Submission" : "Identified Submission"}
        </span>

        {!item.isAnonymous && (item.studentName || item.studentEmail) && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
            {item.studentName || item.studentEmail}
          </span>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {item.systemResponse && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText size={16} className="text-blue-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
                System Response
              </p>
              <p className="text-sm text-blue-900 leading-relaxed">
                {item.systemResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Reply to Student
          </p>
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={isDrafting}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-white text-blue-700
              hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center gap-1.5"
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
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-transparent transition resize-none"
        />

        <div className="flex items-center justify-between gap-3">
          {item.adminReplyAt ? (
            <span className="text-xs text-gray-400">
              Last replied {formatDate(item.adminReplyAt)}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => onReplySave(item.id, replyText.trim())}
            disabled={isUpdating || !replyText.trim() || replyText.trim() === (item.adminReply || "")}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white
              hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Reply
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Update Status
          </p>
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value)}
            disabled={isUpdating}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
              disabled:opacity-60"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {isUpdating && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}
