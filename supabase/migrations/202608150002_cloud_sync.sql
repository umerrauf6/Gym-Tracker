-- Stable client identifiers let the local-first app reconcile records without
-- treating device-generated IDs as Postgres UUIDs.
alter table public.workouts
  add column if not exists client_id text not null default gen_random_uuid()::text;

alter table public.workout_logs
  add column if not exists client_id text not null default gen_random_uuid()::text;

create unique index if not exists workouts_user_client_id_idx
  on public.workouts(user_id, client_id);

create unique index if not exists workout_logs_user_client_id_idx
  on public.workout_logs(user_id, client_id);

alter table public.profiles
  add column if not exists weight_unit text not null default 'kg'
    check (weight_unit in ('kg', 'lb')),
  add column if not exists rest_seconds integer not null default 90
    check (rest_seconds between 0 and 600),
  add column if not exists notifications_enabled boolean not null default true;

-- The mobile app uses exercise slugs as stable IDs. Postgres retains UUID
-- foreign keys and this seed provides the slug <-> UUID mapping used by sync.
insert into public.exercises (name, slug, primary_muscle, secondary_muscles, equipment)
values
  ('Barbell Bench Press', 'barbell-bench-press', 'Chest', array['Triceps', 'Front delts'], 'Barbell'),
  ('Incline Dumbbell Press', 'incline-dumbbell-press', 'Chest', array['Triceps', 'Front delts'], 'Dumbbell'),
  ('Lat Pulldown', 'lat-pulldown', 'Back', array['Biceps', 'Rear delts'], 'Cable'),
  ('Pull-Up', 'pull-up', 'Back', array['Biceps', 'Core'], 'Bodyweight'),
  ('Back Squat', 'back-squat', 'Legs', array['Glutes', 'Core'], 'Barbell'),
  ('Leg Press', 'leg-press', 'Legs', array['Glutes'], 'Machine'),
  ('Dumbbell Curl', 'dumbbell-curl', 'Arms', array['Forearms'], 'Dumbbell'),
  ('Cable Triceps Pushdown', 'triceps-pushdown', 'Arms', array['Triceps'], 'Cable'),
  ('Hanging Knee Raise', 'hanging-knee-raise', 'Core', array['Hip flexors'], 'Bodyweight'),
  ('Machine Chest Press', 'machine-chest-press', 'Chest', array['Triceps', 'Front delts'], 'Machine'),
  ('Push-Up', 'push-up', 'Chest', array['Triceps', 'Core'], 'Bodyweight'),
  ('Cable Fly', 'cable-fly', 'Chest', array['Front delts'], 'Cable'),
  ('One-Arm Dumbbell Row', 'one-arm-dumbbell-row', 'Back', array['Biceps', 'Rear delts'], 'Dumbbell'),
  ('Machine Row', 'machine-row', 'Back', array['Biceps', 'Rear delts'], 'Machine'),
  ('Dumbbell Lunge', 'dumbbell-lunge', 'Legs', array['Glutes', 'Core'], 'Dumbbell'),
  ('Bodyweight Split Squat', 'split-squat', 'Legs', array['Glutes'], 'Bodyweight'),
  ('Barbell Curl', 'barbell-curl', 'Arms', array['Forearms'], 'Barbell'),
  ('Close-Grip Push-Up', 'close-grip-push-up', 'Arms', array['Chest', 'Core'], 'Bodyweight'),
  ('Cable Crunch', 'cable-crunch', 'Core', array['Obliques'], 'Cable'),
  ('Dumbbell Russian Twist', 'dumbbell-russian-twist', 'Core', array['Obliques'], 'Dumbbell'),
  ('Ab Crunch Machine', 'ab-crunch-machine', 'Core', array['Obliques'], 'Machine')
on conflict (slug) do update set
  name = excluded.name,
  primary_muscle = excluded.primary_muscle,
  secondary_muscles = excluded.secondary_muscles,
  equipment = excluded.equipment;
