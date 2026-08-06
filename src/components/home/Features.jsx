import { ShieldCheck, LayoutList, BarChart2, TrendingUp } from "lucide-react";
import FadeInSection from "./FadeInSection";

const features = [
  {
    icon: ShieldCheck,
    title: "Anonymous Feedback",
    description: "Students can share honest opinions without fear of identification or retaliation.",
  },
  {
    icon: LayoutList,
    title: "Structured Feedback System",
    description: "Submit feedback using categories and ratings for clear, actionable responses.",
  },
  {
    icon: BarChart2,
    title: "Real-Time Insights",
    description: "Administrators gain live insights to quickly identify and improve campus services.",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Decisions",
    description: "Institutions use feedback analytics to guide meaningful, measurable improvements.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <FadeInSection>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Students Use CampusVoice
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Built to make student feedback effortless, safe, and impactful.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={150}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
