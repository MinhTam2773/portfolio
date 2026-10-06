"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const GLYPHS = "▲△◆◇■□●○/\\|—+×#%01";

/** Text that decodes out of survey glyphs the first time it scrolls into view. */
export default function ScrambleText({
  text,
  className,
  duration = 900,
  start = true,
}: {
  text: string;
  className?: string;
  duration?: number;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!inView || !start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const begin = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - begin) / duration);
      const settled = Math.floor(progress * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (i < settled || char === " ") next += char;
        else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOutput(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, start, text, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{output}</span>
    </span>
  );
}
