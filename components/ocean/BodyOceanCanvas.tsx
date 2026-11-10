"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { resolution, type CreatureModel } from "./creatureMaterial";
import { Gliders, type GliderOptions } from "./gliders";
import { GOLDEN_STREAM, NEAR_MANTA, SILVER_STREAM } from "./SkyOceanCanvas";
import { gapMiddle } from "./pageGaps";
import { Stream, type StreamOptions } from "./stream";

// Sea creatures swimming through the sky behind the page content, below the hero: schools of
// fish, jellyfish, mantas, a turtle and a whale. One screen-sized transparent canvas sits
// behind the content, and its camera moves with the scroll, so each group of creatures belongs
// to a place on the page. Groups away from the screen aren't updated or drawn.
//
// To stay out from behind the text, the flows cross the page in the empty bands between
// sections and, on wide screens, run down the margins beside the content column. All of them
// keep close to SCHOOL_Z: anything much nearer or further slides off its place on the page as
// you scroll, over the text.

const CAMERA_Z = 22;
const SCHOOL_Z = -2;
const DESIGN_HALF_WIDTH = 17.7;
const VIEW_HEIGHT = 2 * Math.tan(THREE.MathUtils.degToRad(22.5)) * (CAMERA_Z - SCHOOL_Z);

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mirror = (path: THREE.Vector3[]) => path.map((p) => v(-p.x, p.y, p.z));

/** A flat loop across a band between sections: over in front, back a little behind. */
const ACROSS = [
  v(-25, 0.7, -1), v(-12, 0.8, 0.5), v(4, 0.6, 0.5), v(18, 0.8, -1), v(27, 0.1, -3),
  v(18, -0.7, -4.5), v(4, -0.5, -4.5), v(-12, -0.7, -4.5), v(-27, -0.1, -3),
];
/** Down the left margin (x = 0 is its middle), then back up off the edge of the screen. */
const LEFT_MARGIN = [
  v(0.4, 18, -2), v(-0.5, 9, -2), v(0.5, 0, -2), v(-0.5, -9, -2), v(0.4, -18, -2),
  v(-4, -22, -2), v(-9, -18, -2), v(-9, 0, -2), v(-9, 18, -2), v(-4, 22, -2),
];
const RIGHT_MARGIN = mirror(LEFT_MARGIN);
/** How far a margin flow reaches above and below the middle of its section, in world units. */
const MARGIN_REACH = 22;

/** Width of the content column inside container-custom, in pixels. */
const COLUMN = 1088;
/** Narrower margins than this can't hold a flow, in pixels. */
const MIN_MARGIN = 130;

const HAZE = { fogMax: 0.15 };
const CALM = { thickness: 0.8, sway: 0.25, path: ACROSS };
const SILVER: StreamOptions = { ...SILVER_STREAM, ...CALM, tunnel: undefined, count: 80, look: { ...SILVER_STREAM.look, ...HAZE } };
const GOLDEN: StreamOptions = { ...GOLDEN_STREAM, ...CALM, count: 24, look: { ...GOLDEN_STREAM.look, ...HAZE } };
const JELLY: StreamOptions = {
  ...SILVER,
  count: 10,
  scale: 0.85,
  length: 0.32,
  thickness: 1.8,
  speed: 0.011,
  look: { rim: "#fff1fa", bendSpeed: 2.1, bendAmount: 0.22, minLight: 0.45, ...HAZE },
};
/** In from past the left edge of the screen, a curve through the left margin, and back out. Short enough to fit on one screen. */
const JELLY_MARGIN: StreamOptions = {
  ...JELLY,
  count: 6,
  length: 0.45,
  speed: 0.02,
  path: [v(-12, 7, -2), v(-7, 7, -2), v(-1.2, 5.5, -2), v(0.4, 0, -2), v(-1.2, -5.5, -2), v(-7, -7, -2), v(-12, -7, -2), v(-15, 0, -2)],
};
const MANTA: GliderOptions = {
  ...NEAR_MANTA,
  paths: [[v(-26, 0.3, -1), v(-8, -0.2, 0), v(10, 0.3, -1), v(26, 0, -3), v(8, -0.4, -4.5), v(-12, 0.1, -4.5)]],
  look: { ...NEAR_MANTA.look, ...HAZE },
};
const TURTLE: GliderOptions = {
  kind: "turtle",
  scale: 1.5,
  paths: [[v(-28, 0.2, -1), v(-9, 0.3, 0), v(9, -0.1, -1), v(28, 0.1, -3), v(12, -0.4, -4.5), v(-12, -0.3, -4.5)]],
  speed: 0.007,
  roll: 0.55,
  look: { bendSpeed: 1.5, bendAmount: 0.3, minLight: 0.5, ...HAZE },
};
const WHALE: GliderOptions = {
  kind: "whale",
  scale: 3,
  paths: [[v(32, 0, -5), v(0, 0.2, -5), v(-32, -0.1, -5), v(-18, -0.6, -5.5), v(18, -0.5, -5.5)]],
  speed: 0.0065,
  look: { bendSpeed: 1.2, bendAmount: 0.22, fogNear: 30, fogFar: 60, ...HAZE },
};

