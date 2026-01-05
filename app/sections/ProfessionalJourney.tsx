// components/ProfessionalJourney.tsx
"use client";

import { PageTransition } from "@/components/PageTransition";
import { Briefcase, Users, GitPullRequest } from "lucide-react";

export default function ProfessionalJourney() {
  const experiences = [
    {
      id: "capstone",
      title: "Capstone Project",
      subtitle: "Tech Lead",
      icon: <GitPullRequest className="w-5 h-5" />,
      bullets: [
        "Led a team of 6 developers in building a production-ready SaaS platform using Agile methodologies",
        "Reviewed code submissions and resolved technical blockers to maintain project quality",
        "Designed and implemented UI/UX solutions according to client's satisfaction",
        "Managed API integrations and ensured smooth communication across the development team",
        "Mentored 3 teammates through code reviews, pair programming, and technical guidance",
        "Coordinated pull request reviews and maintained high code quality standards",
        "Implemented CI/CD pipelines for automated testing and deployment",
        "Documented technical specifications and architectural decisions",
      ],
    },
    {
      id: "codeblazers",
      title: "CodeBlazors",
      subtitle: "Club Member • Backend Developer",
      icon: <Users className="w-5 h-5" />,
      bullets: [
        "Learned and applied system design principles in real-world applications",
        "Contributed to backend development using MERN stack technologies",
        "Collaborated with 4+ developers in an Agile environment using ClickUp for task management",
        "Participated in code reviews and pair programming sessions",
        "Attended technical workshops on containerization and microservices",
        "Networked with industry professionals and senior developers",
        "Practiced Git workflow with feature branching and pull requests",
        "Developed RESTful APIs with authentication and authorization",
      ],
    },
  ];

  return (
    <PageTransition>
      <div id="experience">
        <header className="mb-12">
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
        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="text-primary">{exp.icon}</div>
                </div>
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
                    <span className="text-muted-foreground leading-relaxed">
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
