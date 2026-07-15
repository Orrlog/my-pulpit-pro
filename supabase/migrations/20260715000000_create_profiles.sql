-- Profile foundation for My Pulpit Pro accounts.
-- Run this after Supabase Auth is configured. This does not migrate sermon projects.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('member', 'admin', 'owner'))
);

alter table public.profiles enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_role() to authenticated;

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_profile_updated_at() from public;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_profile_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

create or replace function public.prevent_unauthorized_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and coalesce(public.current_profile_role(), 'member') <> 'owner'
    and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Only an owner can change profile roles.';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_unauthorized_profile_role_change() from public;

drop trigger if exists protect_profile_role_changes on public.profiles;
create trigger protect_profile_role_changes
before update on public.profiles
for each row
execute function public.prevent_unauthorized_profile_role_change();

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Admins and owners can read all profiles" on public.profiles;
create policy "Admins and owners can read all profiles"
on public.profiles
for select
to authenticated
using (public.current_profile_role() in ('admin', 'owner'));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Owners can update profile roles" on public.profiles;
create policy "Owners can update profile roles"
on public.profiles
for update
to authenticated
using (public.current_profile_role() = 'owner')
with check (public.current_profile_role() = 'owner');

grant select on public.profiles to authenticated;
grant update (full_name, role) on public.profiles to authenticated;
