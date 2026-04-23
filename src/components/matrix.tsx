"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { QUADRANT_META } from "@/lib/quadrant";

type Props = {
  children: React.ReactNode;
  matrixRef: React.RefObject<HTMLDivElement | null>;
  isEmpty: boolean;
};

export function Matrix({ children, matrixRef, isEmpty }: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 gap-3">
        {/* Y-axis labels */}
        <div className="flex w-8 flex-col items-center justify-between py-2 text-xs font-medium text-muted-foreground">
          <span className="rotate-180 [writing-mode:vertical-rl]">
            Høy impact
          </span>
          <span className="font-semibold uppercase tracking-widest [writing-mode:vertical-rl]">
            Impact
          </span>
          <span className="rotate-180 [writing-mode:vertical-rl]">
            Lav impact
          </span>
        </div>

        {/* Matrix plane */}
        <div className="relative flex-1 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div ref={matrixRef} className="absolute inset-0">
            {/* Quadrant backgrounds (y coord is inverted: top in DOM = high impact) */}
            <div
              className={cn(
                "absolute left-0 top-0 h-1/2 w-1/2",
                QUADRANT_META["quick-win"].bg
              )}
            >
              <div className="absolute left-3 top-2 text-xs font-semibold uppercase tracking-wide text-emerald-700/80">
                Quick wins
              </div>
            </div>
            <div
              className={cn(
                "absolute right-0 top-0 h-1/2 w-1/2",
                QUADRANT_META["big-bet"].bg
              )}
            >
              <div className="absolute right-3 top-2 text-xs font-semibold uppercase tracking-wide text-blue-700/80">
                Big bets
              </div>
            </div>
            <div
              className={cn(
                "absolute bottom-0 left-0 h-1/2 w-1/2",
                QUADRANT_META["fill-in"].bg
              )}
            >
              <div className="absolute bottom-2 left-3 text-xs font-semibold uppercase tracking-wide text-amber-700/80">
                Fill-ins
              </div>
            </div>
            <div
              className={cn(
                "absolute bottom-0 right-0 h-1/2 w-1/2",
                QUADRANT_META["time-sink"].bg
              )}
            >
              <div className="absolute bottom-2 right-3 text-xs font-semibold uppercase tracking-wide text-rose-700/80">
                Time sinks
              </div>
            </div>

            {/* Crosshair axes */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-zinc-400/60" />
            <div className="pointer-events-none absolute bottom-0 top-0 left-1/2 w-[2px] -translate-x-1/2 bg-zinc-400/60" />

            {/* Empty state */}
            {isEmpty && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg border border-dashed bg-background/80 px-5 py-3 text-center text-sm text-muted-foreground shadow-sm">
                  Ingen initiativer ennå — klikk «Nytt initiativ» for å legge
                  inn det første.
                </div>
              </div>
            )}

            {/* Cards render here */}
            {children}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-11 flex justify-between text-xs font-medium text-muted-foreground">
        <span>Lav effort</span>
        <span className="font-semibold uppercase tracking-widest">Effort</span>
        <span>Høy effort</span>
      </div>
    </div>
  );
}
