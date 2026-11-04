"use client";

import { useEffect } from "react";
import { startMusic, toggleMusic, useMusicPlaying } from "./music";

/** Music on/off. The bars move while it plays. Also starts the music on page load. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useMusicPlaying();

  useEffect(() => {
    startMusic();
  }, []);

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggleMusic}
      aria-pressed={on}
      aria-label={on ? "Mute music" : "Play music"}
      data-cursor={on ? "MUTE" : "PLAY"}
      className={`inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[2px] origin-bottom bg-current ${on ? "text-foreground" : ""}`}
            style={{
              height: "100%",
              transform: on ? undefined : "scaleY(0.25)",
              animation: on ? `eq-bar 0.${7 + bar}s ease-in-out ${bar * 0.12}s infinite alternate` : "none",
            }}
          />
        ))}
      </span>
    </button>
  );
}
