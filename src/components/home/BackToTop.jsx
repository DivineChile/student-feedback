import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 cursor-pointer hover:scale-125 right-6 z-50 w-10 h-10 bg-accent text-accent-ink rounded-pill shadow-lg flex items-center justify-center hover:opacity-90 transition-all duration-200"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
