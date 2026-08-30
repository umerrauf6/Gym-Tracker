create extension if not exists pgcrypto;

create type public.subscription_tier as enum ('free', 'pro');
create type public.workout_status as enum ('planned', 'active', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  subscription_tier public.subscription_tier not null default 'free',
  subscription_expires_at timestamptz,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  instructions text[] not null default '{}',
  common_mistakes text[] not null default '{}',
  media_url text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- A workout is a reusable routine. Free-tier limits should be enforced server-side.
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  position integer not null check (position >= 0),
  target_sets integer check (target_sets > 0),
  target_reps_min integer check (target_reps_min > 0),
  target_reps_max integer check (target_reps_max >= target_reps_min),
  rest_seconds integer not null default 90 check (rest_seconds >= 0),
  notes text,
  unique (workout_id, position)
);

-- One row per workout session; set-level data stays normalized below.
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  workout_name text not null,
  status public.workout_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  check (completed_at is null or completed_at >= started_at)
);

create table public.workout_log_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  replaced_exercise_id uuid references public.exercises(id),
  position integer not null check (position >= 0),
  notes text,
  unique (workout_log_id, position)
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_log_exercise_id uuid not null references public.workout_log_exercises(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  reps integer check (reps >= 0),
  weight_kg numeric(7,2) check (weight_kg >= 0),
  is_warmup boolean not null default false,
  completed_at timestamptz,
  unique (workout_log_exercise_id, set_number)
);

create index exercises_primary_muscle_idx on public.exercises(primary_muscle);
create index exercises_equipment_idx on public.exercises(equipment);
create index workouts_user_id_idx on public.workouts(user_id);
create index workout_logs_user_started_idx on public.workout_logs(user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_log_exercises enable row level security;
alter table public.workout_sets enable row level security;

create policy "Exercises are readable by authenticated users"
  on public.exercises for select to authenticated using (true);
create policy "Users manage own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own workouts"
  on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage exercises in own workouts"
  on public.workout_exercises for all
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy "Users manage own logs"
  on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage exercises in own logs"
  on public.workout_log_exercises for all
  using (exists (select 1 from public.workout_logs l where l.id = workout_log_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_logs l where l.id = workout_log_id and l.user_id = auth.uid()));
create policy "Users manage sets in own logs"
  on public.workout_sets for all
  using (exists (
    select 1 from public.workout_log_exercises le
    join public.workout_logs l on l.id = le.workout_log_id
    where le.id = workout_log_exercise_id and l.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_log_exercises le
    join public.workout_logs l on l.id = le.workout_log_id
    where le.id = workout_log_exercise_id and l.user_id = auth.uid()
  ));