type ModelName = "silver" | "golden" | "manta" | "whale" | "jelly" | "turtle";
type Member = { model: ModelName; stream?: StreamOptions; glider?: GliderOptions };
/** A group of creatures in a band between sections, or in a margin beside a section. */
type Chapter = { members: Member[] } & ({ gap: number; shift?: number } | { section: string; side: -1 | 1 });

const CHAPTERS: Chapter[] = [
  { gap: 0, members: [{ model: "jelly", stream: JELLY }, { model: "golden", stream: { ...GOLDEN, path: mirror(ACROSS) } }] },
  { gap: 1, members: [{ model: "silver", stream: SILVER }, { model: "manta", glider: MANTA }] },
  { gap: 2, members: [{ model: "turtle", glider: TURTLE }, { model: "golden", stream: GOLDEN }] },
  { gap: 3, members: [{ model: "whale", glider: WHALE }, { model: "silver", stream: { ...SILVER, count: 60, path: mirror(ACROSS) } }] },
  // Kept in the top half of the band, above the like and visitor counters in its middle. In pixels.
  { gap: 4, shift: -120, members: [{ model: "manta", glider: { ...MANTA, paths: MANTA.paths.map(mirror) } }, { model: "jelly", stream: { ...JELLY, count: 7 } }] },
  { section: "education", side: 1, members: [{ model: "golden", stream: { ...GOLDEN, path: RIGHT_MARGIN } }] },
  { section: "education", side: -1, members: [{ model: "jelly", stream: JELLY_MARGIN }] },
  { section: "projects", side: 1, members: [{ model: "silver", stream: { ...SILVER, count: 40, path: RIGHT_MARGIN } }] },
  { section: "experience", side: 1, members: [{ model: "golden", stream: { ...GOLDEN, path: RIGHT_MARGIN } }] },
  { section: "experience", side: -1, members: [{ model: "jelly", stream: JELLY_MARGIN }] },
];

