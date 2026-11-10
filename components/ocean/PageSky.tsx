"use client";

import { useEffect, useRef } from "react";
import BodyOceanCanvas from "./BodyOceanCanvas";
import { gapMiddle } from "./pageGaps";

// The sky behind the home page below the hero: one long dusk gradient with banks of clouds in
// the margins beside the content and in the empty bands between sections, so they stay out
// from behind the text. Each drifts at its own depth as you scroll. The `sky-home` class also
// switches on the home page's sky theme in globals.css.

type Cloud = {
  /** Which of public/ocean/clouds/cloud-N.webp to show (1–10). */
  art: number;
  /** Positive sits further back and moves slower. */
  depth: number;
  opacity: number;
};
/** Desktop only: phones have no margins. */
type MarginCloud = Cloud & {
  /** Distance down the sky, in percent. */
  top: number;
  side: "left" | "right";
  /** Width in vw. */
  width: number;
  /** How much of the margin the painted cloud reaches across, 0–1. The rest hangs off the screen. */
  reach: number;
};
/** In a band between sections, on every screen size. Depth has to stay small to stay in the band. */
type BandCloud = Cloud & {
  band: number;
  /** Where its middle sits across the screen, in percent. */
  across: number;
  /** Width in px on desktop; phones scale it by --band-cloud-scale. */
  width: number;
  /** Offset from the band's middle, in px. */
  lift: number;
};

/** How much of each painting's width (cloud-1 to cloud-10) is empty space at its sides. */
const ART_INSET = [0.15, 0.06, 0.33, 0.05, 0.15, 0.07, 0.01, 0.01, 0.02, 0.03];

// Spaced and sized unevenly on purpose: regular spacing lined the content with a box of clouds.
// [side, top, painting, width, reach, smaller cloud layered in front]
const MARGIN_BANKS: ["left" | "right", number, number, number, number, number?][] = [
  ["left", 2, 9, 46, 0.9, 1],
  ["right", 6, 10, 40, 0.72],
  ["left", 11, 7, 30, 0.5],
  ["left", 16, 10, 52, 0.88, 6],
  ["right", 20, 9, 50, 0.92, 5],
  ["right", 26, 8, 28, 0.5],
  ["left", 29, 8, 34, 0.7, 3],
  ["left", 36, 9, 42, 0.92],
  ["right", 38, 7, 44, 0.85, 1],
  ["right", 45, 10, 32, 0.6],
  ["left", 48, 10, 36, 0.55, 5],
  ["right", 55, 9, 52, 0.9, 6],
  ["left", 58, 7, 50, 0.9, 1],
  ["left", 65, 8, 26, 0.48],
  ["right", 70, 8, 38, 0.7],
  ["right", 74, 7, 30, 0.5, 5],
  ["left", 77, 10, 46, 0.85, 6],
  ["right", 84, 10, 48, 0.9, 3],
  ["left", 88, 9, 40, 0.75, 3],
  ["right", 95, 9, 36, 0.6],
];
const MARGIN_CLOUDS: MarginCloud[] = MARGIN_BANKS.flatMap(([side, top, art, width, reach, front]): MarginCloud[] => [
  { art, top, side, reach, width, depth: 0.05, opacity: 1 },
  ...(front ? [{ art: front, top: top + 2.4, side, reach: reach * 0.65, width: 22, depth: 0.13, opacity: 0.92 }] : []),
]);

