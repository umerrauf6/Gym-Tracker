-- Create an application profile whenever Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep timestamps trustworthy without relying on every client to update them.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute procedure public.set_updated_at();

-- UI gating is not a security boundary. Enforce the free plan's two-routine
-- limit transactionally in Postgres, including concurrent insert attempts.
create or replace function public.enforce_free_routine_limit()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  current_tier public.subscription_tier;
  routine_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  select subscription_tier into current_tier
  from public.profiles
  where id = new.user_id;

  if current_tier = 'free' then
    select count(*) into routine_count
    from public.workouts
    where user_id = new.user_id;

    if routine_count >= 2 then
      raise exception 'Free accounts can save at most two routines'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger workouts_enforce_free_limit
  before insert on public.workouts
  for each row execute procedure public.enforce_free_routine_limit();

-- Existing auth users created before this migration also receive profiles.
insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;
