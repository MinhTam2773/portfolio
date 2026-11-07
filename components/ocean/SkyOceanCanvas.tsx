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
const ZERO = new THREE.Vector2();

// Main silver stream: a long loop sweeping across the sky, coiling into a tunnel every 32 s.
// The tunnel's ring is tilted and sits above the subtitle, weaving around the name.
const SILVER_STREAM: StreamOptions = {
  count: 140,
  scale: 0.5,
  path: [v(-22, 3, -6), v(-10, 5.5, -1), v(2, 4, 2), v(13, 1, 0), v(19, -3, -6), v(9, -5.5, -11), v(-4, -3, -9), v(-15, -4.5, -3)],
  length: 0.32,
  thickness: 1.2,
  speed: 0.028,
  look: { rim: "#ffe4d6", bendSpeed: 9, bendAmount: 0.12, minLight: 0.6 },
  vortex: { center: v(0, 3.4, -4), radius: 5.5, turns: 2.2, cycle: 32, from: 18, to: 28, tilt: { x: 1.05, z: 0.35 } },
};

// A small golden school cruising level across the lower sky, among the clouds.
const GOLDEN_STREAM: StreamOptions = {
  count: 24,
  scale: 0.7,
  path: [v(-14, -5, 3), v(-4, -4.2, 4), v(8, -4.6, 3), v(16, -5.4, 0), v(6, -6, -2), v(-8, -5.6, -1)],
  length: 0.22,
  thickness: 0.8,
  speed: 0.04,
  look: { rim: "#fff0c8", bendSpeed: 11, bendAmount: 0.13, minLight: 0.55 },
};

// Two mantas at clearly different depths, sizes and speeds, so they never move in step.
const NEAR_MANTA: GliderOptions = {
  kind: "manta",
  scale: 1.8,
  paths: [[v(-26, -4, -6), v(-8, -2.5, -4), v(10, -3.5, -6), v(26, -2, -9), v(8, -6, -12), v(-12, -5, -10)]],
  speed: 0.011,
  roll: 0.9,
  look: { bendSpeed: 2.8, bendAmount: 0.25 },
};

const FAR_MANTA: GliderOptions = {
  kind: "manta",
  scale: 0.8,
  paths: [[v(24, 7, -22), v(6, 8.5, -20), v(-14, 7.5, -24), v(-28, 9, -26), v(-6, 10, -28), v(14, 8, -26)]],
  speed: 0.007,
  roll: 0.7,
  look: { bendSpeed: 2.2, bendAmount: 0.25, fogNear: 25, fogFar: 50, fogMax: 0.5 },
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

// On phones the golden school swims higher, clear of the chat button in the corner.
const lift = (path: THREE.Vector3[], by: THREE.Vector3) => path.map((p) => p.clone().add(by));

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

    // The paths are laid out for a 16:9 screen; narrower screens squeeze them sideways.
    const fitWidth = () => {
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (CAMERA_Z - SCHOOL_Z) * camera.aspect;
      const scale = Math.min(1, halfWidth / DESIGN_HALF_WIDTH);
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
        streams.push(
          // Fewer, bigger fish on phones so they read as fish, not specks.
          new Stream(silver, mobile ? { ...SILVER_STREAM, count: 75, scale: 0.7 } : SILVER_STREAM),
          new Stream(golden, mobile ? { ...GOLDEN_STREAM, path: lift(GOLDEN_STREAM.path, v(-1.5, 1.8, 0)) } : GOLDEN_STREAM),
        );
        gliders.push(new Gliders(whale, WHALES), new Gliders(manta, FAR_MANTA), new Gliders(manta, NEAR_MANTA));
        // Far to near, so the transparent-free scene still sorts cheaply.
        [...gliders, ...streams].forEach((c) => scene.add(c.mesh));
        fitWidth();

        if (reduced) {
          for (let step = 0; step < 120; step++) {
            streams.forEach((s) => s.update(1 / 30, step / 30, null));
            gliders.forEach((g) => g.update(1 / 30, step / 30));
          }
          render();
        }
      })
      .catch(() => {
        // Models failed to load: the sky and atmosphere still show.
      });

    // Cursor (or a finger while it's down) as a point on the school's plane.
    const pointer = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -SCHOOL_Z);
    let hasPointer = false;
    const parallax = new THREE.Vector2(); // eased toward the pointer, drives camera sway
    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        hasPointer = false;
        return;
      }
      ndc.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      hasPointer = ray.ray.intersectPlane(plane, pointer) !== null;
    };
    const onPointerLeave = () => {
      hasPointer = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerLeave);
    document.addEventListener("pointerleave", onPointerLeave);

    // Animation loop that only runs while the hero is on screen and the tab is visible.
    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt;
      // The camera breathes in a slow figure-eight and leans a little toward the cursor,
      // so the scene feels like a space you're floating in rather than a video.
      parallax.lerp(hasPointer ? ndc : ZERO, 0.04);
      camera.position.set(
        Math.sin((time * Math.PI * 2) / 18) * 0.25 + parallax.x * 0.8,
        Math.sin((time * Math.PI * 4) / 18) * 0.12 + parallax.y * 0.5,
        CAMERA_Z,
      );
      camera.lookAt(0, 0, SCHOOL_Z);
      streams.forEach((s) => s.update(dt, time, hasPointer ? pointer : null));
      gliders.forEach((g) => g.update(dt, time));
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

    // Creatures fade out as the hero scrolls away, so none float over the dark sections below.
    const onScroll = () => {
      const t = Math.min(1, Math.max(0, (window.scrollY / host.clientHeight - 0.15) / 0.4));
      renderer.domElement.style.opacity = String(1 - t * t * (3 - 2 * t));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerLeave);
      document.removeEventListener("pointerleave", onPointerLeave);
      [...streams, ...gliders].forEach((c) => c.dispose());
      atmosphere.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
