"use client";

import { VolumeX } from "lucide-react";
import { toggleMusic, useMusicPlaying } from "./music";

/** Music on/off: moving bars while it plays, a crossed-out speaker when muted. Starts muted. */
export default function SoundToggle() {
  const on = useMusicPlaying();

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-pressed={on}
      aria-label={on ? "Mute music" : "Play music"}
      data-cursor={on ? "MUTE" : "PLAY"}
      className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/30 bg-[rgb(30_38_90/0.38)] text-foreground shadow-[0_10px_30px_rgb(40_50_100/0.2)] backdrop-blur-xl backdrop-saturate-150 transition-transform hover:scale-105"
    >
      {on ? (
        <span className="flex h-3 items-end gap-[2px]">
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="h-full w-[2px] origin-bottom bg-current"
              style={{ animation: `eq-bar 0.${7 + bar}s ease-in-out ${bar * 0.12}s infinite alternate` }}
            />
          ))}
        </span>
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
    </button>
  );
}
