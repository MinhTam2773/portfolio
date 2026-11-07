"use client";

import { useEffect, useRef } from "react";

// The painted backdrop: sky gradient, moon and two painted cloud bands. Clouds drift
// sideways on their own; on scroll each layer moves at a different speed for depth.

const SKY =
  "linear-gradient(180deg, #6c8cb8 0%, #87a1c6 32%, #a6b4cc 55%, #d4b8ae 76%, #eab598 88%, #e9a98c 100%)";

const MOON = "url(/ocean/moon.webp) center / contain no-repeat";

// Bottom of the hero: dusk falls through twilight violet into the site background below,
// rather than straight to near-black (which turns the warm clouds muddy grey).
const DUSK_FADE =
  "linear-gradient(180deg, rgb(45 32 74 / 0) 68%, rgb(38 28 68 / 0.5) 82%, rgb(20 16 38 / 0.88) 93%, hsl(var(--background)) 100%)";

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
      {/* The moon, far away: a faint airglow around it, its own detail softened, and a veil of
          sky-coloured haze over the disc (masked to the moon's shape) so it sits behind the air.
          Normal blend (not screen), so the dark side still reads darker than the sky. */}
      <div ref={moonRef} className="absolute left-1/2 top-[16%] -translate-x-1/2 will-change-transform">
        <div className="relative h-[min(25vmin,220px)] aspect-square rotate-[16deg]">
          <div
            className="absolute -inset-[60%] rounded-full"
            style={{ background: "radial-gradient(circle, rgb(232 238 250 / 0.42) 20%, rgb(220 230 248 / 0.14) 38%, transparent 66%)" }}
          />
          <div
            className="absolute inset-0 opacity-90"
            style={{ background: MOON, filter: "blur(0.6px) brightness(1.12) contrast(0.78) saturate(0.8)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgb(172 190 220 / 0.3)", mask: MOON, WebkitMask: MOON }}
          />
        </div>
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
