"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { sfx } from "./sound";
import { markBootDone } from "./boot";

const INTERACTIVE = "a, button, [role='button'], summary, label, [data-cursor]";
const TEXT_ENTRY = "input, textarea, select, [contenteditable='true']";

/** Type "fire" anywhere: embers rise off the page (a nod to FIRE//WATCH). */
function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [burning, setBurning] = useState(false);

  useEffect(() => {
    let typed = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest(TEXT_ENTRY)) return;
      if (event.key.length !== 1) return;
      typed = (typed + event.key.toLowerCase()).slice(-4);
      if (typed === "fire") {
        typed = "";
        setBurning(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!burning) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    sfx.crackle(3);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spawn = () => ({
      x: Math.random() * width,
      y: height + Math.random() * 120,
      vx: (Math.random() - 0.5) * 30,
      vy: -(60 + Math.random() * 160),
      life: 0,
      ttl: 2.2 + Math.random() * 2.6,
      size: 0.8 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
    });
    const embers = Array.from({ length: 260 }, spawn);
    const started = performance.now();
    let last = started;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = (now - started) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Heat glow along the bottom edge.
      const glow = ctx.createLinearGradient(0, height, 0, height * 0.55);
      const heat = Math.max(0, Math.min(1, elapsed / 0.6, (5.5 - elapsed) / 1.2));
      glow.addColorStop(0, `rgba(255, 90, 31, ${0.32 * heat})`);
      glow.addColorStop(1, "rgba(255, 90, 31, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      let alive = 0;
      for (const ember of embers) {
        ember.life += dt;
        if (ember.life > ember.ttl) {
          if (elapsed < 3.5) Object.assign(ember, spawn());
          else continue;
        }
        alive++;
        ember.phase += dt * 3;
        ember.x += (ember.vx + Math.sin(ember.phase) * 28) * dt;
        ember.y += ember.vy * dt;
        const t = ember.life / ember.ttl;
        const flicker = 0.6 + Math.sin(ember.phase * 5) * 0.4;
        ctx.fillStyle = `hsla(${38 - t * 30}, 100%, ${70 - t * 25}%, ${(1 - t) * flicker})`;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (alive > 0 && elapsed < 7) raf = requestAnimationFrame(frame);
      else setBurning(false);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [burning]);

  return (
    <AnimatePresence>
      {burning && (
        <>
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[85] h-full w-full" />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-[86] -translate-x-1/2 border border-primary/60 bg-background/90 px-4 py-3 font-mono text-xs tracking-[0.14em] text-foreground backdrop-blur"
          >
            <span className="text-primary">FIRE DETECTED.</span> Want to see how I track the real ones?{" "}
            <Link href="/firewatch" className="text-primary underline underline-offset-4">
              FIRE//WATCH →
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function FxLayer() {
  useEffect(markBootDone, []);

  // An instrument tick when the pointer reaches anything you can press.
  useEffect(() => {
    let lastEl: Element | null = null;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const hit = (event.target as Element | null)?.closest(INTERACTIVE) ?? null;
      if (hit && hit !== lastEl) sfx.tick();
      lastEl = hit;
    };
    document.addEventListener("pointerover", onOver);
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  return (
    <>
      <div aria-hidden className="grain" />
      <Embers />
    </>
  );
}
