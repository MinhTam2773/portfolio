"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/types/project";

type KeepExploringCarouselProps = {
  projects: Project[];
  currentSlug: string;
};

export default function KeepExploringCarousel({ projects, currentSlug }: KeepExploringCarouselProps) {
  const items = useMemo(
    () => projects.filter((project) => project.slug !== currentSlug),
    [projects, currentSlug],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/40 p-4 text-sm text-muted-foreground">
        No additional projects yet.
      </div>
    );
  }

  const goPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Get the two projects to display
  const getVisibleProjects = () => {
    const firstProject = items[activeIndex];
    const secondIndex = (activeIndex + 1) % items.length;
    const secondProject = items[secondIndex];
    return [firstProject, secondProject];
  };

  const visibleProjects = getVisibleProjects();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={goPrevious}
          className="shrink-0 h-10 w-10 inline-flex items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors"
          aria-label="Previous project"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {visibleProjects.map((project, idx) => (
            <Link
              key={`${project.slug}-${idx}`}
              href={`/${project.slug}`}
              className="group block rounded-xl border border-border/50 hover:border-primary/35 overflow-hidden transition-colors"
            >
              <div className="relative w-full h-44 md:h-48">
                <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goNext}
          className="shrink-0 h-10 w-10 inline-flex items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors"
          aria-label="Next project"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Position Indicators */}
      <div className="flex justify-center gap-2" aria-label="Project position indicators">
        {items.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex || index === (activeIndex + 1) % items.length
                ? "w-7 bg-primary"
                : "w-2.5 bg-muted-foreground/60"
            }`}
            aria-label={`Go to project ${index + 1} of ${items.length}`}
          />
        ))}
      </div>
    </div>
  );
}
