"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/fx/SectionHeader";

const COURSEWORK = [
  "Advanced Data Structures",
  "Software Architecture",
  "Database Systems",
  "Web Development",
  "Mobile App Development",
  "Cloud Computing",
  "Agile Methodologies",
  "Security Fundamentals",
];

const AWARDS = [
  {
    marker: "A",
    title: "Alvin and Mona Libin Foundation Award for Capstone Excellence",
    tag: "SAIT Award",
    body: "Recognized for capstone excellence in software development, highlighting technical execution, team delivery, and real-world project impact.",
    link: {
      label: "LinkedIn Post",
      href: "https://www.linkedin.com/posts/minhtam-dev_i-am-incredibly-honored-to-have-been-selected-share-7471390736286908416-lXsx/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFJB_E0BQAQnURjuBtXNVSZXFJ1V76OzLhs",
    },
  },
  {
    marker: "B",
    title: "2nd at SAIT MegaHack Hackathon",
    tag: "VibeMap",
    body: "VibeMap reimagines community mapping through an empathy-driven lens. Users share emotional impressions using emojis, which are aggregated into soft heatmaps that reveal collective energy patterns, helping people discover places that resonate with them.",
    link: { label: "DevPost", href: "https://devpost.com/software/vibemap-r89y5l" },
  },
];

/** The GPA drawn as a closed contour: a full 4.0 is a complete loop. */
function GpaContour() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const rings = [1, 0.88, 0.76];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg ref={ref} viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {rings.map((scale, i) => {
          // Irregular closed contours, like elevation rings around a summit.
          const points = Array.from({ length: 73 }, (_, k) => {
            const a = (k / 72) * Math.PI * 2;
            const r = 100 * scale * (1 + Math.sin(a * 3 + i) * 0.045 + Math.sin(a * 5 + i * 2) * 0.03);
            return `${k === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
          }).join(" ");
          return (
            <motion.path
              key={scale}
              d={points}
              fill="none"
              stroke={i === 0 ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.28)"}
              strokeWidth={i === 0 ? 1.5 : 1}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : undefined}
              transition={{ duration: 2.2, delay: 0.2 + (rings.length - i) * 0.18, ease: [0.65, 0, 0.35, 1] }}
            />
          );
        })}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : undefined} transition={{ delay: 2.2 }}>
          <path d="M-4,-118 L4,-118 L0,-110 Z" fill="hsl(var(--primary))" />
        </motion.g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[6.5rem] leading-none tracking-[-0.04em]">4.0</span>
        <span className="annot mt-1">GPA · out of 4.0</span>
      </div>
    </div>
  );
}

export default function Education() {
  return (
    <section id="education" className="scroll-mt-24">
      <SectionHeader index={1} total={4} title="Education &" emphasis="Awards" kicker="Where the instruments were calibrated" />

      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <GpaContour />
        </div>

        <div className="md:col-span-7">
          <p className="annot">Sep 2024 — Apr 2026</p>
          <h3 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Software Development Diploma</h3>
          <p className="mt-2 text-muted-foreground">Southern Alberta Institute of Technology (SAIT)</p>

          <p className="annot mt-10 mb-4">Relevant coursework</p>
          <ul className="grid grid-cols-1 border-t border-border sm:grid-cols-2">
            {COURSEWORK.map((course, i) => (
              <li
                key={course}
                className="group flex items-baseline gap-4 border-b border-border py-3 transition-colors hover:text-primary sm:odd:border-r sm:odd:pr-4 sm:even:pl-4"
              >
                <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary">{String(i + 1).padStart(2, "0")}</span>
                {course}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-24">
        <p className="annot mb-6">Markers placed</p>
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
          {AWARDS.map((award) => (
            <article key={award.title} className="group relative flex flex-col bg-background p-7 transition-colors hover:bg-secondary md:p-9">
              <div className="flex items-start justify-between gap-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary font-mono text-sm text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {award.marker}
                </span>
                <span className="annot">{award.tag}</span>
              </div>
              <h3 className="mt-8 font-serif text-3xl leading-[1.1]">{award.title}</h3>
              <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{award.body}</p>
              <a
                href={award.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="annot mt-8 inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                {award.link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
