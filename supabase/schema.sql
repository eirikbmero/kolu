-- Kjør i Supabase SQL editor
create table if not exists public.notes (
  id bigint generated always as identity primary key,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

-- For en enkel start: tillat alle å lese/skrive via anon-key.
-- Stram opp dette når du legger til auth.
create policy "public read"   on public.notes for select using (true);
create policy "public insert" on public.notes for insert with check (true);
create policy "public delete" on public.notes for delete using (true);
