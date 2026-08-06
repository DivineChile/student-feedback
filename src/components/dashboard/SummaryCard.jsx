export default function SummaryCard({ label, count, color = "text-ink", featured = false }) {
  return (
    <div
      className={`bg-paper border border-rule rounded-card px-5 py-4 flex flex-col gap-1 justify-center
        ${featured ? "sm:col-span-2" : ""}`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-outlier font-semibold ${featured ? "text-4xl" : "text-3xl"} ${color}`}>
        {count}
      </p>
    </div>
  );
}
