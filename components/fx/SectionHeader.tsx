"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrambleText from "./ScrambleText";

export default function SectionHeader({
  title,
  emphasis,
  kicker,
}: {
  title: string;
  emphasis?: string;
  kicker?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  return (
    <header ref={ref} className="mb-14 md:mb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <motion.h2
          className="font-serif text-[clamp(3rem,8.5vw,7.5rem)] italic leading-[0.88] tracking-[-0.02em]"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {title} {emphasis && <span className="text-primary">{emphasis}</span>}
        </motion.h2>
        {kicker && (
          <p className="annot max-w-[16rem] leading-relaxed md:text-right">
            <ScrambleText text={kicker} start={inView} />
          </p>
        )}
      </div>
    </header>
  );
}
