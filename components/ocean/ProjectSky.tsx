// The sky behind a project page: the home page's dusk gradient with cloud banks in the margins.
// The `sky-home` class also switches on the sky theme in globals.css. It has to sit outside
// PageTransition, whose transform would otherwise stop it short of the footer.

// [side, distance down the page in %, painting, width in vw, how much of the margin it reaches across]
const BANKS: ["left" | "right", number, number, number, number][] = [
  ["left", 2, 9, 40, 0.85],
  ["right", 9, 10, 36, 0.7],
  ["left", 24, 7, 30, 0.6],
  ["right", 31, 8, 32, 0.7],
  ["left", 47, 10, 38, 0.8],
  ["right", 56, 9, 40, 0.85],
  ["left", 70, 8, 30, 0.6],
  ["right", 80, 7, 34, 0.75],
];

export default function ProjectSky() {
  return (
    <div aria-hidden className="sky-home pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {BANKS.map(([side, top, art, width, reach], i) => (
        <div
          key={i}
          className="sky-cloud hidden md:block"
          // These four paintings fill their width, so only the small gap at the edge is allowed for.
          style={{ top: `${top}%`, [side]: `calc(var(--gutter) * ${reach} - ${width * 0.97}vw)`, width: `${width}vw` }}
        >
          <div
            className="sky-cloud-art aspect-[3/2]"
            style={{ backgroundImage: `url(/ocean/clouds/cloud-${art}.webp)`, animationDuration: `${50 + (i % 5) * 9}s`, animationDelay: `${-i * 7}s` }}
          />
        </div>
      ))}
    </div>
  );
}
