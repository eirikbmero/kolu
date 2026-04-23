"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Initiative } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Initiative | null;
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
};

export function InitiativeDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        {/* Force remount when opened so form resets from `initial` without a sync-setState-in-effect */}
        {props.open && (
          <DialogForm
            key={(props.mode === "edit" ? props.initial?.id : null) ?? "new"}
            {...props}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DialogForm({ mode, initial, onOpenChange, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) {
      setError("Tittel er påkrevd.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: clean, description: description.trim() });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Nytt initiativ" : "Rediger initiativ"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Gi initiativet en tittel og eventuelt en kort beskrivelse."
            : "Oppdater tittel eller beskrivelse."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Tittel</Label>
          <Input
            id="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="F.eks. Kundeservice-chatbot"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">
            Beskrivelse{" "}
            <span className="text-muted-foreground">(valgfri)</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kort om hva initiativet går ut på…"
            rows={4}
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Lagrer…" : mode === "create" ? "Legg til" : "Lagre"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
