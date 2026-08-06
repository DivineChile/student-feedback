import { Link } from "react-router-dom";

export default function QuickActionCard({ title, description, href, buttonLabel, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <Link
        to={href}
        className="mt-auto inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        {buttonLabel} →
      </Link>
    </div>
  );
}
