import FadeInSection from "./FadeInSection";

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Sign up with your student credentials. Your identity is never linked to your feedback.",
  },
  {
    number: "02",
    title: "Submit Your Feedback",
    description: "Choose a category and describe your experience — academics, facilities, admin, or anything else.",
  },
  {
    number: "03",
    title: "Drive Real Change",
    description: "Administrators review anonymised feedback and take action to improve your campus experience.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-paper py-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <FadeInSection>
          <div className="text-center mb-14">
            <h2 className="font-display font-semibold text-ink text-display-s tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-ink-2 max-w-xl mx-auto text-base">
              Three simple steps to make your voice heard on campus.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-1/4 right-1/4 h-px bg-rule z-0" />
            {steps.map((step) => (
              <div key={step.number} className="relative z-10 text-center">
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 bg-accent text-accent-ink rounded-pill flex items-center justify-center font-outlier text-lg shadow-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-ink text-base mb-2">{step.title}</h3>
                <p className="text-sm text-ink-2 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
