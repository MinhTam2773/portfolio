"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { sfx } from "./sound";
import { markBootDone } from "./boot";

const INTERACTIVE = "a, button, [role='button'], summary, label, [data-cursor]";
const TEXT_ENTRY = "input, textarea, select, [contenteditable='true']";

/** Surveyor's reticle that replaces the pointer on mouse/trackpad devices. */
function Reticle() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-reticle");

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const coords = coordsRef.current!;
    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let scaleTarget = 1;
    let hidden = true;
    let raf = 0;

    const setHidden = (next: boolean) => {
      hidden = next;
      dot.style.opacity = next ? "0" : "1";
      ring.style.opacity = next ? "0" : "1";
    };

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (hidden) {
        ringPos.x = target.x;
        ringPos.y = target.y;
        setHidden(false);
      }
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      coords.textContent = `X ${String(Math.round(target.x)).padStart(4, "0")} · Y ${String(Math.round(target.y)).padStart(4, "0")}`;
    };

    const onOver = (event: PointerEvent) => {
      const el = event.target as Element | null;
      if (el?.closest(TEXT_ENTRY)) {
        setHidden(true);
        return;
      }
      if (hidden) setHidden(false);
      const hit = el?.closest(INTERACTIVE) as HTMLElement | null;
      scaleTarget = hit ? 1.75 : 1;
      ring.dataset.active = hit ? "true" : "false";
      label.textContent = hit?.dataset.cursor ?? "";
    };

    const onDown = () => (scaleTarget *= 0.7);
    const onUp = () => (scaleTarget = ring.dataset.active === "true" ? 1.75 : 1);
    const onLeave = () => setHidden(true);

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.2;
      ringPos.y += (target.y - ringPos.y) * 0.2;
      scale += (scaleTarget - scale) * 0.2;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-reticle");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div ref={dotRef} className="absolute left-0 top-0 opacity-0 transition-opacity">
        <div className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] bg-primary" />
      </div>
      <div ref={ringRef} data-active="false" className="group absolute left-0 top-0 opacity-0 transition-opacity">
        <div className="relative -ml-[17px] -mt-[17px] h-[34px] w-[34px] rounded-full border border-foreground/50 transition-colors duration-200 group-data-[active=true]:border-primary">
          {/* Crosshair ticks */}
          <span className="absolute left-1/2 -top-[5px] h-[7px] w-px bg-foreground/60 group-data-[active=true]:bg-primary" />
          <span className="absolute left-1/2 -bottom-[5px] h-[7px] w-px bg-foreground/60 group-data-[active=true]:bg-primary" />
          <span className="absolute top-1/2 -left-[5px] h-px w-[7px] bg-foreground/60 group-data-[active=true]:bg-primary" />
          <span className="absolute top-1/2 -right-[5px] h-px w-[7px] bg-foreground/60 group-data-[active=true]:bg-primary" />
        </div>
        <span
          ref={labelRef}
          className="absolute left-6 top-3 whitespace-nowrap bg-primary px-1.5 py-0.5 font-mono text-[9px] tracking-[0.15em] text-primary-foreground empty:hidden"
        />
        <span
          ref={coordsRef}
          className="absolute left-6 -top-6 whitespace-nowrap font-mono text-[9px] tracking-[0.12em] text-foreground/45 group-data-[active=true]:hidden"
        />
      </div>
    </div>
  );
}

const BOOT_LINES: [string, string][] = [
  ["LOCATING OBSERVER", "51.0447°N 114.0719°W"],
  ["READING ELEVATION", "1,045 M"],
  ["RAISING THE ROCKIES", "OK"],
  ["CALIBRATING INSTRUMENTS", "OK"],
];

/** A short field-instrument boot, once per session. Click or press any key to skip. */
function BootSequence() {
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-seen")) {
      markBootDone();
      return;
    }
    try {
      sessionStorage.setItem("survey:booted", "1");
    } catch {
      // Without storage the intro just plays again next load.
    }

    const timers: number[] = [];
    const finish = () => {
      timers.forEach(clearTimeout);
      setShown(BOOT_LINES.length);
      setLeaving(true);
      markBootDone();
    };
    BOOT_LINES.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 260 + i * 290)));
    timers.push(window.setTimeout(finish, 260 + BOOT_LINES.length * 290 + 380));

    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (gone) return null;

  return (
    <motion.div
      className="boot-overlay fixed inset-0 z-[95] flex items-end bg-background"
      initial={false}
      animate={leaving ? { clipPath: "inset(0 0 100% 0)" } : { clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => leaving && setGone(true)}
    >
      <div className="container-custom w-full pb-14 font-mono text-xs tracking-[0.14em] text-muted-foreground sm:text-sm">
        <p className="mb-6 text-foreground">
          FIELD SURVEY <span className="text-primary">v26.10</span> — MINH TAM NGUYEN
        </p>
        {BOOT_LINES.map(([task, result], i) => (
          <p key={task} className={`flex gap-3 transition-opacity duration-150 ${i < shown ? "opacity-100" : "opacity-0"}`}>
            <span className="text-primary">&gt;</span>
            <span className="flex-1 overflow-hidden whitespace-nowrap">
              {task} <span className="text-foreground/20">{".".repeat(40)}</span>
            </span>
            <span className="text-foreground">{result}</span>
          </p>
        ))}
        <div className="mt-6 h-px w-full bg-border">
          <div
            className="h-px bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${(shown / BOOT_LINES.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] text-foreground/30">CLICK TO SKIP</p>
      </div>
    </motion.div>
  );
}

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
      <BootSequence />
      <Embers />
      <Reticle />
    </>
  );
}
