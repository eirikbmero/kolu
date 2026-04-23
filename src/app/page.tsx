import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { addNote, deleteNote } from "./actions";

type Note = {
  id: number;
  content: string;
  created_at: string;
};

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">kolu</h1>
        <p className="mt-4 text-zinc-600">
          Supabase-miljøvariabler mangler. Opprett en{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5">.env.local</code>{" "}
          med <code>NEXT_PUBLIC_SUPABASE_URL</code> og{" "}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, og restart
          dev-serveren.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });

  const notes = (data ?? []) as Note[];

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">kolu</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enkel notat-app – Next.js + Supabase
      </p>

      <form action={addNote} className="mt-6 flex gap-2">
        <input
          name="content"
          required
          placeholder="Skriv et notat…"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Legg til
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error.message} – har du kjørt SQL-en for <code>notes</code>-tabellen?
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2"
          >
            <span className="text-sm">{n.content}</span>
            <form action={deleteNote}>
              <input type="hidden" name="id" value={n.id} />
              <button
                type="submit"
                className="text-xs text-zinc-400 hover:text-red-600"
              >
                Slett
              </button>
            </form>
          </li>
        ))}
        {notes.length === 0 && !error && (
          <li className="text-sm text-zinc-500">Ingen notater ennå.</li>
        )}
      </ul>
    </main>
  );
}
