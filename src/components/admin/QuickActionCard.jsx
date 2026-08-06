import { Link } from "react-router-dom";

export default function QuickActionCard({ title, description, href, buttonLabel, icon, className = "" }) {
  return (
    <div
      className={`bg-paper border border-rule rounded-card p-5 flex flex-col gap-4 ${className}`}
    >
      <div className="w-10 h-10 bg-paper-3 rounded-card flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
      <Link
        to={href}
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80 transition-opacity"
      >
        {buttonLabel} →
      </Link>
    </div>
  );
}
