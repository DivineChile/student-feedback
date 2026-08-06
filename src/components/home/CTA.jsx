import FadeInSection from "./FadeInSection";

export default function CTA() {
  return (
    <section className="bg-paper-2 border-y border-rule py-2xl px-4 sm:px-6 lg:px-8">
      <FadeInSection>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-semibold text-ink text-display-s tracking-tight mb-4">
            Help Improve Your Institution
          </h2>
          <p className="text-ink-2 text-base mb-8 leading-relaxed max-w-lg mx-auto">
            Join students already making their campuses better — one piece
            of anonymous feedback at a time.
          </p>
          <div className="flex justify-center">
            <a
              href="#"
              className="bg-accent text-accent-ink font-medium px-8 py-3 rounded-pill text-sm hover:opacity-90 transition-opacity duration-200"
            >
              Sign Up Free
            </a>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
