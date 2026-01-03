// app/page.tsx
"use client";

import { PageTransition } from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import TechArsenal from "./sections/TechArsenal";
import ProfessionalJourney from "./sections/ProfessionalJourney";
import Education from "./sections/Education";

export default function Home() {
  return (
    <PageTransition>
      <main className="container-custom flex flex-col justify-center min-h-[80vh]">
        {/* Hero doesn't need animation as it's first */}
        <Hero/>
        
        {/* Each section with staggered animation */}
        
        <ScrollReveal delay={0.1}>
          <Education />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Projects />
        </ScrollReveal>
        
        <ScrollReveal delay={0.3}>
          <ProfessionalJourney />
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <TechArsenal />
        </ScrollReveal>
        
      </main>
    </PageTransition>
  );
}