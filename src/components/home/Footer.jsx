import { Link } from "react-router-dom";
import FadeInSection from "./FadeInSection";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink px-4 sm:px-6 py-16 sm:py-20">
      <FadeInSection>
        <div className="max-w-6xl mx-auto grid gap-8">
          <p className="font-display font-semibold text-paper text-display-s leading-[1.05] tracking-tight max-w-[28ch]">
            Your voice belongs in the room where decisions get made.
          </p>

          <div className="flex flex-wrap items-baseline justify-between gap-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-[var(--radius-input)] flex items-center justify-center">
                <span className="text-accent-ink font-display font-semibold text-[10px]">CV</span>
              </div>
              <span className="font-display font-medium text-paper text-sm">CampusVoice</span>
            </div>

            <div className="flex items-center gap-5 text-sm text-paper/60">
              <Link to="/login" className="hover:text-paper transition-colors duration-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-paper transition-colors duration-200">
                Register
              </Link>
              <span>&copy; {currentYear} CampusVoice</span>
            </div>
          </div>
        </div>
      </FadeInSection>
    </footer>
  );
}
