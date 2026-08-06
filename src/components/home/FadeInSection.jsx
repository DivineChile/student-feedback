// The marketing page's modern-minimal theme keeps motion minimal — no scroll-reveal.
// Kept as a passthrough (rather than removing every call site) so section
// composition doesn't need to change if reveals are ever reintroduced deliberately.
export default function FadeInSection({ children }) {
  return children;
}
