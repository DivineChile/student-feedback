export default function SentimentBadge({ sentiment }) {
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
      className={`text-xs font-medium px-2.5 py-1 rounded-pill capitalize ${styles[sentiment] || "bg-paper-3 text-muted"}`}
    >
      {sentiment}
    </span>
  );
}
