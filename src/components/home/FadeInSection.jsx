import { useCallback } from "react";

let observer = null;

function getObserver() {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  return observer;
}

export default function FadeInSection({ children, delay = 0 }) {
  const callbackRef = useCallback(
    (node) => {
      if (!node) return;
      node.style.transitionDelay = `${delay}ms`;
      getObserver().observe(node);
    },
    [delay]
  );

  return (
    <div ref={callbackRef} className="fade-in-hidden">
      {children}
    </div>
  );
}
