import { MessageSquareText } from "lucide-react";

// Status Badge
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-pending-bg text-pending",
    reviewed: "bg-reviewed-bg text-reviewed",
    resolved: "bg-positive-bg text-positive",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-pill capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Sentiment Badge
function SentimentBadge({ sentiment }) {
  if (!sentiment) {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-pill bg-paper-3 text-muted">
        Unprocessed
      </span>
    );
  }

  const styles = {
    positive: "bg-positive-bg text-positive",
    neutral: "bg-paper-3 text-muted",
    negative: "bg-negative-bg text-negative",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-pill capitalize ${styles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}

// Rating display
function RatingDots({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= rating ? "bg-accent" : "bg-paper-3"}`}
        />
      ))}
      <span className="font-outlier text-xs text-muted ml-1">{rating}/5</span>
    </div>
  );
}

export default function FeedbackCard({ item }) {
  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {/* Top row: title + badges */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink leading-snug">
          {item.title}
        </h3>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <SentimentBadge sentiment={item.sentiment} />
        </div>
      </div>

      {/* Comment preview */}
      <p className="text-sm text-ink-2 leading-relaxed line-clamp-3">
        {item.comment}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-rule">
        {/* Category */}
        <span className="text-xs bg-paper-3 text-ink-2 px-2.5 py-1 rounded-input">
          {item.category}
        </span>

        {/* Rating */}
        <RatingDots rating={item.rating} />

        {/* Anonymous */}
        <span
          className={`text-xs px-2.5 py-1 rounded-input bg-paper-3 ${
            item.isAnonymous ? "text-accent" : "text-muted"
          }`}
        >
          {item.isAnonymous ? "Anonymous" : "Identified"}
        </span>

        {/* Date */}
        <span className="font-outlier text-xs text-muted ml-auto">
          {new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* System response */}
      {item.systemResponse && (
        <div className="bg-paper-2 border border-rule rounded-card p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText size={16} className="text-accent mt-0.5 shrink-0" />
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

      {/* Admin reply */}
      {item.adminReply && (
        <div className="bg-paper-2 border border-rule rounded-card p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText size={16} className="text-reviewed mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-2 mb-1">
                Response from Administration
              </p>
              <p className="text-sm text-ink leading-relaxed">
                {item.adminReply}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
