import { ParticleCanvas } from "@/components/landing/particle-canvas";
import { HeroContent } from "@/components/landing/hero-content";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f0f4f8] dark:bg-[#0a0f1a]">
      <ParticleCanvas />
      <HeroContent />
      <ThemeToggle />
    </main>
  );
}
