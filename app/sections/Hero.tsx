"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TerrainCanvas, { type TerrainReadout } from "@/components/fx/TerrainCanvas";
import { useBootDone } from "@/components/fx/boot";
import { sfx } from "@/components/fx/sound";

const EASE = [0.16, 1, 0.3, 1] as const;

function RisingLine({ text, delay, ready, className = "" }: { text: string; delay: number; ready: boolean; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.06em] ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "110%", rotate: 6 }}
          animate={ready ? { y: 0, rotate: 0 } : undefined}
          transition={{ duration: 1.1, delay: delay + i * 0.045, ease: EASE }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

const Hero = () => {
  const stats = useQuery(api.stats.get);
  const incrementView = useMutation(api.stats.incrementView);
  const incrementLike = useMutation(api.stats.incrementLike);
  const ready = useBootDone();
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [pins, setPins] = useState<number[]>([]);

  useEffect(() => {
    const viewSessionKey = "portfolio:view-counted";

    if (sessionStorage.getItem(viewSessionKey)) {
      return;
    }

    sessionStorage.setItem(viewSessionKey, "1");
    void incrementView();
  }, [incrementView]);

  const onReadout = useCallback<TerrainReadout>((info) => {
    if (!readoutRef.current) return;
    readoutRef.current.textContent = info
      ? `ELEV ${info.elevation.toLocaleString("en-CA")} M · ${info.lat.toFixed(3)}°N ${Math.abs(info.lon).toFixed(3)}°W`
      : "HOVER THE LAND · CLICK TO DROP A PIN";
  }, []);

  const views = stats?.views ?? 0;
  const likes = stats?.likes ?? 0;

  const like = () => {
    sfx.ping(1.5);
    setPins((current) => [...current.slice(-4), Date.now()]);
    void incrementLike();
  };

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <TerrainCanvas onReadout={onReadout} />
        </motion.div>

        {/* Ink scrim so the name stays legible over the foreground ridges */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-background via-background/75 to-transparent" />

        {/* Survey HUD */}
        <motion.div
          {...fadeUp(0.5)}
          className="annot container-custom pointer-events-none absolute inset-x-0 top-24 flex justify-between gap-6"
        >
          <div className="space-y-1">
            <p className="text-foreground">SHEET 00 — FIELD SURVEY</p>
            <p>CALGARY, ALBERTA</p>
            <p>51.0447°N · 114.0719°W</p>
          </div>
          <div className="hidden space-y-1 text-right sm:block">
            <p>
              <span className="text-foreground">W</span> ← ROCKIES ······ PRAIRIE → <span className="text-foreground">E</span>
            </p>
            <p>
              <span className="text-accent">━</span> BOW RIVER
            </p>
            <p className="text-primary">
              <span ref={readoutRef}>HOVER THE LAND · CLICK TO DROP A PIN</span>
            </p>
          </div>
        </motion.div>

        {/* Name */}
        <div className="container-custom pointer-events-none absolute inset-x-0 bottom-0 pb-8 md:pb-12">
          <motion.p {...fadeUp(0.3)} className="annot mb-5 flex items-center gap-3">
            <span className="beacon inline-block h-2 w-2 bg-primary" />
            Power Platform &amp; AI Solutions Developer · Intelbyte Corp
          </motion.p>

          <h1 className="font-serif text-[clamp(4.25rem,15vw,13.5rem)] leading-[0.8] tracking-[-0.035em]">
            <span className="sr-only">Minh Tam Nguyen</span>
            <span aria-hidden>
              <RisingLine text="Minh Tam" delay={0.15} ready={ready} />
              <RisingLine text="Nguyen." delay={0.45} ready={ready} className="italic text-primary md:pl-[0.9em]" />
            </span>
          </h1>

          <motion.div
            {...fadeUp(1.1)}
            className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              I map messy business problems into software that works — low-code, full-stack, and applied AI.
            </p>
            <a
              href="#field-notes"
              data-cursor="DESCEND"
              className="annot pointer-events-auto inline-flex items-center gap-3 text-foreground transition-colors hover:text-primary"
            >
              Scroll to descend
              <span className="relative block h-8 w-px overflow-hidden bg-border">
                <motion.span
                  className="absolute left-0 top-0 block h-3 w-px bg-primary"
                  animate={{ y: ["-100%", "280%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Field notes: who's behind the survey */}
      <section id="field-notes" className="container-custom scroll-mt-20 py-24 md:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-10">
          {/* Subject card */}
          <div className="md:col-span-4">
            <figure className="group relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <Image
                  className="object-cover grayscale contrast-125 transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:contrast-100"
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  src={"/image.jpg"}
                  alt="Minh Tam Nguyen - Software Developer"
                  priority
                />
                <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-35 transition-opacity duration-700 group-hover:opacity-0" />
                {/* Crop marks */}
                {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"].map((pos) => (
                  <span key={pos} className={`absolute h-4 w-4 border-foreground/80 ${pos}`} />
                ))}
              </div>
              <figcaption className="annot mt-3 flex justify-between">
                <span>Subject · M. T. Nguyen</span>
                <span>Fig. 01</span>
              </figcaption>
            </figure>

            <div className="mt-6 grid grid-cols-2 border border-border">
              <button
                type="button"
                onClick={like}
                data-cursor="LEAVE A PIN"
                className="relative border-r border-border p-4 text-left transition-colors hover:bg-primary/10"
                aria-label="Like this portfolio"
              >
                <p className="annot">Pins dropped</p>
                <p className="mt-1 font-serif text-4xl text-primary">{likes.toLocaleString("en-CA")}</p>
                <AnimatePresence>
                  {pins.map((id) => (
                    <motion.span
                      key={id}
                      className="pointer-events-none absolute right-4 top-4 font-mono text-xs text-primary"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -36 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      onAnimationComplete={() => setPins((current) => current.filter((pin) => pin !== id))}
                    >
                      +1 ▲
                    </motion.span>
                  ))}
                </AnimatePresence>
              </button>
              <div className="p-4">
                <p className="annot">Visitors logged</p>
                <p className="mt-1 font-serif text-4xl">{views.toLocaleString("en-CA")}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-8 md:pl-6">
            <p className="annot mb-8">Field notes</p>
            <p className="font-serif text-[clamp(1.9rem,3.6vw,3.25rem)] leading-[1.08] tracking-[-0.01em]">
              Software Development graduate from SAIT with a{" "}
              <span className="italic text-primary">4.0 GPA</span> and a habit of building things that{" "}
              <span className="italic">actually work.</span>
            </p>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              I&apos;m currently a Power Platform &amp; AI Solutions Developer at Intelbyte Corp in Calgary, where I help turn
              business processes into low-code and AI solutions under senior guidance. Outside work, I keep exploring applied AI
              engineering, especially RAG systems, agents, and retrieval pipelines.
            </p>

            <dl className="mt-12 divide-y divide-border border-y border-border font-mono text-sm">
              {[
                { label: "Loc", value: "Calgary, Alberta, Canada" },
                { label: "Mail", value: "tamnguyen277353@gmail.com", href: "mailto:tamnguyen277353@gmail.com" },
                { label: "Tel", value: "(403) 465-3488", href: "tel:+14034653488" },
                { label: "GitHub", value: "github.com/MinhTam2773", href: "https://github.com/MinhTam2773" },
                { label: "LinkedIn", value: "in/minhtam-dev", href: "https://www.linkedin.com/in/minhtam-dev/" },
              ].map(({ label, value, href }) => (
                <div key={label} className="group flex items-center justify-between gap-4 py-3.5">
                  <dt className="annot w-24 shrink-0">{label}</dt>
                  <dd className="flex-1 truncate text-foreground">
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                      >
                        {value}
                        {href.startsWith("http") ? (
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
