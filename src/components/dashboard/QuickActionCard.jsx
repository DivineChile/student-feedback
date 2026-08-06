import { Link } from "react-router-dom";

export default function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  buttonLabel = "Get Started",
  featured = false,
}) {
  return (
    <div
      className={`bg-paper border border-rule rounded-card p-6 flex flex-col gap-4
        hover:border-ink-2 transition-colors duration-200 ${featured ? "sm:col-span-2" : ""}`}
    >
      {/* Icon */}
      <div className="w-10 h-10 bg-paper-3 rounded-input flex items-center justify-center">
        <Icon size={20} className="text-accent" />
      </div>

      {/* Text */}
      <div>
        <h3 className={`font-display font-semibold text-ink mb-1 ${featured ? "text-lg" : "text-base"}`}>
          {title}
        </h3>
        <p className="text-sm text-ink-2 leading-relaxed">{description}</p>
      </div>

      {/* Link */}
      <Link
        to={href}
        className="mt-auto w-fit inline-flex items-center gap-1 text-sm font-medium text-accent
          hover:opacity-80 transition-opacity duration-150"
      >
        {buttonLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
