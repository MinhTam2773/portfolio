"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createAtmosphere } from "./atmosphere";
import { resolution, type CreatureModel } from "./creatureMaterial";
import { Gliders, type GliderOptions } from "./gliders";
import { Stream, type StreamOptions } from "./stream";

// The moving part of the hero: fish streams, manta rays, a whale, light shafts and
// specks, drawn on a transparent canvas over the painted sky layers. Pauses when the hero
// is off screen or the tab is hidden, and draws a single still frame when the visitor
// prefers reduced motion.

const CAMERA_Z = 22;
const SCHOOL_Z = -2;
/** Half the visible width at the school's depth on a 16:9 screen; paths are laid out for it. */
const DESIGN_HALF_WIDTH = 17.7;

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ── Desktop (laid out for 16:9; squeezed sideways on narrower desktop windows) ──

// Main silver stream: a long loop sweeping across the sky. Every so often, as it passes
// over the moon, it peels into a ring that curls down and back behind the name, then
// carries on along the same path. The off-screen ends turn wide and level (through depth,
// not over the top), so the tube never folds or flips there.
export const SILVER_STREAM: StreamOptions = {
  count: 140,
  scale: 0.5,
  path: [
    v(-10, 5.5, -1), v(2, 4, 2), v(13, 1, 0), v(18, -1.5, -3), v(20, -3.5, -7), v(16, -5, -10), v(9, -5.5, -11),
    v(-4, -3, -9), v(-14, -4, -9), v(-20, -3, -9.5), v(-24, -0.5, -6), v(-24, 2, -1.5), v(-19, 4.5, 0.5),
  ],
  length: 0.3,
  thickness: 1.2,
  speed: 0.026,
  look: { rim: "#ffe4d6", bendSpeed: 9, bendAmount: 0.12, minLight: 0.6 },
  tunnel: { near: v(0, 4.4, 1.5), radius: 3.4, dive: 1.15, first: 10, every: 16 },
};

// A small golden school cruising level across the lower sky, among the clouds.
export const GOLDEN_STREAM: StreamOptions = {
  count: 24,
  scale: 0.7,
  path: [
    v(-4, -4.2, 4), v(8, -4.6, 3), v(14, -5, 2.5), v(18, -5.4, 0.5), v(18, -5.8, -2.5), v(13, -6, -4), v(4, -6, -3),
    v(-8, -5.6, -1.5), v(-14, -5.4, -2), v(-18.5, -5.2, 0), v(-19, -5, 3), v(-15, -4.8, 5), v(-9, -4.5, 5),
  ],
  length: 0.17,
  thickness: 0.8,
  speed: 0.031,
  look: { rim: "#fff0c8", bendSpeed: 11, bendAmount: 0.13, minLight: 0.55 },
};

// Two mantas at clearly different depths, sizes and speeds, so they never move in step.
export const NEAR_MANTA: GliderOptions = {
  kind: "manta",
  scale: 1.8,
  paths: [[v(-26, -4, -6), v(-8, -2.5, -4), v(10, -3.5, -6), v(26, -2, -9), v(8, -6, -12), v(-12, -5, -10)]],
  speed: 0.011,
  roll: 0.9,
  look: { bendSpeed: 2.2, bendAmount: 0.38 },
};

const FAR_MANTA: GliderOptions = {
  kind: "manta",
  scale: 0.8,
  paths: [[v(24, 7, -22), v(6, 8.5, -20), v(-14, 7.5, -24), v(-28, 9, -26), v(-6, 10, -28), v(14, 8, -26)]],
  speed: 0.007,
  roll: 0.7,
  look: { bendSpeed: 1.9, bendAmount: 0.38, fogNear: 25, fogFar: 50, fogMax: 0.5 },
};

// One whale, high above the name, far back and hazy, crossing very slowly.
const WHALES: GliderOptions = {
  kind: "whale",
  scale: 3.6,
  paths: [[v(-38, 12, -32), v(0, 14, -36), v(38, 11, -32), v(20, 10, -42), v(-20, 11, -42)]],
  speed: 0.005,
  look: {
    bendSpeed: 1.2,
    bendAmount: 0.22,
    fogNear: 30,
    fogFar: 60,
    fogMax: 0.7,
  },
};

// ── Phones (laid out for a portrait screen, ~4.6 units half-width at the school's depth) ──
// Calmer: one fish ribbon, one manta, one whale, about 32 creatures. Every turn happens
// off-screen, the ribbon crosses behind the name once on a shallow diagonal and crests
// behind the moon, and there's no tunnel (the ring wouldn't fit the screen).

