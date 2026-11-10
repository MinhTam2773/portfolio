// The empty bands between the home page's sections, top to bottom. Creatures and clouds are
// placed in them so they don't sit behind text. Each pair is the element above a band and the
// element below it (inside the padding where a section has its own).
const GAPS: [string, string][] = [
  ["#hero", "#education"],
  ["#education", "#projects"],
  ["#projects", "#experience"],
  ["#experience", "#tech"],
  ["#tech", "footer a"],
];

/** Distance from the top of the page to the middle of a band, or null before the page exists. */
export function gapMiddle(gap: number) {
  const above = document.querySelector(GAPS[gap][0]);
  const below = document.querySelector(GAPS[gap][1]);
  if (!above || !below) return null;
  return (above.getBoundingClientRect().bottom + below.getBoundingClientRect().top) / 2 + window.scrollY;
}
