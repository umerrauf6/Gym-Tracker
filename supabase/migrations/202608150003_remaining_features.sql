alter table public.profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists training_goal text not null default 'muscle'
    check (training_goal in ('strength', 'muscle', 'fitness', 'weight-loss')),
  add column if not exists experience_level text not null default 'beginner'
    check (experience_level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists days_per_week integer not null default 3
    check (days_per_week between 1 and 7);

-- The client ID is stable across local-first sync. image_url can initially be
-- a device URI; production deployments should replace it with a Storage URL.
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null,
  image_url text not null,
  caption text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists progress_photos_user_captured_idx
  on public.progress_photos(user_id, captured_at desc);

alter table public.progress_photos enable row level security;

create policy "Users manage own progress photos"
  on public.progress_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
