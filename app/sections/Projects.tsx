"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/lib/projectsData";
import SectionHeader from "@/components/fx/SectionHeader";

/** The hovered project's screenshot trails the cursor, leaning into the motion. */
function FloatingPreview({ active }: { active: number | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let tilt = 0;
    let raf = 0;
    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };
    const tick = () => {
      const vx = target.x - pos.x;
      pos.x += vx * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      tilt += (Math.max(-12, Math.min(12, vx * 0.06)) - tilt) * 0.15;
      el.style.transform = `translate3d(${pos.x + 28}px, ${pos.y - 120}px, 0) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-30 hidden [@media(pointer:fine)]:block">
      <motion.div
        className="relative aspect-[16/10] w-[380px] overflow-hidden border border-foreground/20 bg-secondary shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        initial={false}
        animate={active === null ? { clipPath: "inset(50% 50% 50% 50%)", opacity: 0 } : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {projects.map((project, i) => (
          <Image
            key={project.slug}
            src={project.coverImage}
            alt=""
            fill
            sizes="380px"
            className={`object-cover transition-[opacity,transform] duration-500 ${active === i ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/85 px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] text-foreground/80">
          <span>SITE {active !== null ? String(active + 1).padStart(2, "0") : "--"}</span>
          <span>{active !== null ? projects[active].title.toUpperCase() : ""}</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="projects" className="scroll-mt-24">
      <SectionHeader index={2} total={4} title="Selected" emphasis="Projects" kicker="Sites surveyed, built, and shipped" />

      <FloatingPreview active={active} />

      <ol className="border-t border-border" onPointerLeave={() => setActive(null)}>
        {projects.map((project, i) => {
          const extraTech = project.techStack.length - 5;
          return (
            <motion.li
              key={project.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onPointerEnter={() => setActive(i)}
              className="group relative border-b border-border"
            >
              {/* Hover wash sweeping in from the left */}
              <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-secondary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              <span className="pointer-events-none absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-primary transition-transform duration-500 group-hover:scale-y-100" />

              <div className="relative grid grid-cols-12 gap-x-4 gap-y-4 py-8 md:py-10">
                <span className="col-span-12 font-mono text-xs text-muted-foreground transition-colors group-hover:text-primary md:col-span-1 md:pt-4">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Inline cover on touch screens, where there's no hover preview */}
                <div className="relative col-span-12 aspect-[16/9] overflow-hidden border border-border [@media(pointer:fine)]:hidden">
                  <Image src={project.coverImage} alt={project.title} fill sizes="100vw" className="object-cover" />
                </div>

                <div className="col-span-12 md:col-span-7">
                  <h3 className="font-serif text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                    {project.title}
                    {project.title === "VibeMap" && (
                      <span className="annot ml-4 inline-block align-middle text-primary">2nd place hackathon</span>
                    )}
                  </h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground line-clamp-3">{project.shortDescription}</p>
                </div>

                <div className="col-span-12 flex flex-col justify-between gap-6 md:col-span-4 md:items-end md:text-right">
                  <div className="annot space-y-1">
                    <p className="text-foreground">{project.role}</p>
                    <p>{project.timeline}</p>
                  </div>
                  <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
                    {project.techStack.slice(0, 5).join(" / ")}
                    {extraTech > 0 && <span className="text-primary"> +{extraTech}</span>}
                  </p>
                  <div className="relative z-10 flex items-center gap-5 font-mono text-[11px] tracking-[0.12em]">
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
                      >
                        LIVE <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {!project.isProtected && project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
                      >
                        <Github className="h-3.5 w-3.5" /> CODE
                      </a>
                    )}
                    {project.isProtected && <span className="text-muted-foreground">PROTECTED CODE</span>}
                  </div>
                </div>
              </div>

              {/* The whole row opens the case study; the links above sit on top of it */}
              <Link href={`/${project.slug}`} className="absolute inset-0" data-cursor="OPEN CASE STUDY" aria-label={`${project.title} case study`} />
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-12 flex justify-end">
        <a
          href="https://github.com/MinhTam2773"
          target="_blank"
          rel="noopener noreferrer"
          className="annot group inline-flex items-center gap-3 border border-border px-5 py-3 text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Github className="h-4 w-4" />
          Explore more on GitHub
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
