export default function SummaryCard({ label, value, valueColor = "text-gray-900", icon, iconBg }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
