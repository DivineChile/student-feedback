import FadeInSection from "./FadeInSection";

export default function Hero() {
  return (
    <section className="bg-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <FadeInSection delay={100}>
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-5">
              Student Feedback Platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
              Your Voice Can{" "}
              <span className="text-blue-600">Improve Your Campus</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              A secure platform where students can share honest feedback about
              academics, facilities, and campus life — completely anonymously.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
              </a>
              <a
                href="#how-it-works"
                className="border border-gray-200 text-gray-600 px-6 py-3 rounded-lg text-sm font-medium hover:border-gray-300 hover:text-gray-900 transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">10k+</p>
                <p className="text-xs text-gray-500 mt-0.5">Students</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-xs text-gray-500 mt-0.5">Institutions</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-xs text-gray-500 mt-0.5">Anonymity Rate</p>
              </div>
            </div>
          </FadeInSection>

          {/* Right: Visual Card */}
          <div className="lg:flex justify-center hidden">
            <FadeInSection delay={250}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Anonymous Student</p>
                      <p className="text-xs text-gray-400">Just now</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                    Submitted
                  </span>
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Category</p>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      Campus Facilities
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      The library study rooms need better ventilation and more power outlets for students.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="w-5 h-5 rounded bg-blue-500" />
                      ))}
                      <div className="w-5 h-5 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400">
                    Add a comment...
                  </div>
                  <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg">
                    Send
                  </button>
                </div>
              </div>
            </FadeInSection>
          </div>

        </div>
      </div>
    </section>
  );
}
