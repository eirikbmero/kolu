"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-md border bg-background text-foreground shadow-md p-3 text-sm",
        },
      }}
    />
  );
}
