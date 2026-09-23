-- Optional account profile. Preferences and saved titles only.
-- Never store source text, adapted notes, or page content.

create table if not exists public.linaw_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  preferences jsonb not null default '{}'::jsonb,
  saved_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.linaw_profiles enable row level security;

create policy linaw_profiles_select
  on public.linaw_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy linaw_profiles_insert
  on public.linaw_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy linaw_profiles_update
  on public.linaw_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy linaw_profiles_delete
  on public.linaw_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);
