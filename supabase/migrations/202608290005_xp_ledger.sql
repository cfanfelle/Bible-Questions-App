create table public.xp_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  source text not null,
  local_created_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index xp_events_user_created_idx on public.xp_events(user_id,created_at);
alter table public.xp_events enable row level security;
grant select, insert on table public.xp_events to authenticated;

create policy "Users can read their own XP events"
on public.xp_events for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can upload their own XP events"
on public.xp_events for insert to authenticated
with check ((select auth.uid()) = user_id);

revoke update, delete on public.xp_events from anon, authenticated;
