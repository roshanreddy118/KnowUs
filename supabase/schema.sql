create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  relationship_type text not null,
  host_name text not null,
  max_players integer not null default 2 check (max_players between 2 and 8),
  status text not null default 'lobby',
  current_question_index integer not null default 0,
  selected_questions jsonb not null default '[]'::jsonb,
  recent_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists players_room_id_name_unique
  on public.players (room_id, lower(name));

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_index integer not null,
  player_name text not null,
  answer text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists answers_room_id_question_index_player_name_unique
  on public.answers (room_id, question_index, lower(player_name));