// Each band clusters differently, with open sky between the clusters. A cloud has to fit the
// band's height, so the taller a painting is, the narrower it can be.
const BAND_CLOUDS: BandCloud[] = [
  // Heaped on the left, one small cloud far right.
  { art: 4, band: 0, across: 20, width: 760, lift: -8, depth: 0.02, opacity: 0.95 },
  { art: 8, band: 0, across: 8, width: 540, lift: -10, depth: 0.02, opacity: 1 },
  { art: 7, band: 0, across: 34, width: 400, lift: -22, depth: 0.03, opacity: 1 },
  { art: 6, band: 0, across: 52, width: 260, lift: -4, depth: 0.04, opacity: 1 },
  { art: 5, band: 0, across: 84, width: 280, lift: -28, depth: 0.03, opacity: 1 },
  // Heaped on the right, one small cloud far left.
  { art: 2, band: 1, across: 74, width: 720, lift: -12, depth: 0.02, opacity: 0.95 },
  { art: 7, band: 1, across: 92, width: 440, lift: -10, depth: 0.02, opacity: 1 },
  { art: 8, band: 1, across: 62, width: 480, lift: -24, depth: 0.03, opacity: 1 },
  { art: 1, band: 1, across: 44, width: 250, lift: 2, depth: 0.04, opacity: 1 },
  { art: 6, band: 1, across: 12, width: 300, lift: -30, depth: 0.03, opacity: 1 },
  // A cluster in the middle, open at both sides.
  { art: 4, band: 2, across: 46, width: 640, lift: -6, depth: 0.02, opacity: 0.95 },
  { art: 8, band: 2, across: 36, width: 460, lift: -20, depth: 0.03, opacity: 1 },
  { art: 7, band: 2, across: 58, width: 380, lift: -16, depth: 0.03, opacity: 1 },
  { art: 5, band: 2, across: 72, width: 220, lift: 6, depth: 0.04, opacity: 1 },
  { art: 1, band: 2, across: 96, width: 260, lift: -30, depth: 0.03, opacity: 1 },
  // Two clusters with a gap between them.
  { art: 8, band: 3, across: 16, width: 500, lift: -14, depth: 0.02, opacity: 1 },
  { art: 6, band: 3, across: 30, width: 320, lift: -30, depth: 0.03, opacity: 1 },
  { art: 2, band: 3, across: 82, width: 700, lift: -12, depth: 0.02, opacity: 0.95 },
  { art: 7, band: 3, across: 90, width: 420, lift: -20, depth: 0.03, opacity: 1 },
  { art: 5, band: 3, across: 64, width: 230, lift: 0, depth: 0.04, opacity: 1 },
  // The last band holds the like and visitor counters in its middle, so only its sides have clouds.
  { art: 8, band: 4, across: 9, width: 520, lift: -30, depth: 0.02, opacity: 1 },
  { art: 6, band: 4, across: 3, width: 400, lift: 40, depth: 0.03, opacity: 1 },
  { art: 7, band: 4, across: 91, width: 440, lift: -30, depth: 0.02, opacity: 1 },
  { art: 1, band: 4, across: 97, width: 380, lift: 40, depth: 0.03, opacity: 1 },
];

const DEPTHS = [...MARGIN_CLOUDS, ...BAND_CLOUDS].map((cloud) => cloud.depth);

function CloudArt({ art, index }: { art: number; index: number }) {
  return (
    <div
      className="sky-cloud-art aspect-[3/2]"
      style={{
        backgroundImage: `url(/ocean/clouds/cloud-${art}.webp)`,
        animationDuration: `${50 + (index % 5) * 9}s`,
        animationDelay: `${-index * 7}s`,
      }}
    />
  );
}

export default function PageSky() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const clouds = Array.from(layer.children) as HTMLElement[];
    let centers: number[] = [];
    let raf = 0;

    const place = () => {
      raf = 0;
      const middle = window.scrollY + window.innerHeight / 2;
      clouds.forEach((cloud, i) => {
        // Only ever offset relative to the screen's middle, so a cloud is where the layout
        // says it is when it passes through the centre of the screen.
        cloud.style.transform = `translate3d(0, ${(middle - centers[i]) * DEPTHS[i]}px, 0)`;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    const measure = () => {
      const top = layer.getBoundingClientRect().top + window.scrollY;
      BAND_CLOUDS.forEach((band, i) => {
        const middle = gapMiddle(band.band);
        const cloud = clouds[MARGIN_CLOUDS.length + i];
        const scale = parseFloat(getComputedStyle(cloud).getPropertyValue("--band-cloud-scale"));
        if (middle !== null) cloud.style.top = `${middle - top + band.lift * scale - cloud.offsetHeight / 2}px`;
      });
      centers = clouds.map((cloud) => top + cloud.offsetTop + cloud.offsetHeight / 2);
      schedule();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(layer);
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <>
    <div ref={layerRef} aria-hidden className="sky-home pointer-events-none absolute inset-x-0 bottom-0 top-[260svh] -z-10 overflow-hidden">
      {MARGIN_CLOUDS.map((cloud, i) => (
        <div
          key={i}
          className="sky-cloud hidden will-change-transform md:block"
          style={{
            top: `${cloud.top}%`,
            [cloud.side]: `calc(var(--gutter) * ${cloud.reach} - ${cloud.width * (1 - ART_INSET[cloud.art - 1])}vw)`,
            width: `${cloud.width}vw`,
            opacity: cloud.opacity,
          }}
        >
          <CloudArt art={cloud.art} index={i} />
        </div>
      ))}
      {BAND_CLOUDS.map((cloud, i) => (
        <div
          key={i}
          // The last band holds the like and visitor counters, and a phone has no room beside them.
          className={`sky-cloud will-change-transform ${cloud.band === 4 ? "hidden md:block" : ""}`}
          style={{
            left: `calc(${cloud.across}% - var(--band-cloud-scale) * ${cloud.width / 2}px)`,
            width: `calc(var(--band-cloud-scale) * ${cloud.width}px)`,
            opacity: cloud.opacity,
          }}
        >
          <CloudArt art={cloud.art} index={MARGIN_CLOUDS.length + i} />
        </div>
      ))}
    </div>
    <BodyOceanCanvas />
    </>
  );
}
