import FadeInSection from "./FadeInSection";

// Small, subtle "voice" motif — pure CSS bars, no library. Tier-A enrichment
// permitted on the marketing hero per design.md.
const waveformBars = [8, 14, 22, 32, 24, 38, 20, 30, 16, 10, 6];

export default function Hero() {
  return (
    <section className="bg-paper pt-32 pb-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">

        <FadeInSection>
          <span className="inline-block bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-pill mb-6">
            Student Feedback Platform
          </span>

          <h1 className="font-display font-semibold text-ink text-display leading-[1.05] tracking-tight mb-6">
            Your Voice Can{" "}
            <span className="text-accent">Improve Your Campus</span>
          </h1>

          <p className="text-ink-2 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            A secure platform where students can share honest feedback about
            academics, facilities, and campus life — completely anonymously.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="bg-accent text-accent-ink px-6 py-3 rounded-pill text-sm font-medium hover:opacity-90 transition-opacity duration-200"
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              className="border border-ink text-ink bg-transparent px-6 py-3 rounded-pill text-sm font-medium hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </FadeInSection>

        <FadeInSection delay={200}>
          <div
            className="flex items-end justify-center gap-1.5 h-10 mt-14"
            aria-hidden="true"
          >
            {waveformBars.map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-pill bg-accent"
                style={{ height: `${h}px`, opacity: 0.3 + (i % 3) * 0.2 }}
              />
            ))}
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
