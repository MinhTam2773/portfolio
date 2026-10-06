"use client";

import { useSyncExternalStore } from "react";

// Every sound on the site is synthesized here with the Web Audio API.
// Sound is off until the visitor turns it on; browsers require a gesture anyway.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambience: { stop: () => void } | null = null;
let enabled = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function getContext() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  return { ctx, master: master! };
}

function noiseBuffer(audio: AudioContext, seconds: number, brown = false) {
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function startAmbience() {
  const { ctx: audio, master: out } = getContext();

  // Wind: brown noise through a band-pass whose centre drifts like a chinook gust.
  const wind = audio.createBufferSource();
  wind.buffer = noiseBuffer(audio, 4, true);
  wind.loop = true;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 420;
  band.Q.value = 0.7;
  const gust = audio.createOscillator();
  gust.frequency.value = 0.07;
  const gustDepth = audio.createGain();
  gustDepth.gain.value = 260;
  gust.connect(gustDepth).connect(band.frequency);

  // A low open fifth underneath, barely there.
  const drone = audio.createGain();
  drone.gain.value = 0.035;
  const roots = [55, 82.4].map((freq) => {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(drone);
    return osc;
  });

  const bed = audio.createGain();
  bed.gain.value = 0;
  bed.gain.linearRampToValueAtTime(0.22, audio.currentTime + 2.5);
  wind.connect(band).connect(bed);
  drone.connect(bed);
  bed.connect(out);

  wind.start();
  gust.start();
  roots.forEach((osc) => osc.start());

  return {
    stop() {
      const now = audio.currentTime;
      bed.gain.cancelScheduledValues(now);
      bed.gain.setValueAtTime(bed.gain.value, now);
      bed.gain.linearRampToValueAtTime(0, now + 0.6);
      const end = now + 0.7;
      wind.stop(end);
      gust.stop(end);
      roots.forEach((osc) => osc.stop(end));
    },
  };
}

export function setSoundEnabled(next: boolean) {
  enabled = next;

  if (next) {
    const { ctx: audio } = getContext();
    void audio.resume();
    ambience ??= startAmbience();
    sfx.chime();
  } else {
    ambience?.stop();
    ambience = null;
  }
  emit();
}

export function useSoundEnabled() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => enabled,
    () => false,
  );
}

function envelope(audio: AudioContext, peak: number, attack: number, decay: number) {
  const gain = audio.createGain();
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return gain;
}

let lastTick = 0;

export const sfx = {
  /** A dry instrument click for hovering anything interactive. */
  tick() {
    if (!enabled || !ctx) return;
    const now = performance.now();
    if (now - lastTick < 45) return;
    lastTick = now;
    const { ctx: audio, master: out } = getContext();
    const src = audio.createBufferSource();
    src.buffer = noiseBuffer(audio, 0.03);
    const hp = audio.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3200 + Math.random() * 1400;
    const amp = envelope(audio, 0.18, 0.001, 0.025);
    src.connect(hp).connect(amp).connect(out);
    src.start();
  },

  /** Sonar ping with a decaying echo, for dropping a survey pin. */
  ping(pitch = 1) {
    if (!enabled || !ctx) return;
    const { ctx: audio, master: out } = getContext();
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1320 * pitch, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880 * pitch, audio.currentTime + 0.35);
    const amp = envelope(audio, 0.22, 0.004, 0.9);
    const delay = audio.createDelay();
    delay.delayTime.value = 0.23;
    const feedback = audio.createGain();
    feedback.gain.value = 0.38;
    const tone = audio.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    osc.connect(amp);
    amp.connect(out);
    amp.connect(delay);
    delay.connect(tone).connect(feedback).connect(delay);
    feedback.connect(out);
    osc.start();
    osc.stop(audio.currentTime + 1);
  },

  /** Two soft notes, played when sound is switched on. */
  chime() {
    if (!enabled || !ctx) return;
    const { ctx: audio, master: out } = getContext();
    [659.25, 987.77].forEach((freq, i) => {
      const osc = audio.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const amp = audio.createGain();
      const start = audio.currentTime + i * 0.09;
      amp.gain.setValueAtTime(0, start);
      amp.gain.linearRampToValueAtTime(0.12, start + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      osc.connect(amp).connect(out);
      osc.start(start);
      osc.stop(start + 1.2);
    });
  },

  /** Airy sweep for big transitions. */
  whoosh() {
    if (!enabled || !ctx) return;
    const { ctx: audio, master: out } = getContext();
    const src = audio.createBufferSource();
    src.buffer = noiseBuffer(audio, 0.9);
    const band = audio.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.4;
    band.frequency.setValueAtTime(300, audio.currentTime);
    band.frequency.exponentialRampToValueAtTime(3200, audio.currentTime + 0.6);
    const amp = envelope(audio, 0.16, 0.25, 0.6);
    src.connect(band).connect(amp).connect(out);
    src.start();
  },

  /** Fire crackle: a scatter of tiny noise pops. */
  crackle(seconds = 2.5) {
    if (!enabled || !ctx) return;
    const { ctx: audio, master: out } = getContext();
    const pops = Math.floor(seconds * 22);
    for (let i = 0; i < pops; i++) {
      const at = audio.currentTime + Math.random() * seconds;
      const src = audio.createBufferSource();
      src.buffer = noiseBuffer(audio, 0.02);
      const band = audio.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 900 + Math.random() * 3000;
      const amp = audio.createGain();
      amp.gain.setValueAtTime(0, at);
      amp.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.12, at + 0.002);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.02 + Math.random() * 0.04);
      src.connect(band).connect(amp).connect(out);
      src.start(at);
    }
  },
};
