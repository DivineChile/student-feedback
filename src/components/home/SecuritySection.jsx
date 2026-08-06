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

export default function SecuritySection() {
  return (
    <section id="security" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <FadeInSection delay={100}>
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
              Privacy First
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Identity Stays Protected
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              We built CampusVoice with anonymity at its core. Students shouldn't
              have to choose between speaking up and staying safe.
            </p>
            <div className="space-y-5">
              {securityPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex gap-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{point.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeInSection>

          {/* Right */}
          <div className="flex justify-center">
            <FadeInSection delay={250}>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Lock size={28} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">End-to-End Anonymity</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Your feedback is completely decoupled from your identity the moment you submit it.
                </p>
                <div className="space-y-2">
                  {["No name stored", "No IP tracking", "No student ID linked", "Encrypted data"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>

        </div>
      </div>
    </section>
  );
}
