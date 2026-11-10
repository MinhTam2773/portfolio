"use client";

// The painted backdrop: sky gradient, moon and two painted cloud bands. Clouds drift
// sideways on their own and don't react to scrolling, since the hero is pinned.

const SKY =
  "linear-gradient(180deg, #6c8cb8 0%, #87a1c6 32%, #a6b4cc 55%, #d4b8ae 76%, #eab598 88%, #e9a98c 100%)";

// Bottom of the hero: the clouds dissolve into the sky's own last colour, which is where the
// page sky (.sky-home in globals.css) picks up.
const DUSK_FADE =
  "linear-gradient(180deg, rgb(233 169 140 / 0) 60%, rgb(233 169 140 / 0.14) 72%, rgb(233 169 140 / 0.5) 85%, rgb(233 169 140 / 0.86) 95%, rgb(233 169 140) 100%)";

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

export default function SkyLayers({ className = "", hideMoon = false }: { className?: string; hideMoon?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`} style={{ background: SKY }}>
      {/* A daytime moon: pale grey, only slightly lighter than the sky, so it stays in the
          background. Screen blend at low opacity means no part of it is darker than the sky:
          the lit side ends up a little above the sky and the dark side barely above it.
          The blend sits on the wrapper, which has its own stacking context. */}
      <div className={`absolute left-1/2 top-[16%] -translate-x-1/2 mix-blend-screen transition-opacity duration-300 ${hideMoon ? "opacity-0" : "opacity-30"}`}>
        <div
          className="h-[min(25vmin,220px)] aspect-square rotate-[16deg]"
          style={{ background: "url(/ocean/moon.webp) center / contain no-repeat", filter: "blur(0.4px) contrast(1.5) sepia(0.6) saturate(0.8)" }}
        />
      </div>

      <div className="absolute inset-x-0 top-[2%] opacity-80">
        <CloudBand src="/ocean/clouds-far.webp" drift="320s" minWidth="103svh" />
      </div>

      {/* The near clouds sit in the lower half of their painting, so the band hangs low. */}
      <div className="absolute inset-x-0 bottom-[2%] md:-bottom-[12%]">
        <CloudBand src="/ocean/clouds-near.webp" drift="200s" minWidth="113svh" />
      </div>

      <div className="absolute inset-0" style={{ background: DUSK_FADE }} />
    </div>
  );
}
