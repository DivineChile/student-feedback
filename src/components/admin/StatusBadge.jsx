export default function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
    resolved: "bg-green-50 text-green-700 border border-green-200",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
