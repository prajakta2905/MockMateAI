-- Run once in Supabase Dashboard → SQL Editor to enable private practice plans.
-- The server verifies Supabase Auth before reading or writing this table.
create table if not exists public.practice_plans (
  owner_id uuid primary key,
  tasks jsonb not null default '[]'::jsonb
    check (jsonb_typeof(tasks) = 'array' and jsonb_array_length(tasks) <= 6),
  updated_at timestamptz not null default now()
);
git
alter table public.practice_plans enable row level security;
