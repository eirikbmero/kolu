"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import throttle from "lodash.throttle";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import type { Initiative, NewInitiative } from "@/lib/types";

type DragPayload = { id: string; author: string; clientId: string };

const DRAG_CHANNEL = "workshop:drag";
const DRAG_TIMEOUT_MS = 5000;

export function useInitiatives(selfName: string | null) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local drag state: IDs we're currently dragging → ignore realtime updates for them
  const localDraggingRef = useRef<Set<string>>(new Set());
  // Remote drag state: id → author (other people's locks)
  const [remoteLocks, setRemoteLocks] = useState<Map<string, string>>(
    () => new Map()
  );
  const remoteLockTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clientIdRef = useRef<string>("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!clientIdRef.current) {
      clientIdRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
    }

    const supabase = getSupabase();
    const timers = remoteLockTimersRef.current;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("ai_initiatives")
        .select("*")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setInitiatives((data ?? []) as Initiative[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(DRAG_CHANNEL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_initiatives" },
        (payload) => {
          const row = payload.new as Initiative;
          setInitiatives((prev) =>
            prev.some((p) => p.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ai_initiatives" },
        (payload) => {
          const row = payload.new as Initiative;
          // If we're dragging this one locally, ignore — avoid echo fighting the pointer
          if (localDraggingRef.current.has(row.id)) return;
          setInitiatives((prev) =>
            prev.map((p) => (p.id === row.id ? row : p))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "ai_initiatives" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setInitiatives((prev) => prev.filter((p) => p.id !== id));
        }
      )
      .on("broadcast", { event: "drag:start" }, ({ payload }) => {
        const p = payload as DragPayload;
        if (p.clientId === clientIdRef.current) return;
        scheduleLockExpiry(p.id);
        setRemoteLocks((prev) => {
          const next = new Map(prev);
          next.set(p.id, p.author);
          return next;
        });
      })
      .on("broadcast", { event: "drag:end" }, ({ payload }) => {
        const p = payload as DragPayload;
        if (p.clientId === clientIdRef.current) return;
        clearLockExpiry(p.id);
        setRemoteLocks((prev) => {
          if (!prev.has(p.id)) return prev;
          const next = new Map(prev);
          next.delete(p.id);
          return next;
        });
      })
      .subscribe();

    channelRef.current = channel;

    function scheduleLockExpiry(id: string) {
      const existing = timers.get(id);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setRemoteLocks((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        timers.delete(id);
      }, DRAG_TIMEOUT_MS);
      timers.set(id, t);
    }

    function clearLockExpiry(id: string) {
      const existing = timers.get(id);
      if (existing) {
        clearTimeout(existing);
        timers.delete(id);
      }
    }

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  // --- Mutations ---

  const create = useCallback(async (input: NewInitiative) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("ai_initiatives")
      .insert({
        title: input.title,
        description: input.description ?? null,
        author_name: input.author_name,
        position_x: input.position_x ?? 50,
        position_y: input.position_y ?? 50,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    const row = data as Initiative;
    setInitiatives((prev) =>
      prev.some((p) => p.id === row.id) ? prev : [...prev, row]
    );
    return row;
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<Pick<Initiative, "title" | "description">>) => {
      setInitiatives((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      const supabase = getSupabase();
      const { error } = await supabase
        .from("ai_initiatives")
        .update(patch)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    setInitiatives((prev) => prev.filter((p) => p.id !== id));
    const supabase = getSupabase();
    const { error } = await supabase
      .from("ai_initiatives")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }, []);

  // Throttled server write (100ms, leading + trailing)
  const throttledPersistPosition = useMemo(
    () =>
      throttle(
        async (id: string, x: number, y: number) => {
          const supabase = getSupabase();
          await supabase
            .from("ai_initiatives")
            .update({ position_x: x, position_y: y })
            .eq("id", id);
        },
        100,
        { leading: true, trailing: true }
      ),
    []
  );

  const setPositionLocal = useCallback(
    (id: string, x: number, y: number) => {
      setInitiatives((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, position_x: x, position_y: y } : p
        )
      );
      throttledPersistPosition(id, x, y);
    },
    [throttledPersistPosition]
  );

  const commitPosition = useCallback(
    async (id: string, x: number, y: number) => {
      throttledPersistPosition.flush();
      setInitiatives((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, position_x: x, position_y: y } : p
        )
      );
      const supabase = getSupabase();
      const { error } = await supabase
        .from("ai_initiatives")
        .update({ position_x: x, position_y: y })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    [throttledPersistPosition]
  );

  // --- Drag-lock broadcasts ---

  const startDrag = useCallback(
    (id: string) => {
      localDraggingRef.current.add(id);
      if (!selfName) return;
      channelRef.current?.send({
        type: "broadcast",
        event: "drag:start",
        payload: { id, author: selfName, clientId: clientIdRef.current },
      });
    },
    [selfName]
  );

  const endDrag = useCallback(
    (id: string) => {
      localDraggingRef.current.delete(id);
      if (!selfName) return;
      channelRef.current?.send({
        type: "broadcast",
        event: "drag:end",
        payload: { id, author: selfName, clientId: clientIdRef.current },
      });
    },
    [selfName]
  );

  return {
    initiatives,
    loading,
    error,
    remoteLocks,
    create,
    update,
    remove,
    setPositionLocal,
    commitPosition,
    startDrag,
    endDrag,
  };
}