export default function BodyOceanCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the sky and clouds still show.
    }

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
    const placed: { group: THREE.Group; chapter: Chapter; streams: Stream[]; gliders: Gliders[] }[] = [];
    let unitsPerPixel = 1;
    let margin = 0; // pixels beside the content column
    let disposed = false;

    // Where each group sits follows the page layout, which can change at any time.
    const measure = () => {
      margin = (window.innerWidth - COLUMN) / 2;
      for (const { group, chapter } of placed) {
        if ("gap" in chapter) {
          const middle = gapMiddle(chapter.gap);
          if (middle !== null) group.position.y = -(middle + (chapter.shift ?? 0)) * unitsPerPixel;
          continue;
        }
        const section = document.getElementById(chapter.section);
        if (!section) continue;
        const box = section.getBoundingClientRect();
        group.position.set(chapter.side * (COLUMN + margin) * 0.5 * unitsPerPixel, -(box.top + window.scrollY + box.height / 2) * unitsPerPixel, 0);
      }
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(resolution.value);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      unitsPerPixel = VIEW_HEIGHT / height;
      const halfWidth = (VIEW_HEIGHT / 2) * camera.aspect;
      const fit = Math.min(1, halfWidth / DESIGN_HALF_WIDTH);
      for (const { chapter, streams, gliders } of placed) [...streams, ...gliders].forEach((c) => (c.widthScale = "gap" in chapter ? fit : 1));
      measure();
    };
    resize();
    window.addEventListener("resize", resize);
    const layoutObserver = new ResizeObserver(measure);
    layoutObserver.observe(document.body);

    const loader = new GLTFLoader();
    const modelOf = async (url: string): Promise<CreatureModel> => {
      const gltf = await loader.loadAsync(url);
      const mesh = gltf.scene.getObjectByProperty("isMesh", true) as THREE.Mesh | undefined;
      const map = (mesh?.material as THREE.MeshStandardMaterial | undefined)?.map;
      if (!mesh || !map) throw new Error(`No textured mesh in ${url}`);
      return { geometry: mesh.geometry, map };
    };

    Promise.all(["fish-silver", "fish-golden", "manta", "whale", "jelly", "turtle"].map((name) => modelOf(`/ocean/${name}.glb`)))
      .then(([silver, golden, manta, whale, jelly, turtle]) => {
        if (disposed) return;
        const models: Record<ModelName, CreatureModel> = { silver, golden, manta, whale, jelly, turtle };
        // Phones have less room, so smaller groups of smaller creatures.
        const fewer = mobile ? 0.4 : 1;
        const smaller = mobile ? 0.7 : 1;
        // The bands between sections are shorter on phones, so the flows are flatter and thinner.
        const fitBand = (path: THREE.Vector3[]) => (mobile ? path.map((p) => v(p.x, p.y * 0.6, SCHOOL_Z + (p.z - SCHOOL_Z) * 0.5)) : path);
        const thinner = mobile ? 0.55 : 1;
        for (const chapter of CHAPTERS) {
          if (mobile && !("gap" in chapter)) continue; // Phones have no margins to swim in.
          const group = new THREE.Group();
          const entry = { group, chapter, streams: [] as Stream[], gliders: [] as Gliders[] };
          for (const { model, stream, glider } of chapter.members) {
            if (stream) {
              entry.streams.push(
                new Stream(models[model], {
                  ...stream,
                  count: Math.round(stream.count * fewer),
                  scale: stream.scale * smaller,
                  thickness: stream.thickness * thinner,
                  path: fitBand(stream.path),
                }),
              );
            }
            if (glider) entry.gliders.push(new Gliders(models[model], { ...glider, scale: glider.scale * smaller, paths: glider.paths.map(fitBand) }));
          }
          [...entry.gliders, ...entry.streams].forEach((c) => group.add(c.mesh));
          scene.add(group);
          placed.push(entry);
        }
        resize();
        if (reduced) {
          for (let step = 0; step < 120; step++) {
            for (const { streams, gliders } of placed) {
              streams.forEach((s) => s.update(1 / 30, step / 30));
              gliders.forEach((g) => g.update(1 / 30));
            }
          }
        }
      })
      .catch(() => {
        // Models failed to load: the sky and clouds still show.
      });

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let drawn = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt;

      // Behind the hero there's nothing to see.
      if (window.scrollY < window.innerHeight * 1.5) {
        if (drawn) renderer.clear();
        drawn = false;
        return;
      }

      const cameraY = -(window.scrollY + window.innerHeight / 2) * unitsPerPixel;
      camera.position.set(0, cameraY, CAMERA_Z);
      camera.lookAt(0, cameraY, SCHOOL_Z);
      for (const { group, chapter, streams, gliders } of placed) {
        const inPlace = "gap" in chapter || margin >= MIN_MARGIN;
        const near = inPlace && Math.abs(group.position.y - cameraY) < VIEW_HEIGHT * 1.3 + ("gap" in chapter ? 0 : MARGIN_REACH);
        group.visible = near;
        if (!near || reduced) continue;
        streams.forEach((s) => s.update(dt, time));
        gliders.forEach((g) => g.update(dt));
      }
      renderer.render(scene, camera);
      drawn = true;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      layoutObserver.disconnect();
      window.removeEventListener("resize", resize);
      for (const { streams, gliders } of placed) [...streams, ...gliders].forEach((c) => c.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
