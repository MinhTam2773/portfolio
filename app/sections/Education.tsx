import { PageTransition } from "@/components/PageTransition";
import { Book } from "lucide-react";

export default function Education() {
  return (
    <PageTransition>
      <div id="education">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Book className="text-primary w-8 h-8" />
            <h1 className="bg-linear-to-r from-white to-primary text-transparent bg-clip-text text-3xl md:text-4xl font-bold">
              Education
            </h1>
          </div>
          <div className="relative h-px w-full mx-auto overflow-hidden rounded-full">
            {/* Static gradient bar */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
          </div>
        </header>

        <div className="gap-12">
          <div className="md:col-span-1">
            <div className="glass-card p-6 rounded-xl border border-border/50 mb-8">
              <div className="space-y-6">
                <div className="pb-6 border-b border-border/30">
                  <h3 className="font-bold text-lg">
                    Software Development Diploma
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Southern Alberta Institute of Technology (SAIT)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    September 2024 - April 2026
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-primary font-bold">
                      GPA: 4.0/4.0
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      Top of Class
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Relevant Coursework</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Advanced Data Structures",
                      "Software Architecture",
                      "Database Systems",
                      "Web Development",
                      "Mobile App Development",
                      "Cloud Computing",
                      "Agile Methodologies",
                      "Security Fundamentals",
                    ].map((course) => (
                      <span
                        key={course}
                        className="text-xs font-mono px-3 py-1 bg-secondary/50 rounded-full border border-border"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Certifications</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Google Cloud Fundamentals (In Progress)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      AWS Certified Cloud Practitioner
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Microsoft Azure Fundamentals
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
