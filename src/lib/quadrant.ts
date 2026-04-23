import type { Quadrant } from "./types";

export function quadrantFor(x: number, y: number): Quadrant {
  // y>=50 = høy impact (øverst), x<50 = lav effort (venstre)
  if (y >= 50 && x < 50) return "quick-win";
  if (y >= 50 && x >= 50) return "big-bet";
  if (y < 50 && x < 50) return "fill-in";
  return "time-sink";
}

export const QUADRANT_META: Record<
  Quadrant,
  { label: string; color: string; bg: string; ring: string }
> = {
  "quick-win": {
    label: "Quick wins",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  "big-bet": {
    label: "Big bets",
    color: "text-blue-700",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
  "fill-in": {
    label: "Fill-ins",
    color: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  "time-sink": {
    label: "Time sinks",
    color: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
  },
};
