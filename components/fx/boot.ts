"use client";

import { useSyncExternalStore } from "react";

// Whether the intro boot sequence has finished, so the hero can time its entrance.
// An inline script in <head> marks <html class="intro-seen"> when the intro was already
// seen this session (or motion is reduced), so CSS hides it before the first paint.

let done = false;
const listeners = new Set<() => void>();

export function markBootDone() {
  if (done) return;
  done = true;
  listeners.forEach((listener) => listener());
}

export function useBootDone() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => done || document.documentElement.classList.contains("intro-seen"),
    () => false,
  );
}

export const BOOT_SCRIPT = `try{var m=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(m||sessionStorage.getItem("survey:booted")){document.documentElement.classList.add("intro-seen")}}catch(e){document.documentElement.classList.add("intro-seen")}`;
