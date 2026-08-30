create table public.reader_sync_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  source_device_id text not null,
  updated_at timestamptz not null default now()
);
alter table public.reader_sync_snapshots enable row level security;
grant select,insert,update on table public.reader_sync_snapshots to authenticated;
create policy "Users read their own reader snapshot" on public.reader_sync_snapshots for select to authenticated using ((select auth.uid())=user_id);
create policy "Users create their own reader snapshot" on public.reader_sync_snapshots for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Users update their own reader snapshot" on public.reader_sync_snapshots for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke delete on public.reader_sync_snapshots from anon,authenticated;
