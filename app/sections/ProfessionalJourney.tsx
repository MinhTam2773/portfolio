// components/ProfessionalJourney.tsx
"use client";

import { PageTransition } from "@/components/PageTransition";
import { Briefcase, GitPullRequest } from "lucide-react";

export default function ProfessionalJourney() {
  const experiences = [
    {
      id: "capstone",
      title: "Capstone Project",
      subtitle: "Fullstack Developer",
      icon: <GitPullRequest className="w-5 h-5" />,
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
      icon: <GitPullRequest className="w-5 h-5" />,
      bullets: [
        "Contributed to the backend development of a full-stack inventory management web application for a real client (Allenty) alongside a team of 4 developers during bi-weekly Agile sprints.",
        "Strengthened system robustness by implementing strict input validation, data sanitization, and comprehensive try/except error handling.",
        "Improved depreciation calculation accuracy by introducing consistent date handling and refactoring core functions to accept optional historical/future date parameters.",
        "Participated in system design discussions, architectural planning, and workshops on microservices and containerization.",
      ],
    },
  ];

  return (
    <PageTransition>
      <div id="experience">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-primary w-8 h-8" />
            <h1 className="bg-linear-to-r from-white to-primary text-transparent bg-clip-text text-3xl md:text-4xl font-bold">
              Experience
            </h1>
          </div>
          <div className="relative h-px w-full mx-auto overflow-hidden rounded-full">
            {/* Static gradient bar */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
          </div>
        </header>

        {/* Simple Cards Layout */}
        <div className="grid md:grid-cols-1 gap-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl hover:border-primary/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {exp.title}
                  </h3>
                  <p className="text-primary font-medium mt-1">
                    {exp.subtitle}
                  </p>
                </div>
              </div>

              {/* Badge */}
              <div className="mb-6">
                {exp.id === "capstone" ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      Leadership
                    </span>

                    <span className="text-right flex-1 py-1 text-muted-foreground text-xs font-bold rounded-full">
                      2025 - Present
                    </span>
                  </div>
                ) : exp.id === "codeblazer" ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      Club Member
                    </span>

                    <span className="text-right flex-1 py-1 text-muted-foreground text-xs font-bold rounded-full">
                      Feb 2025 - July 2025
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      Team Project
                    </span>

                    <span className="text-right flex-1 py-1 text-muted-foreground text-xs font-bold rounded-full">
                      March 2025 - June 2025
                    </span>
                  </div>
                )}
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="flex items-start gap-3">
                    <div className="shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                    <span className="text-white/90 leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
