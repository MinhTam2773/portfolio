"use client";

import { useSyncExternalStore } from "react";

// Site music. It starts on its own unless the visitor muted it on an earlier visit.
// Browsers block sound until the first click or key press, so when the first attempt
// is blocked we start on that first gesture instead.

const SRC = "/audio/Diaphanous%20Dream.mp3";
const MUTED_KEY = "skyocean:muted";
const VOLUME = 0.45;

let audio: HTMLAudioElement | null = null;
let playing = false;
let started = false;
let fadeRaf = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    // Storage blocked: the choice just won't be remembered.
  }
}

function element() {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = 0;
  }
  return audio;
}

function fadeTo(target: number, ms: number, done?: () => void) {
  const a = element();
  cancelAnimationFrame(fadeRaf);
  const from = a.volume;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    a.volume = Math.min(1, Math.max(0, from + (target - from) * t));
    if (t < 1) fadeRaf = requestAnimationFrame(step);
    else done?.();
  };
  fadeRaf = requestAnimationFrame(step);
}

async function play() {
  try {
    await element().play();
  } catch {
    return false;
  }
  playing = true;
  emit();
  fadeTo(VOLUME, 2000);
  return true;
}

function stop() {
  playing = false;
  emit();
  fadeTo(0, 600, () => {
    if (!playing) element().pause();
  });
}

/** Call once on page load. */
export function startMusic() {
  if (started || readMuted()) return;
  started = true;
  void play().then((ok) => {
    if (ok) return;
    const onGesture = (e: Event) => {
      // The sound button handles its own click, so don't start-then-stop on it.
      if ((e.target as Element | null)?.closest?.("[data-music-toggle]")) return;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      if (!playing && !readMuted()) void play();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
  });
}

export function toggleMusic() {
  if (playing) {
    writeMuted(true);
    stop();
  } else {
    writeMuted(false);
    void play();
  }
}

export function useMusicPlaying() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => playing,
    () => false,
  );
}
