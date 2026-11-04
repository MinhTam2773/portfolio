"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createAtmosphere } from "./atmosphere";
import { School } from "./school";

// The moving part of the hero: fish, light shafts and specks, drawn on a transparent
// canvas over the painted sky layers. Pauses when the hero is off screen or the tab is
// hidden, and draws a single still frame when the visitor prefers reduced motion.

const CAMERA_Z = 22;
const SCHOOL_Z = -2;

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

    const schools: School[] = [];
    let disposed = false;

    const render = () => renderer.render(scene, camera);

    // Half the visible width at the school's depth, so the school uses the whole screen.
    const halfWidthAt = (z: number) =>
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (CAMERA_Z - z) * camera.aspect;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const main = schools[0];
      if (main) main.bounds.x = Math.min(15, halfWidthAt(SCHOOL_Z) * 0.9);
      if (reduced) render();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    new GLTFLoader().load("/ocean/fish.glb", (gltf) => {
      if (disposed) return;
      const fishMesh = gltf.scene.getObjectByProperty("isMesh", true) as THREE.Mesh | undefined;
      if (!fishMesh) return;

      const main = new School(fishMesh.geometry, {
        count: mobile ? 150 : 400,
        scale: mobile ? 0.5 : 0.55,
        center: new THREE.Vector3(0, 0.5, SCHOOL_Z),
        bounds: new THREE.Vector3(Math.min(15, halfWidthAt(SCHOOL_Z) * 0.9), 6.5, 5),
        vortex: true,
      });
      schools.push(main);
      scene.add(main.mesh);

      if (!mobile) {
        // A few big, soft fish drifting close to the camera for depth.
        const passers = new School(fishMesh.geometry, {
          count: 5,
          scale: 1.1,
          center: new THREE.Vector3(0, -1, 12),
          bounds: new THREE.Vector3(9, 3.5, 1.5),
          vortex: false,
          alpha: 0.5,
          speed: [1.2, 2],
        });
        schools.push(passers);
        scene.add(passers.mesh);
      }

      if (reduced) {
        schools.forEach((s) => s.warmUp(240));
        render();
      }
    });

    // Cursor (or a finger while it's down) as a point on the school's plane.
    const pointer = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -SCHOOL_Z);
    let hasPointer = false;
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
      schools.forEach((s, i) => s.update(dt, time, i === 0 && hasPointer ? pointer : null));
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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerLeave);
      document.removeEventListener("pointerleave", onPointerLeave);
      schools.forEach((s) => s.dispose());
      atmosphere.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
