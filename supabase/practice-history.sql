-- Run once in Supabase Dashboard → SQL Editor to enable private practice history.
-- History is accessed only through the server API after Supabase Auth verification.
create table if not exists public.practice_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  role text not null check (char_length(role) between 1 and 120),
  score integer not null check (score between 0 and 100),
  answer_count integer not null check (answer_count between 1 and 50),
  duration_minutes integer not null check (duration_minutes in (20, 30, 45)),
  completed_at timestamptz not null default now()
);

create index if not exists practice_history_owner_completed_idx
  on public.practice_history(owner_id, completed_at desc);

alter table public.practice_history enable row level security;
