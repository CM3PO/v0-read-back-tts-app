-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Create sections table for text storage
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create audio_cache table for TTS caching
create table if not exists public.audio_cache (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  voice_id text not null,
  audio_url text not null,
  content_hash text not null,
  created_at timestamp with time zone default now(),
  unique(section_id, voice_id, content_hash)
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  status text not null check (status in ('active', 'cancelled', 'expired')),
  plan_type text not null check (plan_type in ('free', 'premium')),
  started_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  apple_transaction_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.audio_cache enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Sections policies
create policy "sections_select_own"
  on public.sections for select
  using (auth.uid() = user_id);

create policy "sections_insert_own"
  on public.sections for insert
  with check (auth.uid() = user_id);

create policy "sections_update_own"
  on public.sections for update
  using (auth.uid() = user_id);

create policy "sections_delete_own"
  on public.sections for delete
  using (auth.uid() = user_id);

-- Audio cache policies (users can only access their own cached audio)
create policy "audio_cache_select_own"
  on public.audio_cache for select
  using (
    exists (
      select 1 from public.sections
      where sections.id = audio_cache.section_id
      and sections.user_id = auth.uid()
    )
  );

create policy "audio_cache_insert_own"
  on public.audio_cache for insert
  with check (
    exists (
      select 1 from public.sections
      where sections.id = audio_cache.section_id
      and sections.user_id = auth.uid()
    )
  );

-- Subscriptions policies
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id);
