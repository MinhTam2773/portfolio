"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrambleText from "./ScrambleText";

/** A terrain profile unique to each sheet, so no two section rules look alike. */
function profilePath(seed: number) {
  const points: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i * 10;
    const y =
      22 -
      Math.sin(i * 0.11 + seed) * 7 -
      Math.sin(i * 0.31 + seed * 2.1) * 4 -
      Math.sin(i * 0.73 + seed * 3.7) * 1.6 -
      Math.max(0, Math.sin(i * 0.05 + seed * 0.4)) * 6;
    points.push(`${i === 0 ? "M" : "L"}${x},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

export default function SectionHeader({
  index,
  total,
  title,
  emphasis,
  kicker,
}: {
  index: number;
  total: number;
  title: string;
  emphasis?: string;
  kicker: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const sheet = String(index).padStart(2, "0");
  const words = title.split(" ");

  return (
    <header ref={ref} className="mb-14 md:mb-20">
      <div className="annot flex items-center gap-4">
        <span className="text-primary">§ {sheet}</span>
        <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="h-8 min-w-0 flex-1 overflow-visible" aria-hidden>
          <path
            d={profilePath(index * 1.7)}
            pathLength={1}
            fill="none"
            stroke="hsl(var(--foreground) / 0.35)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className={`draw-path ${inView ? "is-drawn" : ""}`}
            style={{ ["--len" as string]: 1 }}
          />
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={i * 100}
              x2={i * 100}
              y1={34}
              y2={i % 5 === 0 ? 40 : 37}
              stroke="hsl(var(--foreground) / 0.3)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <span>
          SHEET {sheet} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="font-serif text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.88] tracking-[-0.02em]">
          {words.map((word, i) => (
            <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={inView ? { y: 0 } : undefined}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}&nbsp;
              </motion.span>
            </span>
          ))}
          {emphasis && (
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block italic text-primary"
                initial={{ y: "105%" }}
                animate={inView ? { y: 0 } : undefined}
                transition={{ duration: 0.9, delay: 0.08 * words.length, ease: [0.16, 1, 0.3, 1] }}
              >
                {emphasis}
              </motion.span>
            </span>
          )}
        </h2>
        <p className="annot max-w-[16rem] leading-relaxed md:text-right">
          <ScrambleText text={kicker} start={inView} />
        </p>
      </div>
    </header>
  );
}
