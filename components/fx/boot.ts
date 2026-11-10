"use client";

import { useSyncExternalStore } from "react";

// Whether the page has started, so the hero can time its entrance.

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
    () => done,
    () => false,
  );
}
