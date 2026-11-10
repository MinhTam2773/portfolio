"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SkyLayers from "@/components/ocean/SkyLayers";
import SkyOceanCanvas from "@/components/ocean/SkyOceanCanvas";
import { useBootDone } from "@/components/fx/boot";

const EASE = [0.16, 1, 0.3, 1] as const;

// The hero stays on screen for the first 160svh of scrolling (the section is 260svh tall).
// Past this fraction of that distance (15svh) the name swaps for the about content, and back again above it.
const ABOUT_AT = 0.094;
const HOLD_MS = 1600; // how long scrolling stops when the about content opens

const PHOTO_HIDDEN = "inset(100% 0% 0% 0%)";
const PHOTO_SHOWN = "inset(0% 0% 0% 0%)";

const LINKS = [
  { label: "GitHub", href: "https://github.com/MinhTam2773", Icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/minhtam-dev/", Icon: FaLinkedin },
  { label: "Email", href: "mailto:tamnguyen277353@gmail.com", Icon: Mail },
];

function RisingLine({ text, delay, ready, wiped, className = "" }: { text: string; delay: number; ready: boolean; wiped: boolean; className?: string }) {
  return (
    <span className={`-mx-[0.12em] -mb-[0.24em] -mt-[0.1em] block overflow-hidden whitespace-nowrap px-[0.12em] pb-[0.3em] pt-[0.1em] ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "150%", rotate: 6 }}
          animate={wiped ? { y: "150%", rotate: 6 } : ready ? { y: 0, rotate: 0 } : undefined}
          transition={wiped ? { duration: 0.7, delay: i * 0.02, ease: EASE } : { duration: 1.1, delay: delay + i * 0.045, ease: EASE }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

const Hero = () => {
  const incrementView = useMutation(api.stats.incrementView);
  const ready = useBootDone();

  useEffect(() => {
    const viewSessionKey = "portfolio:view-counted";

    if (sessionStorage.getItem(viewSessionKey)) {
      return;
    }

    sessionStorage.setItem(viewSessionKey, "1");
    void incrementView();
  }, [incrementView]);

  const sceneRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  const [about, setAbout] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => setAbout(p > ABOUT_AT));

  // The setpoint: when the about content opens, wheel and touch scrolling stop until it has
  // finished appearing, so a fast scroll can't carry the page past it. Scrolling back up with
  // the wheel still works, and nav links aren't affected.
  useEffect(() => {
    if (!about || scrollYProgress.get() >= 1) return;
    const stop = (event: Event) => {
      if (event.cancelable && !(event instanceof WheelEvent && event.deltaY < 0)) event.preventDefault();
    };
    const release = () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
    };
    window.addEventListener("wheel", stop, { passive: false });
    window.addEventListener("touchmove", stop, { passive: false });
    const timer = setTimeout(release, HOLD_MS);
    return () => {
      clearTimeout(timer);
      release();
    };
  }, [about, scrollYProgress]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE },
  });

  // Plays in order on the way in; everything leaves together on the way back.
  const reveal = (delay: number) => ({ duration: about ? 0.8 : 0.3, delay: about ? delay : 0, ease: EASE });

  return (
    <section ref={sceneRef} id="hero" className="relative h-[260svh]">
      {/* Where the scroll cue lands, and where tabbing to a link goes: just past ABOUT_AT. */}
      <div id="field-notes" aria-hidden className="absolute top-[30svh]" />
      {/* Enters the screen at that same point, which is what opens the chat (see ChatWidget). */}
      <div id="about-photo" aria-hidden className="absolute top-[130svh] h-px w-px" />

      <div className="sticky top-0 h-[100svh] min-h-[640px] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <SkyLayers className="absolute inset-0" hideMoon={about} />
          <SkyOceanCanvas className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_93%,transparent)]" />
        </motion.div>

        {/* Name */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 pb-[6vh] text-center text-[#f6f1ec]">
          <h1 className="[text-shadow:none] font-serif text-[min(14.3vw,clamp(3.5rem,11vw,10rem))] leading-[0.85] tracking-[-0.02em]">
            <span className="sr-only">Minh Tam Nguyen</span>
            <span aria-hidden>
              <RisingLine text="Minh Tam Nguyen" delay={0.15} ready={ready} wiped={about} />
            </span>
          </h1>
          <motion.div initial={false} animate={{ opacity: about ? 0 : 1 }} transition={{ duration: 0.3 }}>
            <motion.p {...fadeUp(0.9)} className="mt-5 text-sm uppercase tracking-[0.3em] text-[#f6f1ec]/85 [text-shadow:0_2px_30px_rgb(60_70_110/0.35)] md:text-base">
              Software &amp; AI Developer
            </motion.p>
          </motion.div>
        </div>

        {/* About: appears once the name has gone */}
        <div
          onFocus={() => {
            if (!about) document.getElementById("field-notes")?.scrollIntoView();
          }}
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 pb-[4vh] text-center text-[#f6f1ec] ${about ? "" : "pointer-events-none"}`}
        >
          <motion.div
            initial={false}
            animate={{ clipPath: about ? PHOTO_SHOWN : PHOTO_HIDDEN }}
            transition={reveal(0.35)}
            className="relative aspect-square w-[clamp(11rem,30svh,19rem)] overflow-hidden rounded-full"
          >
            <Image
              className="origin-[39.8%_50%] scale-[1.2] object-cover object-[50%_43.4%]"
              fill
              sizes="(min-width: 768px) 480px, 400px"
              src={"/image.jpg"}
              alt="Minh Tam Nguyen - Software Developer"
              priority
            />
          </motion.div>

          <motion.p
            initial={false}
            animate={{ opacity: about ? 1 : 0, y: about ? 0 : 24 }}
            transition={reveal(0.65)}
            className="mt-7 max-w-xl font-serif text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.15] [text-shadow:0_1px_3px_rgb(34_40_90/0.55),0_1px_12px_rgb(60_30_50/0.28)]"
          >
            Software Development graduate from SAIT with a <span className="italic">4.0 GPA</span> and a habit of building things that{" "}
            <span className="italic">actually work.</span>
          </motion.p>

          <motion.div initial={false} animate={{ opacity: about ? 1 : 0, y: about ? 0 : 16 }} transition={reveal(0.85)} className="mt-7 flex items-center gap-4">
            {LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 transition-colors hover:bg-white/20"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div initial={false} animate={{ opacity: about ? 0 : 1 }} transition={{ duration: 0.3 }}>
          <motion.a
            {...fadeUp(1.3)}
            href="#field-notes"
            aria-label="Scroll down"
            data-cursor="SCROLL"
            className="absolute bottom-8 left-1/2 block h-12 w-px -translate-x-1/2 overflow-hidden bg-white/25"
          >
            <motion.span
              className="absolute left-0 top-0 block h-4 w-px bg-white"
              animate={{ y: ["-100%", "320%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
