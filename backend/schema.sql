-- ============================================================
--  CogniChain — Supabase Schema
--  Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  reputation    integer default 0,
  points        integer default 0,
  streak        integer default 0,
  longest_streak integer default 0,
  last_solved_at date,
  rank_title    text default 'Novice',  -- Novice > Apprentice > Expert > Master > Legend
  created_at    timestamptz default now()
);

-- ── CATEGORIES ───────────────────────────────────────────────
create table public.categories (
  id    serial primary key,
  name  text unique not null,  -- Math, Logic, Science, Social, Hypothetical, Mystery
  icon  text
);

insert into public.categories (name, icon) values
  ('Math',         '🔢'),
  ('Logic',        '🧩'),
  ('Science',      '🔬'),
  ('Social',       '🤝'),
  ('Hypothetical', '💭'),
  ('Mystery',      '🔍');

-- ── PROBLEMS ─────────────────────────────────────────────────
create table public.problems (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  body            text not null,
  category_id     integer references public.categories(id),
  difficulty      text not null check (difficulty in ('novice','apprentice','expert','master','unsolved')),
  answer_type     text not null check (answer_type in ('exact','numeric','peer_review')),
  correct_answer  text,          -- null for peer_review types
  token_reward    integer default 10,
  is_daily        boolean default false,
  daily_date      date unique,   -- set when problem is the daily challenge
  is_active       boolean default true,
  solve_count     integer default 0,
  created_at      timestamptz default now()
);

-- ── SOLUTIONS ────────────────────────────────────────────────
create table public.solutions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade,
  problem_id      uuid references public.problems(id) on delete cascade,
  content         text not null,
  is_correct      boolean default false,
  points_awarded  integer default 0,
  time_taken_secs integer,       -- seconds from problem open to submission
  attempt_number  integer default 1,
  created_at      timestamptz default now(),
  unique(user_id, problem_id)    -- one solution per user per problem
);

-- ── AI SESSIONS ──────────────────────────────────────────────
create table public.ai_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  problem_id  uuid references public.problems(id) on delete cascade,
  messages    jsonb default '[]'::jsonb,  -- [{role, content, timestamp}]
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, problem_id)
);

-- ── POINTS LEDGER ────────────────────────────────────────────
create table public.points_ledger (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  amount      integer not null,  -- positive = earn, negative = spend
  reason      text not null,     -- 'daily_solve', 'streak_bonus', 'problem_solve', etc.
  problem_id  uuid references public.problems(id),
  created_at  timestamptz default now()
);

-- ── BADGES ───────────────────────────────────────────────────
create table public.badges (
  id          serial primary key,
  key         text unique not null,   -- 'first_solve', 'streak_7', 'top_10_daily', etc.
  name        text not null,
  description text,
  icon        text
);

insert into public.badges (key, name, description, icon) values
  ('first_solve',    'First Blood',      'Solved your first problem',           '🩸'),
  ('streak_3',       'On a Roll',        '3-day solving streak',                '🔥'),
  ('streak_7',       'Week Warrior',     '7-day solving streak',                '⚡'),
  ('streak_30',      'Unstoppable',      '30-day solving streak',               '💎'),
  ('daily_top1',     'Daily Champion',   'Ranked #1 on a daily leaderboard',    '🏆'),
  ('daily_top10',    'Daily Elite',      'Ranked top 10 on a daily leaderboard','🥇'),
  ('solver_10',      'Getting Started',  'Solved 10 problems',                  '🌱'),
  ('solver_50',      'Problem Crusher',  'Solved 50 problems',                  '💪'),
  ('solver_100',     'Century',          'Solved 100 problems',                 '🎯'),
  ('cat_math',       'Math Whiz',        'Solved 10 Math problems',             '🔢'),
  ('cat_logic',      'Logic Lord',       'Solved 10 Logic problems',            '🧩'),
  ('cat_science',    'Science Nerd',     'Solved 10 Science problems',          '🔬');

-- ── USER BADGES ──────────────────────────────────────────────
create table public.user_badges (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  badge_id    integer references public.badges(id),
  awarded_at  timestamptz default now(),
  unique(user_id, badge_id)
);

-- ── DAILY LEADERBOARD CACHE ──────────────────────────────────
-- Materialized cache so leaderboard queries are fast
create table public.daily_leaderboard (
  id           uuid primary key default uuid_generate_v4(),
  date         date not null,
  user_id      uuid references public.profiles(id) on delete cascade,
  username     text not null,
  avatar_url   text,
  points       integer default 0,
  time_secs    integer,           -- how fast they solved it
  rank         integer,
  updated_at   timestamptz default now(),
  unique(date, user_id)
);

