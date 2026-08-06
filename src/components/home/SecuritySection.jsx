import { Lock, UserX, ShieldCheck } from "lucide-react";
import FadeInSection from "./FadeInSection";

const securityPoints = [
  {
    icon: UserX,
    title: "Fully Anonymous Submissions",
    description: "Your name, student ID, and identity are never stored or associated with your feedback.",
  },
  {
    icon: Lock,
    title: "Secure Data Management",
    description: "All feedback data is encrypted and stored securely. Access is restricted to authorised administrators only.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Space to Speak Up",
    description: "We're committed to ensuring every student feels safe to share honest, unfiltered opinions.",
  },
];

const proofPoints = ["No name stored", "No IP tracking", "No student ID linked", "Encrypted data"];

export default function SecuritySection() {
  return (
    <section id="security" className="bg-paper-2 py-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Trust strip — heading, then a row of proof tiles, then a proof-marker row */}
        <FadeInSection>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-pill mb-4">
              Privacy First
            </span>
            <h2 className="font-display font-semibold text-ink text-display-s tracking-tight mb-4">
              Your Identity Stays Protected
            </h2>
            <p className="text-ink-2 leading-relaxed">
              We built CampusVoice with anonymity at its core. Students shouldn't
              have to choose between speaking up and staying safe.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {securityPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="bg-paper border border-rule rounded-card p-6 text-center"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-[var(--radius-input)] flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <h3 className="font-display font-semibold text-ink text-sm mb-2">{point.title}</h3>
                  <p className="text-sm text-ink-2 leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </FadeInSection>

        <FadeInSection delay={250}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8 border-t border-rule">
            {proofPoints.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 text-sm text-ink-2 bg-paper border border-rule rounded-pill px-4 py-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-positive shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
