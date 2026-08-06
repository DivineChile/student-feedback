import { Link } from "react-router-dom";

export default function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  buttonLabel = "Get Started",
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">

      {/* Icon */}
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
        <Icon size={20} className="text-blue-600" />
      </div>

      {/* Text */}
      <div>
        <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* Link Button */}
      <Link
        to={href}
        className="mt-auto inline-block text-sm font-medium text-blue-600
          hover:text-blue-700 transition-colors duration-200"
      >
        {buttonLabel} →
      </Link>
    </div>
  );
}
