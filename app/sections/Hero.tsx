"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SkyLayers from "@/components/ocean/SkyLayers";
import SkyOceanCanvas from "@/components/ocean/SkyOceanCanvas";
import { useBootDone } from "@/components/fx/boot";
import { sfx } from "@/components/fx/sound";

const EASE = [0.16, 1, 0.3, 1] as const;

function RisingLine({ text, delay, ready, className = "" }: { text: string; delay: number; ready: boolean; className?: string }) {
  return (
    <span className={`-mx-[0.12em] -mb-[0.24em] -mt-[0.1em] block overflow-hidden whitespace-nowrap px-[0.12em] pb-[0.3em] pt-[0.1em] ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "150%", rotate: 6 }}
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
  const [pins, setPins] = useState<number[]>([]);

  useEffect(() => {
    const viewSessionKey = "portfolio:view-counted";

    if (sessionStorage.getItem(viewSessionKey)) {
      return;
    }

    sessionStorage.setItem(viewSessionKey, "1");
    void incrementView();
  }, [incrementView]);

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
          initial={{ opacity: 0, scale: 1.04 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <SkyLayers className="absolute inset-0" />
          <SkyOceanCanvas className="absolute inset-0" />
        </motion.div>

        {/* Name */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 pb-[6vh] text-center text-[#f6f1ec]">
          <h1 className="font-serif text-[min(14.3vw,clamp(3.5rem,11vw,10rem))] leading-[0.85] tracking-[-0.02em]">
            <span className="sr-only">Minh Tam Nguyen</span>
            <span aria-hidden>
              <RisingLine text="Minh Tam Nguyen" delay={0.15} ready={ready} />
            </span>
          </h1>
          <motion.p {...fadeUp(0.9)} className="mt-5 text-sm uppercase tracking-[0.3em] text-[#f6f1ec]/85 [text-shadow:0_2px_30px_rgb(60_70_110/0.35)] md:text-base">
            Software &amp; AI Developer
          </motion.p>
        </div>

        {/* Scroll cue */}
        <motion.a
          {...fadeUp(1.3)}
          href="#field-notes"
          aria-label="Scroll down"
          data-cursor="DESCEND"
          className="absolute bottom-8 left-1/2 block h-12 w-px -translate-x-1/2 overflow-hidden bg-white/25"
        >
          <motion.span
            className="absolute left-0 top-0 block h-4 w-px bg-white"
            animate={{ y: ["-100%", "320%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.a>
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
