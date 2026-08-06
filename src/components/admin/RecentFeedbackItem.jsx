import StatusBadge from "./StatusBadge";

export default function RecentFeedbackItem({ item }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-rule last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
        </div>
        <p className="text-xs text-muted line-clamp-1 mb-2">{item.comment}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-paper-3 text-ink-2 px-2 py-0.5 rounded-pill">
            {item.category}
          </span>
          <StatusBadge status={item.status} />
          <span className="text-xs font-outlier text-muted">{item.date}</span>
        </div>
      </div>
    </div>
  );
}
