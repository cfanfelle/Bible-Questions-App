create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  age_group text not null check (age_group in ('13to17', '18plus')),
  friend_code text not null unique default upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;
grant select, update on table public.profiles to authenticated;
create policy "Profiles are readable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, age_group)
  values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'age_group');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_username_available(candidate text) returns boolean
language sql security definer set search_path = '' as $$
  select candidate ~ '^[A-Za-z0-9_]{3,24}$'
    and not exists (select 1 from public.profiles where lower(username) = lower(candidate));
$$;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
