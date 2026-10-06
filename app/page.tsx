// app/page.tsx
"use client";

import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import TechArsenal from "./sections/TechArsenal";
import ProfessionalJourney from "./sections/ProfessionalJourney";
import Education from "./sections/Education";
import ElevationRail from "@/components/fx/ElevationRail";

export default function Home() {
  return (
    <main>
      <Hero />
      <ElevationRail />

      <div className="container-custom flex flex-col gap-40 pb-16 pt-16 md:gap-56">
        <Education />
        <Projects />
        <ProfessionalJourney />
        <TechArsenal />
      </div>
    </main>
  );
}
