-- Kjør dette i Supabase SQL editor (https://supabase.com/dashboard -> SQL editor)

create table if not exists public.ai_initiatives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  author_name text not null,
  position_x double precision not null default 50 check (position_x between 0 and 100),
  position_y double precision not null default 50 check (position_y between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_initiatives enable row level security;

-- Åpne policyer: passord-sjekken skjer i frontend, dette er et internt workshop-verktøy.
drop policy if exists "anon select" on public.ai_initiatives;
drop policy if exists "anon insert" on public.ai_initiatives;
drop policy if exists "anon update" on public.ai_initiatives;
drop policy if exists "anon delete" on public.ai_initiatives;

create policy "anon select" on public.ai_initiatives for select using (true);
create policy "anon insert" on public.ai_initiatives for insert with check (true);
create policy "anon update" on public.ai_initiatives for update using (true) with check (true);
create policy "anon delete" on public.ai_initiatives for delete using (true);

-- Auto-touch updated_at
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ai_initiatives_touch on public.ai_initiatives;
create trigger ai_initiatives_touch
  before update on public.ai_initiatives
  for each row execute function public.touch_updated_at();

-- Aktiver realtime for tabellen
alter publication supabase_realtime add table public.ai_initiatives;
