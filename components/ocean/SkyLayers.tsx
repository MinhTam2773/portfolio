"use client";

import { useEffect, useRef } from "react";

// The painted backdrop: sky gradient, moon and two cloud bands. Clouds drift sideways on
// their own; on scroll each layer moves at a different speed for depth.
// The moon and clouds are CSS placeholders until the Higgsfield paintings are ready.

const SKY =
  "linear-gradient(180deg, #6c8cb8 0%, #87a1c6 32%, #a6b4cc 55%, #d4b8ae 76%, #eab598 88%, #e9a98c 100%)";

// Bottom of the hero: dusk falls into the site background below.
const DUSK_FADE =
  "linear-gradient(180deg, transparent 72%, rgb(46 48 72 / 0.85) 90%, hsl(var(--background)) 100%)";

// Soft peach cloud puffs, drawn twice side by side so the drift loops seamlessly.
const cloudPuffs = (puffs: [number, number, number, number][], color: string) =>
  [0, 50]
    .flatMap((offset) =>
      puffs.map(
        ([x, y, w, h]) =>
          `radial-gradient(ellipse ${w / 2}% ${h}% at ${x / 2 + offset}% ${y}%, ${color} 0%, transparent 70%)`,
      ),
    )
    .join(",");

const FAR_CLOUDS = cloudPuffs(
  [
    [8, 40, 22, 26],
    [22, 52, 26, 22],
    [48, 36, 18, 20],
    [70, 48, 28, 24],
    [90, 40, 20, 22],
  ],
  "rgb(247 214 198 / 0.75)",
);

const NEAR_CLOUDS = cloudPuffs(
  [
    [4, 70, 30, 34],
    [18, 62, 24, 30],
    [56, 78, 36, 30],
    [80, 66, 26, 32],
    [96, 74, 22, 28],
  ],
  "rgb(250 196 170 / 0.92)",
);

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
      <div ref={moonRef} className="absolute left-1/2 top-[22%] -translate-x-1/2 will-change-transform">
        <div
          className="h-[min(30vmin,260px)] w-[min(30vmin,260px)] rounded-full opacity-80"
          style={{
            background: "radial-gradient(circle at 62% 42%, #f3f0ec 0%, #d9d6d4 45%, #b5b3b8 100%)",
            WebkitMaskImage: "radial-gradient(circle at 18% 50%, transparent 46%, #000 56%)",
            maskImage: "radial-gradient(circle at 18% 50%, transparent 46%, #000 56%)",
            filter: "blur(0.4px)",
          }}
        />
      </div>

      <div ref={farRef} className="absolute inset-x-0 top-0 h-[70%] will-change-transform">
        <div
          className="cloud-drift h-full w-[200%] blur-[10px]"
          style={{ backgroundImage: FAR_CLOUDS, ["--drift" as string]: "320s" }}
        />
      </div>

      <div ref={nearRef} className="absolute inset-x-0 bottom-0 h-[70%] will-change-transform">
        <div
          className="cloud-drift h-full w-[200%] blur-[6px]"
          style={{ backgroundImage: NEAR_CLOUDS, ["--drift" as string]: "200s" }}
        />
      </div>

      <div className="absolute inset-0" style={{ background: DUSK_FADE }} />
    </div>
  );
}
