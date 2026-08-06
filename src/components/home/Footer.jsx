import FadeInSection from "./FadeInSection";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CV</span>
                </div>
                <span className="text-white font-semibold">CampusVoice</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                A secure, anonymous platform empowering students to shape the future of their institutions.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Security", href: "#security" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                {[
                  { label: "Login", href: "/login" },
                  { label: "Register", href: "/register" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            &copy; {currentYear} CampusVoice. All rights reserved.
          </div>
        </div>
      </FadeInSection>
    </footer>
  );
}
