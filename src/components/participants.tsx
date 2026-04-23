"use client";

import { Users } from "lucide-react";
import { colorForName, initialsFor } from "@/lib/color";
import type { Initiative } from "@/lib/types";

type Props = { initiatives: Initiative[] };

export function Participants({ initiatives }: Props) {
  const names = Array.from(
    new Set(initiatives.map((i) => i.author_name).filter(Boolean))
  );

  if (names.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Ingen bidragsytere ennå
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center -space-x-2">
        {names.slice(0, 8).map((name) => (
          <div
            key={name}
            title={name}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: colorForName(name) }}
          >
            {initialsFor(name)}
          </div>
        ))}
        {names.length > 8 && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground shadow-sm">
            +{names.length - 8}
          </div>
        )}
      </div>
    </div>
  );
}
