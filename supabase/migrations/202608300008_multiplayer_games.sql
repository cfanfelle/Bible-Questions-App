create table public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  host_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'lobby' check (status in ('lobby','reading','answering','result','finished')),
  question_seconds integer not null default 20 check (question_seconds between 10 and 120),
  reading_seconds integer not null default 5 check (reading_seconds = 5),
  current_question integer not null default -1,
  phase_started_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.game_questions (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  question_index integer not null,
  book_id text not null, book_name text not null, chapter integer not null,
  verse_start integer not null, verse_end integer not null,
  question_text text not null, choices jsonb not null,
  correct_index integer not null check (correct_index between 0 and 3),
  primary key(room_id,question_index), check (jsonb_array_length(choices)=4)
);
create table public.game_players (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null, score integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key(room_id,user_id)
);
create table public.game_answers (
  room_id uuid not null, question_index integer not null, user_id uuid not null,
  selected_index integer not null check (selected_index between 0 and 3),
  correct boolean not null, points integer not null, answered_at timestamptz not null default now(),
  primary key(room_id,question_index,user_id),
  foreign key(room_id,user_id) references public.game_players(room_id,user_id) on delete cascade
);
alter table public.game_rooms enable row level security;
alter table public.game_questions enable row level security;
alter table public.game_players enable row level security;
alter table public.game_answers enable row level security;
revoke all on table public.game_rooms,public.game_questions,public.game_players,public.game_answers from public,anon,authenticated;

create or replace function public.create_multiplayer_game(question_seconds_input integer,questions_input jsonb)
returns text language plpgsql security definer set search_path='' as $$
declare room uuid; room_code text; item jsonb; index_value integer:=0; username_value text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if question_seconds_input not between 10 and 120 then raise exception 'Question time must be between 10 and 120 seconds.'; end if;
  if jsonb_typeof(questions_input)<>'array' or jsonb_array_length(questions_input) not between 1 and 20 then raise exception 'A game needs 1 to 20 questions.'; end if;
  select username into username_value from public.profiles where id=auth.uid();
  loop room_code:=upper(substr(md5(random()::text),1,6)); exit when not exists(select 1 from public.game_rooms where code=room_code); end loop;
  insert into public.game_rooms(code,host_id,question_seconds) values(room_code,auth.uid(),question_seconds_input) returning id into room;
  insert into public.game_players(room_id,user_id,username) values(room,auth.uid(),username_value);
  for item in select value from jsonb_array_elements(questions_input) loop
    insert into public.game_questions values(room,index_value,item->>'bookId',item->>'bookName',(item->>'chapter')::integer,(item->>'verseStart')::integer,(item->>'verseEnd')::integer,item->>'text',item->'choices',(item->>'correctIndex')::integer);
    index_value:=index_value+1;
  end loop;
  return room_code;
end; $$;

create or replace function public.join_multiplayer_game(code_input text)
returns text language plpgsql security definer set search_path='' as $$
declare room public.game_rooms; username_value text;
begin
  select * into room from public.game_rooms where code=upper(trim(code_input)) and status='lobby';
  if room.id is null then raise exception 'Open game not found.'; end if;
  if (select count(*) from public.game_players where room_id=room.id)>=20 then raise exception 'This game already has 20 players.'; end if;
  select username into username_value from public.profiles where id=auth.uid();
  insert into public.game_players(room_id,user_id,username) values(room.id,auth.uid(),username_value) on conflict do nothing;
  return room.code;
end; $$;

