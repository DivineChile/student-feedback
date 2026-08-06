import StatusBadge from "./StatusBadge";

export default function RecentFeedbackItem({ item }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.comment}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
            {item.category}
          </span>
          <StatusBadge status={item.status} />
          <span className="text-xs text-gray-400">{item.date}</span>
        </div>
      </div>
    </div>
  );
}
