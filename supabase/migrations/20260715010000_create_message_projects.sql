-- Database-backed message projects for My Pulpit Pro.

create table if not exists public.message_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_local_id text null,
  title text not null default 'Untitled Message',
  main_scripture text not null default '',
  length text not null default '45',
  length_label text not null default '45 minutes',
  translation text not null default 'KJV',
  status text not null default 'Draft',
  draft jsonb not null default '{}'::jsonb,
  saved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_projects_status_check check (status in ('Draft', 'Saved'))
);

create index if not exists message_projects_user_updated_at_idx
on public.message_projects (user_id, updated_at desc);

create unique index if not exists message_projects_user_legacy_local_id_unique_idx
on public.message_projects (user_id, legacy_local_id)
where legacy_local_id is not null;

create or replace function public.handle_message_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_message_projects_updated_at() from public;

drop trigger if exists set_message_projects_updated_at on public.message_projects;
create trigger set_message_projects_updated_at
before update on public.message_projects
for each row
execute function public.handle_message_projects_updated_at();

alter table public.message_projects enable row level security;

drop policy if exists "Users can read own message projects" on public.message_projects;
create policy "Users can read own message projects"
on public.message_projects
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own message projects" on public.message_projects;
create policy "Users can insert own message projects"
on public.message_projects
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own message projects" on public.message_projects;
create policy "Users can update own message projects"
on public.message_projects
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own message projects" on public.message_projects;
create policy "Users can delete own message projects"
on public.message_projects
for delete
to authenticated
using (user_id = auth.uid());

grant select, insert, update, delete on public.message_projects to authenticated;
