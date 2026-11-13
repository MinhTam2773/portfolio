"use client";

import { useSyncExternalStore } from "react";

// Site music. Muted on arrival; it only plays when the visitor presses the sound button.

const SRC = "/audio/Diaphanous%20Dream.mp3";
const VOLUME = 0.45;

let audio: HTMLAudioElement | null = null;
let playing = false;
let fadeRaf = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

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

export function toggleMusic() {
  if (playing) stop();
  else void play();
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
