"use client";

import { useEffect, useRef } from "react";

// The painted backdrop: sky gradient, moon and two painted cloud bands. Clouds drift
// sideways on their own; on scroll each layer moves at a different speed for depth.

const SKY =
  "linear-gradient(180deg, #6c8cb8 0%, #87a1c6 32%, #a6b4cc 55%, #d4b8ae 76%, #eab598 88%, #e9a98c 100%)";

// Bottom of the hero: dusk falls into the site background below.
const DUSK_FADE =
  "linear-gradient(180deg, transparent 72%, rgb(46 48 72 / 0.85) 90%, hsl(var(--background)) 100%)";

/**
 * A cloud painting followed by its mirror image. The pair loops with no visible seam,
 * because each edge always meets its own reflection. Each copy is at least one screen
 * wide, so shifting the pair by half never leaves a gap. Height follows the painting's
 * shape (2560×1088), so tall clouds are never cropped.
 * @param minWidth smallest width of one copy, e.g. on tall phone screens.
 */
function CloudBand({ src, drift, minWidth }: { src: string; drift: string; minWidth: string }) {
  return (
    <div className="cloud-drift flex w-max" style={{ ["--drift" as string]: drift }}>
      {[false, true].map((mirrored) => (
        <div
          key={String(mirrored)}
          className="aspect-[2560/1088]"
          style={{
            width: `max(100vw, ${minWidth})`,
            background: `url(${src}) center / 100% 100% no-repeat`,
            transform: mirrored ? "scaleX(-1)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default function SkyLayers({ className = "" }: { className?: string }) {
  const moonRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers: [React.RefObject<HTMLDivElement | null>, number][] = [
      [moonRef, 0.12],
      [farRef, 0.22],
      [nearRef, 0.42],
    ];
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight * 1.5) return;
        for (const [ref, speed] of layers) {
          if (ref.current) ref.current.style.transform = `translate3d(0, ${y * speed}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`} style={{ background: SKY }}>
      <div ref={moonRef} className="absolute left-1/2 top-[16%] -translate-x-1/2 will-change-transform">
        <div
          className="h-[min(34vmin,300px)] aspect-[264/492] opacity-90"
          style={{ background: "url(/ocean/moon.webp) center / contain no-repeat" }}
        />
      </div>

      <div ref={farRef} className="absolute inset-x-0 top-[2%] opacity-80 will-change-transform">
        <CloudBand src="/ocean/clouds-far.webp" drift="320s" minWidth="103svh" />
      </div>

      {/* The near clouds sit in the lower half of their painting, so the band hangs low. */}
      <div ref={nearRef} className="absolute inset-x-0 bottom-[2%] will-change-transform md:-bottom-[12%]">
        <CloudBand src="/ocean/clouds-near.webp" drift="200s" minWidth="113svh" />
      </div>

      <div className="absolute inset-0" style={{ background: DUSK_FADE }} />
    </div>
  );
}
