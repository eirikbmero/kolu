"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { colorForName } from "@/lib/color";
import { quadrantFor, QUADRANT_META } from "@/lib/quadrant";
import type { Initiative } from "@/lib/types";

type Props = {
  initiative: Initiative;
  lockedByOther: string | null;
  onRequestEdit: (i: Initiative) => void;
  onRequestDelete: (i: Initiative) => void;
};

export function InitiativeCard({
  initiative,
  lockedByOther,
  onRequestEdit,
  onRequestDelete,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: initiative.id, disabled: !!lockedByOther });

  const color = colorForName(initiative.author_name);
  const quadrant = quadrantFor(initiative.position_x, initiative.position_y);
  const meta = QUADRANT_META[quadrant];

  const style: React.CSSProperties = {
    left: `${initiative.position_x}%`,
    top: `${100 - initiative.position_y}%`, // high impact = top of DOM
    transform: `translate(-50%, -50%) ${CSS.Translate.toString(transform) ?? ""}`,
    transition: isDragging
      ? "none"
      : "left 180ms ease-out, top 180ms ease-out",
    zIndex: isDragging ? 50 : 1,
    touchAction: "none",
  };

  return (
    <Popover open={open && !isDragging} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "absolute w-44 select-none rounded-lg border bg-card px-3 py-2 shadow-md",
            "ring-1 ring-black/5",
            isDragging && "cursor-grabbing shadow-xl ring-2 ring-primary/40",
            !isDragging && !lockedByOther && "cursor-pointer hover:shadow-lg",
            lockedByOther && "cursor-not-allowed opacity-90 ring-2 ring-amber-400"
          )}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              aria-label="Dra for å flytte"
              className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!!lockedByOther}
              {...listeners}
              {...attributes}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-sm font-medium leading-tight"
                title={initiative.title}
              >
                {initiative.title}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span className="truncate text-[11px] text-muted-foreground">
                  {initiative.author_name}
                </span>
              </div>
            </div>
          </div>

          {lockedByOther && (
            <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-amber-950 shadow">
              {lockedByOther} flytter…
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent side="top" sideOffset={10} className="w-80">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-snug">
                {initiative.title}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {initiative.author_name}
              </div>
            </div>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                meta.color,
                meta.bg
              )}
            >
              {meta.label}
            </span>
          </div>

          {initiative.description ? (
            <p className="whitespace-pre-wrap text-sm text-foreground/80">
              {initiative.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Ingen beskrivelse.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              Effort: <strong>{Math.round(initiative.position_x)}</strong>
            </div>
            <div>
              Impact: <strong>{Math.round(initiative.position_y)}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                onRequestEdit(initiative);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Rediger
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setOpen(false);
                onRequestDelete(initiative);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Slett
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
