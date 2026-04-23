"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "kolu:session";
export const WORKSHOP_PASSWORD = "workshop2026";

type SessionData = { name: string };

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionData;
    return parsed?.name ?? null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (!e.key || e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("kolu:session-change", onChange as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(
      "kolu:session-change",
      onChange as EventListener
    );
  };
}

export function useSession() {
  const name = useSyncExternalStore(subscribe, readStored, () => null);

  const signIn = useCallback((newName: string) => {
    const clean = newName.trim();
    if (!clean) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: clean }));
    window.dispatchEvent(new Event("kolu:session-change"));
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("kolu:session-change"));
  }, []);

  return { name, signIn, signOut };
}
