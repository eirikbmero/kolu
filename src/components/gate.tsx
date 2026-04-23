"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WORKSHOP_PASSWORD } from "@/hooks/use-session";

type Props = { onSignIn: (name: string) => void };

export function Gate({ onSignIn }: Props) {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.trim() !== WORKSHOP_PASSWORD) {
      setError("Feil passord. Prøv igjen.");
      return;
    }
    if (!name.trim()) {
      setError("Skriv inn navnet ditt.");
      return;
    }
    onSignIn(name.trim());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl border bg-card p-8 shadow-sm"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold">AI-initiativ-prioritering</h1>
          <p className="text-sm text-muted-foreground">
            Skriv inn passord og navn for å bli med på workshoppen.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Passord</Label>
          <Input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="workshop-passord"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Navnet ditt</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="F.eks. Eirik"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full">
          Gå inn
        </Button>
      </form>
    </main>
  );
}
