"use client";

import { useState } from "react";
import { Monitor, X } from "lucide-react";

export function MobileBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 md:hidden">
      <Monitor className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">
        Dette verktøyet fungerer best på større skjerm. Du kan fortsette, men
        drag-and-drop er enklere på laptop/PC.
      </p>
      <button
        type="button"
        aria-label="Lukk melding"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 hover:bg-amber-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
