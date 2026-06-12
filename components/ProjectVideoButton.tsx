"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlayCircle, X } from "lucide-react";

type ProjectVideoButtonProps = {
  videoUrl: string;
  title: string;
  label?: string;
};

function getYouTubeEmbedUrl(videoUrl: string) {
  const url = new URL(videoUrl);
  const videoId = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");

  if (!videoId) {
    return videoUrl;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

export default function ProjectVideoButton({ videoUrl, title, label }: ProjectVideoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-primary/40 bg-primary/10 text-primary font-semibold hover:bg-primary/15 transition-colors"
        aria-haspopup="dialog"
      >
        <PlayCircle className="w-4 h-4" />
        {label ?? "Watch Video"}
      </button>

      {isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} video`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 px-4 py-3 text-white">
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">Behind the Build</p>
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={embedUrl}
                title={`${title} journey video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
