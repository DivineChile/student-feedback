import { MessageSquareText } from "lucide-react";

// Status Badge
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
    resolved: "bg-green-50 text-green-700 border border-green-200",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Sentiment Badge
function SentimentBadge({ sentiment }) {
  if (!sentiment) {
    return (
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
        Unprocessed
      </span>
    );
  }

  const styles = {
    positive: "bg-green-50 text-green-700 border border-green-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    negative: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[sentiment]}`}
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
          className={`w-2 h-2 rounded-full ${
            i <= rating ? "bg-blue-500" : "bg-gray-200"
          }`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating}/5</span>
    </div>
  );
}

export default function FeedbackCard({ item }) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4"
    >
      {/* Top row: title + badges */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">
          {item.title}
        </h3>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={item.status} />
          <SentimentBadge sentiment={item.sentiment} />
        </div>
      </div>

      {/* Comment preview */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
        {item.comment}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100">
        {/* Category */}
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
          {item.category}
        </span>

        {/* Rating */}
        <RatingDots rating={item.rating} />

        {/* Anonymous */}
        <span
          className={`text-xs px-2.5 py-1 rounded-md ${
            item.isAnonymous
              ? "bg-purple-50 text-purple-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.isAnonymous ? "Anonymous" : "Identified"}
        </span>

        {/* Date */}
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* System response */}
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

      {/* Admin reply */}
      {item.adminReply && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText size={16} className="text-purple-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 mb-1">
                Response from Administration
              </p>
              <p className="text-sm text-purple-900 leading-relaxed">
                {item.adminReply}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
