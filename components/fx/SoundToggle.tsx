"use client";

import { setSoundEnabled, useSoundEnabled } from "./sound";

/** Sound is opt-in. The bars dance while the field ambience is playing. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSoundEnabled();

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      data-cursor={on ? "MUTE" : "SOUND ON"}
      className={`group inline-flex items-center gap-2.5 px-2 py-2 font-mono text-[11px] tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[2px] origin-bottom bg-current ${on ? "text-primary" : ""}`}
            style={{
              height: "100%",
              transform: on ? undefined : "scaleY(0.25)",
              animation: on ? `eq-bar 0.${7 + bar}s ease-in-out ${bar * 0.12}s infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      SND {on ? "ON" : "OFF"}
    </button>
  );
}