-- ── INDEXES ──────────────────────────────────────────────────
create index idx_problems_daily      on public.problems(is_daily, daily_date);
create index idx_problems_category   on public.problems(category_id, difficulty);
create index idx_solutions_user      on public.solutions(user_id);
create index idx_solutions_problem   on public.solutions(problem_id);
create index idx_points_user         on public.points_ledger(user_id);
create index idx_daily_lb_date       on public.daily_leaderboard(date, rank);
create index idx_ai_sessions_user    on public.ai_sessions(user_id, problem_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.solutions         enable row level security;
alter table public.ai_sessions       enable row level security;
alter table public.points_ledger     enable row level security;
alter table public.user_badges       enable row level security;
alter table public.daily_leaderboard enable row level security;

-- Profiles: users can read all, only update their own
create policy "profiles_read_all"
  on public.profiles for select using (true);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- Solutions: users can read all verified, only insert/update their own
create policy "solutions_read_all"
  on public.solutions for select using (true);

create policy "solutions_insert_own"
  on public.solutions for insert with check (auth.uid() = user_id);

-- AI Sessions: users can only access their own
create policy "ai_sessions_own"
  on public.ai_sessions for all using (auth.uid() = user_id);

-- Points ledger: users can only read their own
create policy "points_read_own"
  on public.points_ledger for select using (auth.uid() = user_id);

-- User badges: readable by all
create policy "user_badges_read_all"
  on public.user_badges for select using (true);

-- Daily leaderboard: readable by all
create policy "daily_lb_read_all"
  on public.daily_leaderboard for select using (true);

-- Problems and categories are public read (no RLS needed, they're public data)
-- Mutations handled server-side only via service role key

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── STREAK UPDATE FUNCTION ────────────────────────────────────
-- Call this after a correct solution is submitted
create or replace function public.update_streak(p_user_id uuid)
returns void as $$
declare
  v_last_solved date;
  v_streak      integer;
  v_longest     integer;
  v_today       date := current_date;
begin
  select last_solved_at, streak, longest_streak
  into v_last_solved, v_streak, v_longest
  from public.profiles where id = p_user_id;

  if v_last_solved = v_today then
    -- already solved today, no change
    return;
  elsif v_last_solved = v_today - interval '1 day' then
    -- consecutive day, increment
    v_streak := v_streak + 1;
  else
    -- streak broken
    v_streak := 1;
  end if;

  v_longest := greatest(v_longest, v_streak);

  update public.profiles set
    streak         = v_streak,
    longest_streak = v_longest,
    last_solved_at = v_today
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ── RANK TITLE UPDATE ────────────────────────────────────────
create or replace function public.update_rank_title(p_user_id uuid)
returns void as $$
declare
  v_rep integer;
begin
  select reputation into v_rep from public.profiles where id = p_user_id;

  update public.profiles set rank_title =
    case
      when v_rep >= 5000 then 'Legend'
      when v_rep >= 2000 then 'Master'
      when v_rep >= 500  then 'Expert'
      when v_rep >= 100  then 'Apprentice'
      else 'Novice'
    end
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ── SEED: SAMPLE PROBLEMS ────────────────────────────────────
insert into public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward, is_daily, daily_date) values

-- Daily problem (today)
(
  'The Missing Dollar',
  'Three friends check into a hotel room that costs $30. They each pay $10. The hotel manager realizes the room only costs $25 and gives $5 to the bellboy to return. The bellboy keeps $2 and gives $1 back to each friend. Now each friend paid $9 (total $27) and the bellboy has $2. That is $29. Where is the missing dollar?',
  2, 'novice', 'peer_review', null, 15, true, current_date
),

-- Math problems
(
  'The Handshake Problem',
  'At a party, every person shakes hands with every other person exactly once. If there were 45 handshakes total, how many people were at the party?',
  1, 'novice', 'numeric', '10', 10, false, null
),
(
  'The Chessboard Rice',
  'A king offers to pay a servant by placing 1 grain of rice on the first square of a chessboard, 2 on the second, 4 on the third, doubling each square. There are 64 squares. Approximately how many grains are on the final square? Express as a power of 2.',
  1, 'apprentice', 'exact', '2^63', 20, false, null
),
(
  'Prime Spiral',
  'What is the sum of all prime numbers less than 20?',
  1, 'novice', 'numeric', '77', 10, false, null
),

-- Logic problems
(
  'The Two Doors',
  'You are in a room with two doors. One leads to freedom, one to a lion. Two guards stand by the doors. One always tells the truth, one always lies. You do not know which is which. You can ask ONE guard ONE question. What do you ask to guarantee finding the door to freedom?',
  2, 'apprentice', 'peer_review', null, 25, false, null
),
(
  'The Burning Rope',
  'You have two ropes. Each takes exactly 1 hour to burn, but they burn unevenly (not at a constant rate). Using only these ropes and a lighter, how do you measure exactly 45 minutes?',
  2, 'apprentice', 'peer_review', null, 25, false, null
),
(
  'Liars and Truth-Tellers',
  'In a village, every person is either a liar (always lies) or a truth-teller (always tells truth). A stranger meets three villagers: A says "We are all liars." B says "Exactly one of us is a truth-teller." What is C?',
  2, 'expert', 'peer_review', null, 40, false, null
),

-- Science problems
(
  'Falling Feather',
  'A feather and a hammer are dropped from the same height on the Moon at the same time. Which hits the ground first, and why? What does this tell us about gravity?',
  3, 'novice', 'peer_review', null, 15, false, null
),
(
  'The Mpemba Effect',
  'Under certain conditions, hot water can freeze faster than cold water. This is called the Mpemba Effect. Can you propose at least two mechanisms that might explain why this happens?',
  3, 'expert', 'peer_review', null, 45, false, null
),

-- Hypothetical problems
(
  'The Trolley Dilemma Variant',
  'A runaway trolley will kill 5 people unless you pull a lever to divert it, killing 1 person. But this time, the 1 person is a doctor who will save 10 lives next week. Do you pull the lever? Justify your reasoning fully.',
  4, 'apprentice', 'peer_review', null, 20, false, null
),
(
  'One Law',
  'You can add one law to your country that everyone must follow, but it cannot remove any existing law. What law do you add and what is your full reasoning for why it would produce the most good?',
  4, 'apprentice', 'peer_review', null, 20, false, null
),

-- Mystery
(
  'The Cipher Message',
  'Decode this message: WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. Hint: Julius Caesar used something similar.',
  5, 'novice', 'exact', 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 15, false, null
);
