"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { Plus, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Matrix } from "@/components/matrix";
import { InitiativeCard } from "@/components/initiative-card";
import { InitiativeDialog } from "@/components/initiative-dialog";
import { Participants } from "@/components/participants";
import { Stats } from "@/components/stats";
import { MobileBanner } from "@/components/mobile-banner";
import { useInitiatives } from "@/hooks/use-initiatives";
import type { Initiative } from "@/lib/types";

type Props = {
  selfName: string;
  onSignOut: () => void;
};

export function Workshop({ selfName, onSignOut }: Props) {
  const {
    initiatives,
    loading,
    error,
    remoteLocks,
    create,
    update,
    remove,
    commitPosition,
    startDrag,
    endDrag,
  } = useInitiatives(selfName);

  const matrixRef = useRef<HTMLDivElement | null>(null);

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Initiative | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  // Sort by updated_at ASC → latest-moved rendered last → on top
  const ordered = useMemo(
    () =>
      [...initiatives].sort((a, b) =>
        a.updated_at.localeCompare(b.updated_at)
      ),
    [initiatives]
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      startDrag(String(e.active.id));
    },
    [startDrag]
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const id = String(e.active.id);
      endDrag(id);

      const rect = matrixRef.current?.getBoundingClientRect();
      if (!rect) return;

      const item = initiatives.find((i) => i.id === id);
      if (!item) return;

      const dxPct = (e.delta.x / rect.width) * 100;
      const dyPct = (e.delta.y / rect.height) * 100; // DOM y: down is positive
      const newX = clamp(item.position_x + dxPct, 0, 100);
      // impact (y) is inverted: dragging DOWN in DOM decreases impact
      const newY = clamp(item.position_y - dyPct, 0, 100);

      commitPosition(id, newX, newY).catch((err) => {
        toast.error("Klarte ikke lagre posisjon: " + err.message);
      });
    },
    [initiatives, commitPosition, endDrag]
  );

  const handleCreate = useCallback(
    async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      await create({
        title,
        description: description || null,
        author_name: selfName,
      });
      toast.success("Initiativ lagt til");
    },
    [create, selfName]
  );

  const handleEdit = useCallback(
    async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      if (!editTarget) return;
      await update(editTarget.id, {
        title,
        description: description || null,
      });
      toast.success("Oppdatert");
    },
    [update, editTarget]
  );

  const handleDelete = useCallback(
    async (i: Initiative) => {
      const ok = confirm(`Slette «${i.title}»?`);
      if (!ok) return;
      try {
        await remove(i.id);
        toast.success("Slettet");
      } catch (err) {
        toast.error(
          "Klarte ikke slette: " +
            (err instanceof Error ? err.message : "ukjent feil")
        );
      }
    },
    [remove]
  );

  return (
    <main className="flex h-screen flex-col gap-3 p-4">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            AI-initiativ-prioritering
          </h1>
          <p className="text-xs text-muted-foreground">
            Workshop · innlogget som <strong>{selfName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Participants initiatives={initiatives} />
          <Button
            size="sm"
            onClick={() => {
              setDialogMode("create");
              setEditTarget(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nytt initiativ
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSignOut}
            title="Logg ut"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <MobileBanner />

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error} — har du kjørt SQL-en i{" "}
          <code>supabase/schema.sql</code>?
        </div>
      )}

      {/* Matrix */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : (
          <DndContext
            sensors={sensors}
            modifiers={[restrictToParentElement]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Matrix matrixRef={matrixRef} isEmpty={initiatives.length === 0}>
              {ordered.map((i) => (
                <InitiativeCard
                  key={i.id}
                  initiative={i}
                  lockedByOther={remoteLocks.get(i.id) ?? null}
                  onRequestEdit={(target) => {
                    setEditTarget(target);
                    setDialogMode("edit");
                    setDialogOpen(true);
                  }}
                  onRequestDelete={handleDelete}
                />
              ))}
            </Matrix>
          </DndContext>
        )}
      </div>

      {/* Stats */}
      <Stats initiatives={initiatives} />

      <InitiativeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initial={editTarget}
        onSubmit={dialogMode === "create" ? handleCreate : handleEdit}
      />
    </main>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
