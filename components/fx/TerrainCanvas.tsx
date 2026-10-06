"use client";

import { useEffect, useRef } from "react";
import { sfx } from "./sound";

// A flyover of the land around Calgary drawn as ridgelines: the Rockies rise in the
// west (left) and flatten into prairie in the east, with the Bow River winding through.
// Each ridgeline is a real 3D row of terrain, projected with a pinhole camera and drawn
// back to front so nearer ridges hide the ones behind them.

// ── Gradient noise (Perlin, seeded) ─────────────────────────────────────────
const perm = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 51_0447;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number, y: number) {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const X = xi & 255;
  const Y = yi & 255;
  const xf = x - xi;
  const yf = y - yi;
  const u = fade(xf);
  const v = fade(yf);
  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];
  const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
  const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
  return (x1 + v * (x2 - x1)) * 0.35;
}

function ridged(x: number, z: number) {
  let sum = 0;
  let amp = 0.55;
  let freq = 1;
  let weight = 1;
  for (let o = 0; o < 4; o++) {
    let n = 1 - Math.abs(noise(x * freq, z * freq));
    n *= n * weight;
    weight = Math.min(1, n * 1.6);
    sum += n * amp;
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

function riverX(z: number) {
  return 0.55 + Math.sin(z * 0.9) * 0.35 + noise(z * 0.6, 7.3) * 0.5;
}

/** Terrain height in world units; also reports how "wet" a point is (the Bow River). */
function terrain(x: number, z: number, out: { river: number; snow: number }) {
  const west = Math.min(1, Math.max(0, (-x + 0.2) / 2.1));
  const range = Math.pow(west, 1.5);
  const foothills = Math.min(1, Math.max(0, (-x + 0.9) / 1.4)) * 0.09 * (noise(x * 2.3, z * 2.3) + 0.6);
  const mountains = ridged(x * 1.35, z * 1.1) * (0.03 + 1.3 * range);
  const prairie = (noise(x * 3.1, z * 3.1) * 0.5 + noise(x * 7.7, z * 7.7) * 0.18) * 0.06;
  const dr = x - riverX(z);
  const river = Math.exp(-(dr * dr) / 0.012) * (1 - range);
  const h = mountains + foothills + prairie - river * 0.04;
  out.river = river;
  out.snow = h > 0.62 ? Math.min(1, (h - 0.62) * 6) : 0;
  return h;
}

// ── Camera ───────────────────────────────────────────────────────────────────
const NEAR = 0.32;
const FAR = 4.6;
const CAM_H = 0.62;
const METRES_PER_UNIT = 2300;
const BASE_ELEVATION = 1045; // Calgary

type Ripple = { x: number; z: number; born: number };
type Pin = { x: number; z: number; label: string };

export type TerrainReadout = (info: { elevation: number; lat: number; lon: number } | null) => void;

export default function TerrainCanvas({ onReadout }: { onReadout?: TerrainReadout }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef(onReadout);

  useEffect(() => {
    readoutRef.current = onReadout;
  }, [onReadout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(document.documentElement);
    const hsl = (name: string, alpha = 1) => `hsl(${styles.getPropertyValue(name).trim()} / ${alpha})`;
    const ink = hsl("--background");
    // Canvas can't resolve CSS variables in `font`, so read next/font's family name off <body>.
    const monoFamily = getComputedStyle(document.body).getPropertyValue("--font-jetbrains").trim() || "monospace";

    let width = 0;
    let height = 0;
    let rows = 64;
    let cols = 170;
    let focal = 800;
    let horizon = 300;

    const pointer = { x: -1, y: -1, active: false, sx: 0, sz: 0, lift: 0 };
    const ripples: Ripple[] = [];
    const pins: Pin[] = [];
    let pinCount = 0;
    let camZ = 0;
    let last = performance.now();
    let running = true;
    let visible = true;
    let frame = 0;
    const sample = { river: 0, snow: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width < 700;
      rows = small ? 44 : 64;
      cols = small ? 96 : 170;
      focal = Math.max(height, width * 0.55) * 0.95;
      horizon = height * (small ? 0.3 : 0.34);
    };

    const toScreenX = (x: number, rel: number) => width / 2 + (x * focal) / rel;
    const toScreenY = (h: number, rel: number) => horizon + ((CAM_H - h) * focal) / rel;

    const heightAt = (x: number, z: number, now: number) => {
      let h = terrain(x, z, sample);
      if (pointer.lift > 0.001) {
        const dx = x - pointer.sx;
        const dz = (z - pointer.sz) * 0.8;
        const spread = 0.05 + (pointer.sz - camZ) * 0.025;
        h += pointer.lift * 0.2 * Math.exp(-(dx * dx + dz * dz) / spread);
      }
      for (const ripple of ripples) {
        const age = (now - ripple.born) / 1000;
        const d = Math.hypot(x - ripple.x, z - ripple.z);
        const front = age * 0.9;
        const falloff = Math.exp(-age * 1.6) * Math.exp(-((d - front) ** 2) / 0.012);
        h += Math.sin((d - front) * 40) * 0.05 * falloff;
      }
      return h;
    };

    // March ridges near → far; the first whose surface sits at or above the pointer
    // is the one you can see there (everything behind it is hidden by its fill).
    const updatePointerWorld = () => {
      if (!pointer.active) return false;
      const dz = (FAR - NEAR) / rows;
      const firstRow = Math.ceil((camZ + NEAR) / dz);
      const lastRow = Math.floor((camZ + FAR) / dz);
      for (let r = firstRow; r <= lastRow; r++) {
        const z = r * dz;
        const rel = z - camZ;
        const x = ((pointer.x - width / 2) * rel) / focal;
        if (toScreenY(terrain(x, z, sample), rel) <= pointer.y) {
          pointer.sx = x;
          pointer.sz = z;
          return true;
        }
      }
      return false;
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduceMotion) camZ += dt * 0.11;

      const onGround = updatePointerWorld();
      pointer.lift += ((onGround ? 1 : 0) - pointer.lift) * Math.min(1, dt * 5);
      while (ripples.length && now - ripples[0].born > 3500) ripples.shift();

      ctx.clearRect(0, 0, width, height);

      // Chinook arch: the band of clear, warm sky that hangs over the Rockies.
      const arch = ctx.createRadialGradient(width * 0.28, horizon + height * 0.05, 0, width * 0.28, horizon + height * 0.05, width * 0.75);
      arch.addColorStop(0, hsl("--primary", 0.13));
      arch.addColorStop(0.45, hsl("--primary", 0.035));
      arch.addColorStop(1, hsl("--primary", 0));
      ctx.fillStyle = arch;
      ctx.fillRect(0, 0, width, horizon + height * 0.2);

      const dz = (FAR - NEAR) / rows;
      const firstRow = Math.ceil((camZ + NEAR) / dz);
      const lastRow = Math.floor((camZ + FAR) / dz);
      const xs = new Float32Array(cols + 1);
      const ys = new Float32Array(cols + 1);
      const wet = new Float32Array(cols + 1);
      const snow = new Float32Array(cols + 1);

      for (let r = lastRow; r >= firstRow; r--) {
        const z = r * dz;
        const rel = z - camZ;
        const depth = (rel - NEAR) / (FAR - NEAR); // 0 near … 1 far
        const xMax = ((width / 2 + 40) * rel) / focal;

        for (let c = 0; c <= cols; c++) {
          const x = -xMax + (2 * xMax * c) / cols;
          const h = heightAt(x, z, now);
          wet[c] = sample.river;
          snow[c] = sample.snow;
          xs[c] = toScreenX(x, rel);
          ys[c] = toScreenY(h, rel);
        }

        // Occlude what's behind this ridge.
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let c = 1; c <= cols; c++) ctx.lineTo(xs[c], ys[c]);
        ctx.lineTo(xs[cols], height + 2);
        ctx.lineTo(xs[0], height + 2);
        ctx.closePath();
        ctx.fillStyle = ink;
        ctx.fill();

        const fadeIn = Math.min(1, (1 - depth) * 6);
        const fadeOut = Math.min(1, depth * 9);
        const alpha = (0.14 + 0.62 * Math.pow(1 - depth, 1.4)) * fadeIn * fadeOut;
        ctx.lineWidth = depth < 0.25 ? 1.25 : 1;
        ctx.strokeStyle = hsl("--foreground", alpha);
        ctx.stroke(); // re-strokes the closed shape; the base edges sit off-canvas

        // Snowline: the high peaks read brighter.
        ctx.beginPath();
        let onSnow = false;
        for (let c = 0; c <= cols; c++) {
          if (snow[c] > 0.15) {
            if (!onSnow) ctx.moveTo(xs[c], ys[c]);
            else ctx.lineTo(xs[c], ys[c]);
            onSnow = true;
          } else {
            onSnow = false;
          }
        }
        ctx.strokeStyle = hsl("--foreground", Math.min(1, alpha * 2.2 + 0.1));
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Water: trace the Bow in glacier blue where the ridge crosses it.
        ctx.beginPath();
        let inWater = false;
        for (let c = 0; c <= cols; c++) {
          if (wet[c] > 0.35) {
            if (!inWater) ctx.moveTo(xs[c], ys[c]);
            else ctx.lineTo(xs[c], ys[c]);
            inWater = true;
          } else {
            inWater = false;
          }
        }
        ctx.strokeStyle = hsl("--accent", Math.min(1, alpha * 1.8));
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Survey light: ridges near the cursor glow orange.
        if (pointer.lift > 0.02) {
          const near = Math.abs(z - pointer.sz);
          if (near < 0.55) {
            const glow = (1 - near / 0.55) * pointer.lift;
            ctx.beginPath();
            let drawing = false;
            const px = toScreenX(pointer.sx, rel);
            const radius = 220 * (1 - near / 0.55) + 30;
            for (let c = 0; c <= cols; c++) {
              if (Math.abs(xs[c] - px) < radius) {
                if (!drawing) ctx.moveTo(xs[c], ys[c]);
                else ctx.lineTo(xs[c], ys[c]);
                drawing = true;
              } else {
                drawing = false;
              }
            }
            ctx.strokeStyle = hsl("--primary", glow * 0.95);
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }
      }

      // Survey pins ride the land toward the camera.
      ctx.font = `500 10px ${monoFamily}`;
      for (let i = pins.length - 1; i >= 0; i--) {
        const pin = pins[i];
        const rel = pin.z - camZ;
        if (rel < NEAR) {
          pins.splice(i, 1);
          continue;
        }
        const h = heightAt(pin.x, pin.z, now);
        const sx = toScreenX(pin.x, rel);
        const sy = toScreenY(h, rel);
        const stem = 18 + 40 / rel;
        ctx.strokeStyle = hsl("--primary", 0.95);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy - stem);
        ctx.stroke();
        ctx.fillStyle = hsl("--primary");
        ctx.fillRect(sx - 3, sy - stem - 3, 6, 6);
        ctx.fillStyle = hsl("--foreground", 0.9);
        ctx.fillText(pin.label, sx + 8, sy - stem + 3);
      }

      if (frame++ % 4 === 0 && readoutRef.current) {
        if (pointer.lift > 0.5 && onGround) {
          const h = heightAt(pointer.sx, pointer.sz, now);
          readoutRef.current({
            elevation: Math.round(BASE_ELEVATION + h * METRES_PER_UNIT),
            lat: 51.0447 + (pointer.sz - camZ) * 0.21,
            lon: -114.0719 + pointer.sx * 0.38,
          });
        } else {
          readoutRef.current(null);
        }
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      if (visible && !document.hidden) draw(now);
      else last = now;
      requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    };

    const onLeave = () => {
      pointer.active = false;
    };

    const onClick = (event: PointerEvent) => {
      onMove(event);
      if (!updatePointerWorld()) return;
      const now = performance.now();
      ripples.push({ x: pointer.sx, z: pointer.sz, born: now });
      const elevation = Math.round(BASE_ELEVATION + terrain(pointer.sx, pointer.sz, sample) * METRES_PER_UNIT);
      pinCount += 1;
      pins.push({
        x: pointer.sx,
        z: pointer.sz,
        label: `PIN ${String(pinCount).padStart(2, "0")} · ${elevation.toLocaleString("en-CA")} M`,
      });
      if (pins.length > 7) pins.shift();
      // Higher ground pings higher.
      sfx.ping(0.8 + Math.min(0.6, (elevation - BASE_ELEVATION) / 4000));
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onClick);
    requestAnimationFrame(loop);

    return () => {
      running = false;
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-pan-y"
      aria-label="Animated ridgeline map of the Rockies flattening into the prairie around Calgary. Click to drop a survey pin."
      role="img"
      data-cursor="DROP PIN"
    />
  );
}
