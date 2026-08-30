create table public.profile_sync_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  snapshot jsonb not null,
  source_device_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profile_sync_snapshots enable row level security;
grant select, insert, update on table public.profile_sync_snapshots to authenticated;
create policy "Users can read their own sync snapshot" on public.profile_sync_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own sync snapshot" on public.profile_sync_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own sync snapshot" on public.profile_sync_snapshots for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke delete on public.profile_sync_snapshots from anon, authenticated;
