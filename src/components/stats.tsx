"use client";

import { quadrantFor, QUADRANT_META } from "@/lib/quadrant";
import type { Initiative, Quadrant } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = { initiatives: Initiative[] };

const ORDER: Quadrant[] = ["quick-win", "big-bet", "fill-in", "time-sink"];

export function Stats({ initiatives }: Props) {
  const total = initiatives.length;
  const participants = new Set(initiatives.map((i) => i.author_name)).size;

  const counts: Record<Quadrant, number> = {
    "quick-win": 0,
    "big-bet": 0,
    "fill-in": 0,
    "time-sink": 0,
  };
  for (const i of initiatives) {
    counts[quadrantFor(i.position_x, i.position_y)]++;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
      <div>
        <strong className="text-foreground">{total}</strong>{" "}
        {total === 1 ? "initiativ" : "initiativer"}
      </div>
      <div>
        <strong className="text-foreground">{participants}</strong>{" "}
        {participants === 1 ? "bidragsyter" : "bidragsytere"}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {ORDER.map((q) => {
          const meta = QUADRANT_META[q];
          return (
            <span key={q} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-sm",
                  meta.bg,
                  "ring-1",
                  meta.ring
                )}
              />
              <span className={cn("font-medium", meta.color)}>
                {meta.label}
              </span>
              <span className="text-foreground font-semibold">
                {counts[q]}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
