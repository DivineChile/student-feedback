export default function SentimentBadge({ sentiment }) {
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
