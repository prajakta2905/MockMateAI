-- ====================================================================
-- MockMate AI — Minimal & Ultra-Clean Supabase Database Schema
-- Stores ONLY the 4 essential things:
-- 1. Candidate Profile (Name, Target Role, Skills, Projects)
-- 2. Session Info (Interview Type, Duration, Date)
-- 3. Q&A Transcript Array (Every Question & Candidate Spoken Answer)
-- 4. Final AI Scorecard (Overall Score, Verdict, Category Ratings, Strengths, Feedback)
-- ====================================================================

create extension if not exists pgcrypto;

-- Clean up any old unused tables if they were previously created
drop table if exists public.interview_turns cascade;
drop table if exists public.interview_sessions cascade;
drop table if exists public.candidate_documents cascade;
drop table if exists public.practice_history cascade;
drop table if exists public.practice_plan cascade;

-- 1. Resumes Table (Clean Candidate Profile)
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  candidate_name text not null,
  target_role text not null,
  skills jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 2. Interview Reports Table (Session Metadata + Full Q&A Transcript + AI Scorecard)
create table if not exists public.interview_reports (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  resume_id uuid references public.resumes(id) on delete set null,
  candidate_name text not null,
  target_role text not null,
  interview_type text not null default 'Full Mock',
  duration_formatted text default '15m 0s',
  overall_score integer not null check (overall_score between 0 and 100),
  hiring_decision text not null,
  category_scores jsonb not null default '{}'::jsonb,
  executive_summary text,
  strengths jsonb default '[]'::jsonb,
  areas_for_improvement jsonb default '[]'::jsonb,
  transcript jsonb default '[]'::jsonb, -- Turn-by-turn question & candidate answer history
  created_at timestamptz not null default now()
);

-- Fast Indexes
create index if not exists idx_resumes_user on public.resumes(user_id);
create index if not exists idx_reports_user on public.interview_reports(user_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table public.resumes enable row level security;
alter table public.interview_reports enable row level security;

-- Policies for seamless reads & writes
drop policy if exists "Allow all on resumes" on public.resumes;
create policy "Allow all on resumes"
  on public.resumes for all
  using (true)
  with check (true);

drop policy if exists "Allow all on interview_reports" on public.interview_reports;
create policy "Allow all on interview_reports"
  on public.interview_reports for all
  using (true)
  with check (true);
