create table if not exists public.scores (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  uuid not null unique,
  name        text,
  avatar_data jsonb,
  score       int  not null default 0,
  updated_at  timestamptz not null default now()
);

create index if not exists scores_score_idx on public.scores (score desc);

alter table public.guestbook add column if not exists visitor_id uuid;

create or replace function public.scores_only_increase()
returns trigger as $$
begin
  if new.score <= old.score then
    new.score := old.score;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists scores_only_increase on public.scores;
create trigger scores_only_increase
  before update on public.scores
  for each row execute function public.scores_only_increase();

alter table public.scores enable row level security;

drop policy if exists "scores are public" on public.scores;
create policy "scores are public" on public.scores
  for select using (true);

drop policy if exists "anyone can post a score" on public.scores;
create policy "anyone can post a score" on public.scores
  for insert with check (true);

drop policy if exists "anyone can raise their score" on public.scores;
create policy "anyone can raise their score" on public.scores
  for update using (true) with check (true);
