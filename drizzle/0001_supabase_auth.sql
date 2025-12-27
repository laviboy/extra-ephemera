-- Integrate Supabase Auth with public.users and fix schema mismatch
-- 1) Drop password_hash (managed by Supabase Auth) and set sensible defaults
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'traveler';

-- 2) Function to mirror auth.users rows into public.users
create or replace function public.handle_auth_user_created()
returns trigger
security definer set search_path = public
language plpgsql as $$
begin
  insert into public.users (id, email, role, created_at, updated_at)
  values (new.id, new.email, 'traveler', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3) Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

-- 4) Keep email in sync when a user updates their email in Supabase
create or replace function public.handle_auth_user_updated()
returns trigger
security definer set search_path = public
language plpgsql as $$
begin
  update public.users set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_auth_user_updated();
