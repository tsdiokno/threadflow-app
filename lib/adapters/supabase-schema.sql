-- =========================================================================
-- ThreadFlow Production Database Schema (Supabase / PostgreSQL)
-- Inspired by WordPress's 5-minute automated setup
-- =========================================================================

-- Enable uuid generation
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
  id text primary key,
  name text not null,
  avatar text,
  role text default 'developer',
  status text default 'online',
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. THREADS TABLE (Aggregate Root)
create table if not exists public.threads (
  id text primary key,
  name text not null,
  description text default '',
  cover_url text,
  type text default 'group' check (type in ('group', 'dm')),
  member_ids jsonb default '[]'::jsonb,
  is_pinned boolean default false,
  pinned_message_id text,
  tag_defs jsonb default '[]'::jsonb,
  custom_fields jsonb default '{}'::jsonb,
  thread_tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MESSAGES TABLE
create table if not exists public.messages (
  id text primary key,
  thread_id text references public.threads(id) on delete cascade not null,
  sender text not null default 'other',
  sender_name text not null default 'Member',
  content text not null default '',
  tag_ids jsonb default '[]'::jsonb,
  is_pinned boolean default false,
  is_edited boolean default false,
  edited_at timestamp with time zone,
  poll jsonb,
  annotation_file_id text,
  annotation_point jsonb,
  annotation_parent_id text,
  annotation_reply_to_name text,
  annotation_root_content text,
  reply_parent_id text,
  reply_to_name text,
  reply_snippet text,
  attachments jsonb default '[]'::jsonb,
  edit_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for high-velocity thread message lookup
create index if not exists idx_messages_thread_id on public.messages (thread_id, created_at asc);

-- 4. FILE ASSETS TABLE
create table if not exists public.file_assets (
  id text primary key,
  thread_id text references public.threads(id) on delete cascade not null,
  name text not null,
  url text not null,
  type text not null,
  size bigint not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. WORKSPACE METADATA & INSTALL STATE
create table if not exists public.workspace_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- REALTIME SUBSCRIPTIONS
-- Adds tables to the Supabase Realtime publication for instant WebSockets
-- =========================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'threads'
  ) then
    alter publication supabase_realtime add table public.threads;
  end if;
end $$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Open for workspace team members in MVP
-- =========================================================================
alter table public.users enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.file_assets enable row level security;
alter table public.workspace_config enable row level security;

-- Public read/write policies for authenticated / anon keys in zero-cost setup
create policy "Allow all operations for users" on public.users for all using (true) with check (true);
create policy "Allow all operations for threads" on public.threads for all using (true) with check (true);
create policy "Allow all operations for messages" on public.messages for all using (true) with check (true);
create policy "Allow all operations for file_assets" on public.file_assets for all using (true) with check (true);
create policy "Allow all operations for workspace_config" on public.workspace_config for all using (true) with check (true);
