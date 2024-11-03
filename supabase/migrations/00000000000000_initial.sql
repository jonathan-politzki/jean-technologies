-- Enable pgvector extension
create extension if not exists vector;

-- Users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text,
  full_name text,
  avatar_url text
);

-- Social profiles table
create table public.social_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null,
  platform_user_id text not null,
  access_token text,
  refresh_token text,
  profile_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(platform, platform_user_id)
);

-- Embeddings table
create table public.embeddings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  source text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Semantic labels table
create table public.semantic_labels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  label text not null,
  confidence float not null,
  source text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.social_profiles enable row level security;
alter table public.embeddings enable row level security;
alter table public.semantic_labels enable row level security;

-- Create RLS policies
create policy "Users can read their own data"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can read their own social profiles"
  on public.social_profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can read their own embeddings"
  on public.embeddings
  for select
  using (auth.uid() = user_id);

create policy "Users can read their own semantic labels"
  on public.semantic_labels
  for select
  using (auth.uid() = user_id);