create or replace function public.multiplayer_game_state(code_input text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare room public.game_rooms; question public.game_questions; member boolean; answer public.game_answers;
begin
  select * into room from public.game_rooms where code=upper(trim(code_input));
  member:=exists(select 1 from public.game_players where room_id=room.id and user_id=auth.uid());
  if room.id is null or not member then raise exception 'Game not found.'; end if;
  select * into question from public.game_questions where room_id=room.id and question_index=room.current_question;
  select * into answer from public.game_answers where room_id=room.id and question_index=room.current_question and user_id=auth.uid();
  return jsonb_build_object('code',room.code,'host',room.host_id=auth.uid(),'status',room.status,'questionSeconds',room.question_seconds,'readingSeconds',room.reading_seconds,'currentIndex',room.current_question,'questionCount',(select count(*) from public.game_questions where room_id=room.id),'phaseStartedAt',room.phase_started_at,'question',case when question.room_id is null then null else jsonb_build_object('bookId',question.book_id,'bookName',question.book_name,'chapter',question.chapter,'verseStart',question.verse_start,'verseEnd',question.verse_end,'text',question.question_text,'choices',case when room.status='reading' then null else question.choices end,'correctIndex',case when room.status in ('result','finished') then question.correct_index else null end) end,'answer',case when answer.room_id is null then null else jsonb_build_object('selectedIndex',answer.selected_index,'correct',answer.correct,'points',answer.points) end,'players',(select coalesce(jsonb_agg(jsonb_build_object('userId',p.user_id,'username',p.username,'score',p.score) order by p.score desc,p.joined_at),'[]'::jsonb) from public.game_players p where p.room_id=room.id));
end; $$;

create or replace function public.advance_multiplayer_game(code_input text)
returns void language plpgsql security definer set search_path='' as $$
declare room public.game_rooms; total integer;
begin
  select * into room from public.game_rooms where code=upper(trim(code_input)) for update;
  if room.host_id<>auth.uid() then raise exception 'Only the leader can advance the game.'; end if;
  select count(*) into total from public.game_questions where room_id=room.id;
  if room.status='lobby' then update public.game_rooms set status='reading',current_question=0,phase_started_at=now() where id=room.id;
  elsif room.status='reading' then update public.game_rooms set status='answering',phase_started_at=now() where id=room.id;
  elsif room.status='answering' then update public.game_rooms set status='result',phase_started_at=now() where id=room.id;
  elsif room.status='result' and room.current_question+1<total then update public.game_rooms set status='reading',current_question=current_question+1,phase_started_at=now() where id=room.id;
  elsif room.status='result' then update public.game_rooms set status='finished',phase_started_at=now() where id=room.id;
  end if;
end; $$;

create or replace function public.answer_multiplayer_question(code_input text,selected_index_input integer)
returns integer language plpgsql security definer set search_path='' as $$
declare room public.game_rooms; question public.game_questions; awarded integer:=0; elapsed numeric;
begin
  select * into room from public.game_rooms where code=upper(trim(code_input));
  if room.status<>'answering' then raise exception 'Answers are not open.'; end if;
  if not exists(select 1 from public.game_players where room_id=room.id and user_id=auth.uid()) then raise exception 'Join the game first.'; end if;
  select * into question from public.game_questions where room_id=room.id and question_index=room.current_question;
  elapsed:=extract(epoch from (now()-room.phase_started_at));
  if selected_index_input=question.correct_index then awarded:=floor(300+700*greatest(0,least(1,(room.question_seconds-elapsed)/room.question_seconds))); end if;
  insert into public.game_answers values(room.id,room.current_question,auth.uid(),selected_index_input,selected_index_input=question.correct_index,awarded,now());
  update public.game_players set score=score+awarded where room_id=room.id and user_id=auth.uid();
  return awarded;
exception when unique_violation then raise exception 'You already answered this question.';
end; $$;

revoke all on function public.create_multiplayer_game(integer,jsonb),public.join_multiplayer_game(text),public.multiplayer_game_state(text),public.advance_multiplayer_game(text),public.answer_multiplayer_question(text,integer) from public,anon;
grant execute on function public.create_multiplayer_game(integer,jsonb),public.join_multiplayer_game(text),public.multiplayer_game_state(text),public.advance_multiplayer_game(text),public.answer_multiplayer_question(text,integer) to authenticated;
