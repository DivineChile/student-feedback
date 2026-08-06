import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        isScrolled
          ? "bg-paper/75 backdrop-blur-xl border-b border-rule shadow-[0_8px_28px_-18px_rgb(0_0_0_/_0.25)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-[1fr_auto_1fr] items-center h-16">
        {/* Brand — hard left */}
        <a href="#" className="justify-self-start flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-[var(--radius-input)] flex items-center justify-center">
            <span className="text-accent-ink font-display font-semibold text-sm">CV</span>
          </div>
          <span className="font-display font-semibold text-ink text-lg">CampusVoice</span>
        </a>

        {/* Centre link cluster */}
        <nav className="hidden md:flex justify-self-center items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-ink-2 hover:text-ink transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Sign-in + filled CTA — hard right */}
        <div className="hidden md:flex justify-self-end items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-ink-2 hover:text-ink px-3 py-2 transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-accent text-accent-ink px-4 py-2 rounded-pill hover:opacity-90 transition-opacity duration-200"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden justify-self-end p-2 text-ink-2 hover:text-ink"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-paper border-t border-rule px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm text-ink-2 hover:text-ink py-1 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-rule">
            <Link
              to="/login"
              className="text-sm text-ink-2 hover:text-ink px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-accent text-accent-ink px-4 py-2 rounded-pill"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
