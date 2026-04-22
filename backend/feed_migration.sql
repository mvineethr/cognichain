-- ============================================================
--  CogniChain — Social Feed Migration
--  Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- ── Posts ────────────────────────────────────────────────────
create table public.posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.profiles(id) on delete cascade,
  type          text not null check (type in ('achievement', 'solve', 'status', 'help')),
  content       text not null,
  problem_id    uuid references public.problems(id) on delete set null,
  metadata      jsonb default '{}'::jsonb,
  like_count    integer default 0,
  comment_count integer default 0,
  created_at    timestamptz default now()
);

-- ── Post Likes ────────────────────────────────────────────────
create table public.post_likes (
  post_id    uuid references public.posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- ── Post Comments ─────────────────────────────────────────────
create table public.post_comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid references public.posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index idx_posts_user         on public.posts(user_id);
create index idx_posts_created      on public.posts(created_at desc);
create index idx_post_likes_post    on public.post_likes(post_id);
create index idx_post_comments_post on public.post_comments(post_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.posts         enable row level security;
alter table public.post_likes    enable row level security;
alter table public.post_comments enable row level security;

create policy "posts_read_all"      on public.posts for select using (true);
create policy "posts_insert_auth"   on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_delete_own"    on public.posts for delete using (auth.uid() = user_id);

create policy "post_likes_read_all"   on public.post_likes for select using (true);
create policy "post_likes_insert"     on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete_own" on public.post_likes for delete using (auth.uid() = user_id);

create policy "post_comments_read_all"   on public.post_comments for select using (true);
create policy "post_comments_insert"     on public.post_comments for insert with check (auth.uid() = user_id);
create policy "post_comments_delete_own" on public.post_comments for delete using (auth.uid() = user_id);

-- ── Toggle Like Function ──────────────────────────────────────
create or replace function public.toggle_post_like(p_post_id uuid, p_user_id uuid)
returns jsonb as $$
declare
  v_liked boolean;
  v_count integer;
begin
  if exists (
    select 1 from public.post_likes
    where post_id = p_post_id and user_id = p_user_id
  ) then
    delete from public.post_likes where post_id = p_post_id and user_id = p_user_id;
    update public.posts set like_count = greatest(like_count - 1, 0) where id = p_post_id;
    v_liked := false;
  else
    insert into public.post_likes (post_id, user_id) values (p_post_id, p_user_id);
    update public.posts set like_count = like_count + 1 where id = p_post_id;
    v_liked := true;
  end if;
  select like_count into v_count from public.posts where id = p_post_id;
  return jsonb_build_object('liked', v_liked, 'count', v_count);
end;
$$ language plpgsql security definer;

-- ── Increment Comment Count ───────────────────────────────────
create or replace function public.increment_comment_count(p_post_id uuid)
returns void as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = p_post_id;
end;
$$ language plpgsql security definer;
