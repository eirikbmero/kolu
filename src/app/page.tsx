"use client";

import { Gate } from "@/components/gate";
import { Workshop } from "@/components/workshop";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "@/hooks/use-session";
import { hasSupabaseEnv } from "@/lib/supabase";

export default function Page() {
  const { name, signIn, signOut } = useSession();

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">kolu</h1>
        <p className="mt-4 text-zinc-600">
          Supabase-miljøvariabler mangler. Sett{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          og{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          i <code>.env.local</code> og restart dev-serveren.
        </p>
      </main>
    );
  }

  return (
    <>
      {name ? (
        <Workshop selfName={name} onSignOut={signOut} />
      ) : (
        <Gate onSignIn={signIn} />
      )}
      <Toaster />
    </>
  );
}
