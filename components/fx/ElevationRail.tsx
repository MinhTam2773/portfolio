"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";

const SUMMIT = 3618; // Mount Assiniboine, the tallest peak on the horizon west of Calgary
const CALGARY = 1045;

/** Scroll altimeter: reading the page is a descent from the summit down to Calgary. */
export default function ElevationRail() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const top = useTransform(progress, (p) => `${p * 100}%`);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (p) => {
    if (!readoutRef.current) return;
    const altitude = Math.round(SUMMIT - p * (SUMMIT - CALGARY));
    readoutRef.current.textContent = `${altitude.toLocaleString("en-CA")} M`;
  });

  return (
    <div aria-hidden className="pointer-events-none fixed left-5 top-1/2 z-40 hidden h-[46vh] -translate-y-1/2 min-[1400px]:block">
      <div className="annot absolute -top-9 left-0 whitespace-nowrap text-[9px]">SUMMIT</div>
      <div className="relative h-full w-3">
        <div className="absolute left-0 top-0 h-full w-px bg-foreground/20" />
        {Array.from({ length: 21 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 h-px bg-foreground/25"
            style={{ top: `${i * 5}%`, width: i % 5 === 0 ? 12 : 6 }}
          />
        ))}
        <motion.div className="absolute left-0 h-0 w-0" style={{ top }}>
          <div className="absolute -left-px -top-px h-[2px] w-5 bg-primary" />
          <span ref={readoutRef} className="absolute left-7 -top-[7px] whitespace-nowrap font-mono text-[10px] tracking-[0.14em] text-primary">
            {SUMMIT.toLocaleString("en-CA")} M
          </span>
        </motion.div>
      </div>
      <div className="annot absolute -bottom-9 left-0 whitespace-nowrap text-[9px]">CALGARY · {CALGARY.toLocaleString("en-CA")} M</div>
    </div>
  );
}
