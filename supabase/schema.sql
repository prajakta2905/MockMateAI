-- Run once in Supabase Dashboard → SQL Editor. Candidate documents are only
-- accessed through the server API after Supabase Auth access-token verification.
create extension if not exists pgcrypto;

create table if not exists public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  doc_type text not null check (doc_type in ('resume', 'job_description')),
  file_name text not null,
  extracted_text text not null check (char_length(extracted_text) <= 20000),
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Keep earlier unowned rows private; never assign them to a different user.
alter table public.candidate_documents add column if not exists owner_id uuid;
-- Remove the obsolete identity column from an older version of this table.
alter table public.candidate_documents drop column if exists firebase_uid;
create unique index if not exists candidate_documents_owner_doc_type_key on public.candidate_documents(owner_id, doc_type);
create index if not exists candidate_documents_owner_idx on public.candidate_documents(owner_id);
alter table public.candidate_documents enable row level security;

-- Private originals are stored in Supabase Storage. No browser-side policies
-- are granted: the server API verifies Supabase Auth identity before accessing them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-documents', 'candidate-documents', false, 5242880, array['application/pdf', 'text/plain'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
