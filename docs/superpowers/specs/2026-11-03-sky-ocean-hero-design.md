# Sky Ocean — Hero Design

Date: 2026-11-03
Status: approved in chat, pending spec review
Zone: GREEN (visuals, assets, dev tooling). No Convex, auth, or data code changes.

## Context

The portfolio is moving from the "field survey" theme to a **sky ocean** world: a dusk sky where fish
schools and whales swim through the air. The whole site will move to this world, built section by
section. This spec covers **the hero only**. Each later section gets its own short spec.

Site-wide direction (for later specs, recorded here so it isn't lost):
- Scroll tells a story from **dusk to night**: the hero is dusk; lower sections darken toward deep-blue
  night with stars, and fish there glow softly.
- **Minimal text.** No survey wording, no HUD readouts, no decorative labels.

References: a pastel dusk sky with peach clouds, a moon behind a centred wordmark and faint scanlines;
Fontaine-style underwater schools (dense ribbons, a swirling shoal tunnel, light from above). The fish
and whales are original designs; we take the *feel* of the schooling, not any game's art.

## What the visitor sees

Layers, back to front:

1. **Sky** — gradient, dusty blue at the top to peach at the horizon.
2. **Moon** — pale, partly behind cloud, behind the name.
3. **Clouds** — 2 painted layers (far, near) with transparency. Slow horizontal drift; scroll parallax
   at different speeds.
4. **Whales** — 1–2, far back, tinted toward the sky colour so they read as distant. Slow wide arcs
   across the scene, body undulating as they swim.
5. **School** — the centrepiece. ~400 fish (desktop), ~150 (mobile). Flows in ribbons; roughly every
   20–30 s it gathers into a slow swirling vortex for a few seconds, then breaks apart. Each fish
   wiggles its tail and picks up warm rim light as it turns.
6. **Foreground fish** — a few larger, softly blurred fish passing close to the camera.
7. **Atmosphere** — soft light shafts from above, drifting specks, faint scanline grain overlay.

Text (only this):
- Name, large and centred: "Minh Tam Nguyen". Uses the site's current serif for now; typography is
  revisited in the site-wide pass.
- One role line below: "Software & AI Developer".
- Scroll cue (bottom centre) and sound toggle (corner). Icons, no labels.

The bottom of the hero fades into the current site background so the next section still joins cleanly
until it is redesigned.

## Interaction

- **Cursor:** fish steer away from the pointer and close back in behind it. Touch acts the same on
  mobile while a finger is down.
- **Music:** `public/audio/Diaphanous Dream.mp3`, looping.
  - On load, try to play. Browsers block audio until a user gesture, so if blocked, start on the first
    `pointerdown` or `keydown` anywhere. Fade in over ~2 s.
  - Toggle mutes/unmutes with a fade. The choice is saved in `localStorage` (wrapped in try/catch);
    a visitor who muted stays muted on return.
  - Owner decision, recorded: this track is HOYO-MiX / HoYoverse copyright. Claude flagged the
    licensing risk; the owner chose to use it anyway.

## Performance and accessibility

- Pixel ratio capped at 1.5. Fish are one instanced mesh; tail wiggle runs in the vertex shader.
- Animation pauses when the tab is hidden or the hero is scrolled out of view (IntersectionObserver +
  `visibilitychange`).
- Mobile (< 768 px wide): ~150 fish, no foreground blur fish, fewer specks.
- `prefers-reduced-motion`: render one still frame of the scene; no drift, no parallax. Music still
  follows the normal rules.
- If WebGL is unavailable: show the sky, moon, and cloud images only.
- Sound toggle and scroll cue are real buttons/links with `aria-label`s.

## How it's built

Sky, moon and clouds are layered images in the DOM. A transparent three.js canvas sits on top for the
moving creatures and atmosphere. Plain `three` (new dependency) in a client component, following the
same pattern as the current `TerrainCanvas` — no React wrapper library.

New files, `components/ocean/`:
- `SkyOceanCanvas.tsx` — renderer, scene, camera, render loop, pause/resume, resize, reduced motion,
  WebGL fallback. Owns the other modules.
- `school.ts` — fish simulation: boids (separation, alignment, cohesion) with a spatial grid,
  pointer avoidance, periodic vortex attractor; writes instance matrices. Fish shader (tail wiggle,
  rim light).
- `whales.ts` — loads `whale.glb`, moves whales along slow looping paths, body undulation in the vertex
  shader, distance tint.
- `atmosphere.ts` — light shafts (additive gradient planes) and drifting specks (points).
- `SkyLayers.tsx` — sky, moon, cloud images with drift and scroll parallax.
- `music.ts` — audio element, autoplay attempt, first-gesture fallback, fades, saved mute.
- `SoundToggle.tsx` — the corner button (new; the old `components/fx/SoundToggle.tsx` stays for the
  sections still using the old effects).

Changed:
- `app/sections/Hero.tsx` — hero block replaced with sky ocean + minimal text. The "field notes" block
  below it, including the Convex view/like code, is not touched in this spec.
- `package.json` — add `three` and `@types/three`.

Removed:
- `components/fx/TerrainCanvas.tsx` — unused after this change.

Kept for now (still used elsewhere until those sections are redesigned): `FxLayer`, `boot.ts`,
`sound.ts`, `ScrambleText`, `SectionHeader`, `ElevationRail`.

## Assets

`public/ocean/`:

| File | Source | Notes |
|---|---|---|
| `sky.webp` | Higgsfield image | Gradient sky, no clouds or moon |
| `moon.webp` | Higgsfield image | Transparent background |
| `clouds-far.webp`, `clouds-near.webp` | Higgsfield image | Transparent (model transparency, or Higgsfield background removal) |
| `whale.glb` | Higgsfield image → image-to-3D → Blender | Decimated, ≤ 1 MB, origin and scale normalised |
| `fish.glb` | Blender (Python script, headless) | Low-poly stylised fish, a few hundred triangles |

The Blender scripts live in `scripts/blender/` so the fish and whale clean-up can be re-run.

Higgsfield spending: images 0.25 credits each (~5–7 images incl. retries). Whale 3D cost is checked
once its concept image exists. Every generation's cost is shown to the owner and approved before it runs.

## Verification

No test framework in the project; checks are:
1. `npm run lint` and `npm run build` pass.
2. In the browser preview: no console errors; the school flows, forms a vortex, avoids the cursor;
   whales cross the scene; music plays after the first click and the toggle mutes and remembers it.
3. Screenshots at desktop and mobile width.
4. Reduced motion (emulated) shows a still frame; animation pauses when scrolled away (frame counter
   stops).
5. Frame rate holds near 60 fps on desktop in the preview.

## Out of scope

- Restyling any section below the hero, the navigation, footer, cursor, and site-wide palette.
- The night palette and glowing fish (next spec).
- Any change to Convex stats, schema, or data handling.
