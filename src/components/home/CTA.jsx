import FadeInSection from "./FadeInSection";

export default function CTA() {
  return (
    <section className="bg-blue-600 py-20 px-4 sm:px-6 lg:px-8">
      <FadeInSection>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Help Improve Your Institution
          </h2>
          <p className="text-blue-100 text-base mb-8 leading-relaxed">
            Join thousands of students already making their campuses better — one
            piece of anonymous feedback at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="bg-white text-blue-600 font-medium px-6 py-3 rounded-lg text-sm hover:bg-blue-50 transition-colors duration-200"
            >
              Sign Up Free
            </a>
            <a
              href="#"
              className="border border-blue-400 text-white font-medium px-6 py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              Login
            </a>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
