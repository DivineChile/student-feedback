import { ShieldCheck, LayoutList, BarChart2, TrendingUp } from "lucide-react";
import FadeInSection from "./FadeInSection";

const features = [
  {
    icon: ShieldCheck,
    title: "Anonymous Feedback",
    description: "Students can share honest opinions without fear of identification or retaliation.",
    large: true,
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
    <section id="features" className="bg-paper-2 py-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <FadeInSection>
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-ink text-display-s tracking-tight mb-3">
              Why Students Use CampusVoice
            </h2>
            <p className="text-ink-2 max-w-[42rem] mx-auto text-base">
              Built to make student feedback effortless, safe, and impactful.
            </p>
          </div>
        </FadeInSection>

        {/* Bento tile grid — one larger tile, three smaller, not a uniform grid */}
        <FadeInSection delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-paper border border-rule rounded-card hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                    feature.large ? "sm:col-span-2 lg:col-span-2 p-8" : "p-6"
                  }`}
                >
                  <div
                    className={`bg-accent/10 rounded-[var(--radius-input)] flex items-center justify-center mb-4 ${
                      feature.large ? "w-12 h-12" : "w-10 h-10"
                    }`}
                  >
                    <Icon size={feature.large ? 22 : 20} className="text-accent" />
                  </div>
                  <h3
                    className={`font-display font-semibold text-ink mb-2 ${
                      feature.large ? "text-lg" : "text-base"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-ink-2 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
