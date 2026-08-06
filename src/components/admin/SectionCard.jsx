export default function SectionCard({ title, subtitle, children }) {
  return (
    <section className="bg-paper border border-rule rounded-card">
      <div className="px-6 py-4 border-b border-rule">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
