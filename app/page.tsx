// app/page.tsx
"use client";

import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import TechArsenal from "./sections/TechArsenal";
import ProfessionalJourney from "./sections/ProfessionalJourney";
import Education from "./sections/Education";
import PageSky from "@/components/ocean/PageSky";
import { PortfolioStats } from "@/components/PortfolioStats";

export default function Home() {
  return (
    <main>
      <PageSky />
      <Hero />

      <div className="container-custom flex flex-col gap-40 pb-40 pt-40 md:gap-56 md:pt-56">
        <Education />
        <Projects />
        <ProfessionalJourney />
        <TechArsenal />
      </div>

      {/* Centred in the 400px between Tech and the footer heading: 160 here, 160 + 80 in the footer. */}
      <div className="relative">
        <div className="absolute inset-x-0 top-10 flex -translate-y-1/2 justify-center">
          <PortfolioStats />
        </div>
      </div>
    </main>
  );
}