const PHONE_SILVER: StreamOptions = {
  ...SILVER_STREAM,
  count: 30,
  scale: 0.52,
  thickness: 0.65,
  path: [
    v(-8, -5.5, -3), v(-2, -3.5, -2), v(3, -0.5, -3), v(5, 2.5, -4), v(5.2, 4.8, -6), v(3, 6.3, -7.5),
    v(-1, 6.8, -7.5), v(-5, 6.5, -6), v(-10, 5, -4), v(-12, 0, -6), v(-11, -4, -5),
  ],
  length: 0.21,
  speed: SILVER_STREAM.speed * 0.73,
  tunnel: undefined,
};

// Smaller and further back than before (it filled a quarter of the screen and read heavy),
// with a slower, deeper wing beat.
const PHONE_MANTA: GliderOptions = {
  ...NEAR_MANTA,
  scale: NEAR_MANTA.scale * 0.58,
  paths: [[v(-9, -6.5, -7), v(0, -4.8, -8), v(9, -2.5, -9), v(13, -6, -12), v(-13, -8.5, -12)]],
  speed: NEAR_MANTA.speed * 0.75,
  look: { bendSpeed: 1.9, bendAmount: 0.4 },
};

const PHONE_WHALE: GliderOptions = {
  ...WHALES,
  scale: WHALES.scale * 0.85,
  paths: [[v(-24, 13, -32), v(0, 14.5, -34), v(24, 12.5, -32), v(26, 20, -48), v(-26, 20, -48)]],
  speed: WHALES.speed * 0.8,
};

export default function SkyOceanCanvas({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the painted sky layers still show on their own.
    }

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);

    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_Z);

    const atmosphere = createAtmosphere(mobile ? 120 : 260, pixelRatio);
    scene.add(atmosphere.group);

    const streams: Stream[] = [];
    const gliders: Gliders[] = [];
    let disposed = false;

    const render = () => renderer.render(scene, camera);

    // Desktop paths are laid out for 16:9; narrower desktop windows squeeze them sideways.
    // Phones have their own portrait layout, so no squeeze there.
    const fitWidth = () => {
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (CAMERA_Z - SCHOOL_Z) * camera.aspect;
      const scale = mobile ? 1 : Math.min(1, halfWidth / DESIGN_HALF_WIDTH);
      [...streams, ...gliders].forEach((c) => (c.widthScale = scale));
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.getDrawingBufferSize(resolution.value);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitWidth();
      if (reduced) render();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const loader = new GLTFLoader();
    const modelOf = async (url: string): Promise<CreatureModel> => {
      const gltf = await loader.loadAsync(url);
      const mesh = gltf.scene.getObjectByProperty("isMesh", true) as THREE.Mesh | undefined;
      const map = (mesh?.material as THREE.MeshStandardMaterial | undefined)?.map;
      if (!mesh || !map) throw new Error(`No textured mesh in ${url}`);
      return { geometry: mesh.geometry, map };
    };

    Promise.all(["fish-silver", "fish-golden", "manta", "whale"].map((name) => modelOf(`/ocean/${name}.glb`)))
      .then(([silver, golden, manta, whale]) => {
        if (disposed) return;
        if (mobile) {
          streams.push(new Stream(silver, PHONE_SILVER));
          gliders.push(new Gliders(whale, PHONE_WHALE), new Gliders(manta, PHONE_MANTA));
        } else {
          streams.push(new Stream(silver, SILVER_STREAM), new Stream(golden, GOLDEN_STREAM));
          gliders.push(new Gliders(whale, WHALES), new Gliders(manta, FAR_MANTA), new Gliders(manta, NEAR_MANTA));
        }
        // Far to near, so the transparent-free scene still sorts cheaply.
        [...gliders, ...streams].forEach((c) => scene.add(c.mesh));
        fitWidth();

        if (reduced) {
          for (let step = 0; step < 120; step++) {
            streams.forEach((s) => s.update(1 / 30, step / 30));
            gliders.forEach((g) => g.update(1 / 30));
          }
          render();
        }
      })
      .catch(() => {
        // Models failed to load: the sky and atmosphere still show.
      });

    // Animation loop that only runs while the hero is on screen and the tab is visible.
    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt;
      // The camera breathes in a slow figure-eight, so the scene feels like a space you're
      // floating in rather than a video.
      camera.position.set(
        Math.sin((time * Math.PI * 2) / 18) * 0.25,
        Math.sin((time * Math.PI * 4) / 18) * 0.12,
        CAMERA_Z,
      );
      camera.lookAt(0, 0, SCHOOL_Z);
      streams.forEach((s) => s.update(dt, time));
      gliders.forEach((g) => g.update(dt));
      atmosphere.update(time);
      render();
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const run = inView && !document.hidden && !reduced;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    viewObserver.observe(host);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      [...streams, ...gliders].forEach((c) => c.dispose());
      atmosphere.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
