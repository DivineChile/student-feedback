export default function StatusBadge({ status }) {
  const styles = {
    pending: "bg-pending-bg text-pending",
    reviewed: "bg-reviewed-bg text-reviewed",
    resolved: "bg-positive-bg text-positive",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-pill capitalize ${styles[status] || "bg-paper-3 text-muted"}`}
    >
      {status}
    </span>
  );
}
