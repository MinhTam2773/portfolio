// components/ProfessionalJourney.tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import SectionHeader from "@/components/fx/SectionHeader";

const experiences = [
  {
    id: "intelbyte",
    title: "Intelbyte Corp",
    subtitle: "Power Platform & AI Solutions Developer",
    badge: "Full-Time Role",
    dates: "Aug 2026 - Present",
    bullets: [
      "Support senior developers in client meetings by capturing business processes, documenting requirements, and translating them into low-code prototypes and proof-of-concept solutions.",
      "Build and test Canvas and Model-Driven Power Apps, Power Automate flows, and Copilot Studio experiences under mentorship while communicating progress and questions clearly.",
      "Integrate Azure OpenAI Service, custom connectors, and AI-enabled workflows for document processing, prediction, and intelligent automation use cases.",
      "Contribute to agile delivery, solution documentation, user guides, and basic ALM tasks such as exporting solutions and version updates.",
    ],
  },
  {
    id: "capstone",
    title: "Capstone Project",
    subtitle: "Fullstack Developer",
    badge: "Leadership",
    dates: "2025 - Present",
    bullets: [
      "Directed a team of 6 developers to design and build a production-ready multi-tenant SaaS platform from scratch, translating business needs into functional implementations using Agile methodologies.",
      "Mentored 3 team members through code reviews, pair programming, and technical guidance, improving team delivery speed by 30%.",
      "Designed a multi-layer testing strategy with Vitest and Playwright, reducing critical system bugs by 40% while sustaining 99.8% uptime during high-load simulations of 1,000+ users.",
      "Architected a 34-table PostgreSQL database with Row Level Security (RLS) and role-based access control (Owner, Manager, Barber, Front Desk), enabling secure multi-tenancy for 500+ simulated barbershops.",
      "Built automated CI/CD pipelines with OpenTelemetry for system monitoring and Inngest for robust retry logic, reducing manual intervention significantly.",
      "Engineered a real-time queue engine with ETA predictions and SMS notifications via Twilio, reducing customer wait times by 20–25%.",
    ],
  },
  {
    id: "codeblazer",
    title: "SAIT Codeblazer",
    subtitle: "Backend Developer / Club Member",
    badge: "Club Member",
    dates: "Feb 2025 - July 2025",
    bullets: [
      "Contributed to the backend development of a full-stack inventory management web application for a real client (Allenty) alongside a team of 4 developers during bi-weekly Agile sprints.",
      "Strengthened system robustness by implementing strict input validation, data sanitization, and comprehensive try/except error handling.",
      "Improved depreciation calculation accuracy by introducing consistent date handling and refactoring core functions to accept optional historical/future date parameters.",
      "Participated in system design discussions, architectural planning, and workshops on microservices and containerization.",
    ],
  },
];

export default function ProfessionalJourney() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section id="experience" className="scroll-mt-24">
      <SectionHeader index={3} total={4} title="Field" emphasis="Log" kicker="Experience · most recent entry first" />

      <div ref={trackRef} className="relative">
        {/* Survey line: drawn in orange as you read down it */}
        <div className="absolute bottom-0 left-[5px] top-0 w-px bg-border md:left-[calc(25%+5px)]" />
        <motion.div
          className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-primary md:left-[calc(25%+5px)]"
          style={{ scaleY: fill }}
        />

        <div className="space-y-24">
          {experiences.map((exp, i) => (
            <article key={exp.id} className="relative grid grid-cols-1 gap-6 pl-10 md:grid-cols-4 md:gap-0 md:pl-0">
              <div className="annot space-y-2 md:pr-12 md:pt-3 md:text-right">
                <p className="text-foreground">{exp.dates}</p>
                <p>
                  Entry {String(i + 1).padStart(2, "0")} · {exp.badge}
                </p>
              </div>

              {/* Station marker */}
              <motion.span
                className="absolute left-0 top-1 h-[11px] w-[11px] rotate-45 border border-primary bg-background md:left-1/4 md:top-4"
                initial={{ backgroundColor: "hsl(var(--background))" }}
                whileInView={{ backgroundColor: "hsl(var(--primary))" }}
                viewport={{ margin: "-55% 0px -40% 0px" }}
                transition={{ duration: 0.3 }}
              />

              <div className="md:col-span-3 md:pl-14">
                <h3 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] leading-none tracking-[-0.015em]">{exp.title}</h3>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-primary">{exp.subtitle}</p>

                <ul className="mt-8 space-y-4">
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <motion.li
                      key={bulletIndex}
                      className="grid grid-cols-[2rem_1fr] leading-relaxed text-foreground/85"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-10% 0px" }}
                      transition={{ duration: 0.6, delay: bulletIndex * 0.05 }}
                    >
                      <span className="pt-[0.35em] font-mono text-[10px] text-muted-foreground">
                        {String(bulletIndex + 1).padStart(2, "0")}
                      </span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
