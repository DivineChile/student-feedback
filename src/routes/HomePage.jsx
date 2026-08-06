import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import SecuritySection from "@/components/home/SecuritySection";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import BackToTop from "@/components/home/BackToTop";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SecuritySection />
      <CTA />
      <Footer />
      <BackToTop />
    </main>
  );
}
