export default function SummaryCard({
  label,
  value,
  valueColor = "text-ink",
  icon,
  iconBg = "bg-paper-3",
  className = "",
  size = "md",
}) {
  const hasIcon = icon && typeof icon !== "boolean";
  const isLarge = size === "lg";

  return (
    <div
      className={`bg-paper border border-rule rounded-card flex items-center gap-4 transition-colors duration-150 hover:border-rule-2 ${
        isLarge ? "p-6" : "p-5"
      } ${className}`}
    >
      {hasIcon && (
        <div
          className={`rounded-card flex items-center justify-center shrink-0 ${iconBg} ${
            isLarge ? "w-14 h-14" : "w-11 h-11"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p
          className={`font-outlier font-semibold leading-tight ${valueColor} ${
            isLarge ? "text-3xl" : "text-2xl"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
