drop policy if exists "Profiles are readable by signed-in users" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index friendships_pair_idx on public.friendships
  (least(requester_id,addressee_id),greatest(requester_id,addressee_id));
alter table public.friendships enable row level security;
revoke all on table public.friendships from public, anon, authenticated;

create or replace function public.send_friend_request(friend_code_input text)
returns void language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select id into target_id from public.profiles
  where upper(friend_code)=upper(trim(friend_code_input));
  if target_id is null then raise exception 'Friend code not found.'; end if;
  if target_id=auth.uid() then raise exception 'You cannot add yourself.'; end if;
  insert into public.friendships(requester_id,addressee_id)
  values(auth.uid(),target_id);
exception when unique_violation then
  raise exception 'A friendship or request already exists.';
end; $$;

create or replace function public.respond_friend_request(request_id uuid,accept_request boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if accept_request then
    update public.friendships set status='accepted',updated_at=now()
    where id=request_id and addressee_id=auth.uid() and status='pending';
  else
    delete from public.friendships
    where id=request_id and addressee_id=auth.uid() and status='pending';
  end if;
  if not found then raise exception 'Friend request not found.'; end if;
end; $$;

create or replace function public.remove_friend_connection(connection_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.friendships
  where id=connection_id and (requester_id=auth.uid() or addressee_id=auth.uid());
  if not found then raise exception 'Friendship not found.'; end if;
end; $$;

create or replace function public.list_friend_connections()
returns table(id uuid,user_id uuid,username text,status text,direction text)
language sql stable security definer set search_path = '' as $$
  select f.id,
    case when f.requester_id=auth.uid() then f.addressee_id else f.requester_id end,
    p.username,f.status,
    case when f.status='accepted' then 'friend'
         when f.requester_id=auth.uid() then 'outgoing' else 'incoming' end
  from public.friendships f
  join public.profiles p on p.id=case when f.requester_id=auth.uid() then f.addressee_id else f.requester_id end
  where f.requester_id=auth.uid() or f.addressee_id=auth.uid()
  order by f.updated_at desc;
$$;

revoke all on function public.send_friend_request(text) from public,anon;
revoke all on function public.respond_friend_request(uuid,boolean) from public,anon;
revoke all on function public.remove_friend_connection(uuid) from public,anon;
revoke all on function public.list_friend_connections() from public,anon;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(uuid,boolean) to authenticated;
grant execute on function public.remove_friend_connection(uuid) to authenticated;
grant execute on function public.list_friend_connections() to authenticated;
