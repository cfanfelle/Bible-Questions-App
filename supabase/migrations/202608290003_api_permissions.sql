-- New tables are intentionally not exposed automatically. Grant only the
-- operations the signed-in desktop client needs; RLS still limits each row.
grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.profile_sync_snapshots to authenticated;
