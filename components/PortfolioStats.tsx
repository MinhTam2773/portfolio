"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { sfx } from "@/components/fx/sound";

export function PortfolioStats() {
  const stats = useQuery(api.stats.get);
  const incrementLike = useMutation(api.stats.incrementLike);
  const [pops, setPops] = useState(0);

  const views = stats?.views ?? 0;
  const likes = stats?.likes ?? 0;

  const like = () => {
    sfx.ping(1.5);
    setPops((current) => current + 1);
    void incrementLike();
  };

  return (
    <div className="flex items-center gap-10 font-serif text-3xl text-foreground [filter:drop-shadow(0_1px_3px_rgb(34_40_90/0.55))]">
      <button
        type="button"
        onClick={like}
        data-cursor="LIKE"
        className="group inline-flex items-center gap-2.5 transition-colors hover:text-primary"
        aria-label="Like this portfolio"
      >
        {/* The key restarts the pop on every click. */}
        <motion.span
          key={pops}
          className="inline-flex"
          animate={pops ? { scale: [1, 1.6, 0.9, 1] } : undefined}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Heart className={`h-9 w-9 ${pops ? "fill-red-500 text-red-500" : "group-hover:fill-current"}`} />
        </motion.span>
        {likes.toLocaleString("en-CA")}
      </button>
      <span className="inline-flex items-center gap-2.5">
        <Eye className="h-9 w-9" aria-hidden />
        <span className="sr-only">Visitors:</span>
        {views.toLocaleString("en-CA")}
      </span>
    </div>
  );
}
