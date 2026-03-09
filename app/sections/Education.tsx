import { PageTransition } from "@/components/PageTransition";
import { Book, Award, ExternalLink } from "lucide-react";

export default function Education() {
  return (
    <PageTransition>
      <div id="education">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Book className="text-primary w-8 h-8" />
            <h1 className="bg-linear-to-r from-white to-primary text-transparent bg-clip-text text-3xl md:text-4xl font-bold">
              Education & Awards
            </h1>
          </div>
          <div className="relative h-px w-full mx-auto overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column: Education */}
          <div>
            <div className="rounded-xl mb-8">
              <div className="space-y-6">
                <div className="pb-6 border-b border-border/30">
                  <h3 className="font-bold text-lg">
                    Software Development Diploma
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Southern Alberta Institute of Technology (SAIT)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    September 2024 – April 2026
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-primary font-bold">
                      GPA: 4.0/4.0
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

          {/* Right column: Awards & Hackathons */}
          <div>
            <div className="rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-primary w-6 h-6" />
                  <h2 className="text-2xl font-semibold">
                    2nd at SAIT MegaHack Hackathon
                  </h2>
                </div>

                {/* VibeMap Entry */}
                <div className="p-5 bg-secondary/20 rounded-xl border border-border/50">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    VibeMap
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                      Hackathon Project
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vibe Check your city – discover spaces that match your
                    energy.
                  </p>
                  <p className="text-sm mt-3">
                    VibeMap reimagines community mapping through an
                    empathy-driven lens. Users share emotional impressions
                    using emojis, which are aggregated into soft heatmaps that
                    reveal collective energy patterns, helping people discover places that resonate with
                    them.
                  </p>
                  <div className="mt-4">
                    <a
                      href="https://devpost.com/software/vibemap-r89y5l"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      DevPost
                    </a>
                    {/* Replace with actual Devpost link when available */}
                    {/* <a
                      href="https://devpost.com/software/vibemap"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline ml-4"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Devpost
                    </a> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
