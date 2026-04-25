# Nautz (formerly CogniChain) — Session Handoff

## Project Name
Working name is **Nautz** — do not rename files/repos yet, rename closer to launch.
Current repo/deploy still uses "cognichain" everywhere.

## What This App Is
A problem-solving platform where users solve math, science, logic, puzzles, aptitude
and mystery problems guided by a Socratic AI. Users earn points, maintain streaks,
and post to a social feed. Long-term plan: collect reasoning data from user sessions
to fine-tune an open-source reasoning model (ethically, with ToS disclosure).

## Founder Context
- IT professional (production support + builds monitoring), not a student
- Built this solo in spare time
- Soft-launched to friends, now posting to communities for cold users
- Interests: F1, thinking games, coffee making — helps write authentic posts

## Monetization Plan
- Free tier: ads + basic AI guide
- Guest mode: 5 free solves + 3 guide messages per problem (no signup)
- Pro tier ($5-8/mo): no ads + enhanced AI guide — hold until 500-1000 users
- Background: collect reasoning data (ai_sessions + solutions + posts/comments) for model training
- Goal: traction + dataset → seed investors/collaborators

## Stack
- Backend:  FastAPI + Python → Railway (cognichain-production.up.railway.app)
- Database: Supabase (Postgres + Auth + RLS)
- Frontend: React + Vite → Vercel (cognichain-h51n.vercel.app)
- AI Guide: Anthropic Claude API (Socratic-only system prompt)
- Repo:     github.com/mvineethr/cognichain (branch: main)

## Design System (applied)
- Fonts: Syne (headings), Space Grotesk (body), Space Mono (numbers/mono)
- Accent: #6ee7a8 (pastel mint) — CSS var: --accent
- Background: #080c14 navy dark
- Layout: sidebar nav (220px), collapses to icons at 900px, icon-only at <768px
- CSS vars for difficulty: --diff-novice/apprentice/expert/master/legend

## Key Files
- backend/main.py                — FastAPI app, CORS uses FRONTEND_URL env var
- backend/routers/problems.py   — daily auto-assign on /problems/daily-set (4 problems)
- backend/routers/feed.py       — explicit profile lookup (no PostgREST join)
- backend/routers/solutions.py  — auto-posts to feed; guest-check endpoint (no DB write)
- backend/routers/guide.py      — Claude AI guide; guest endpoint (no ai_sessions write)
- backend/categories_seed.sql   — 48 problems across 6 categories (already run in Supabase)
- backend/schema.sql            — full DB schema + trigger + RLS (already run in Supabase)
- frontend/src/index.css        — full design system tokens + mobile solve layout + guest styles
- frontend/src/lib/guest.js     — guest mode localStorage helpers (limits, solve/guide tracking)
- frontend/src/context/AuthContext.jsx — isGuest flag, startGuest/endGuest helpers
- frontend/src/components/Layout.jsx     — sidebar nav; guest card + locked nav for guests
- frontend/src/components/PointsBadge.jsx
- frontend/src/components/PostCard.jsx   — shows peer_review reasoning block in feed
- frontend/src/components/GuideChat.jsx  — per-problem 3-msg limit for guests
- frontend/src/components/AdBanner.jsx   — Google AdSense (publisher ID configured)
- frontend/src/components/OnboardingModal.jsx — 3-step first-time modal (localStorage-gated)
- frontend/src/components/FeedbackButton.jsx  — floating feedback FAB (mailto-based)
- frontend/src/pages/Feed.jsx            — ad slots every 5 posts; members-only for guests
- frontend/src/pages/Daily.jsx           — 1 featured + 3 brain gym; guest uses localStorage solves
- frontend/src/pages/Problems.jsx        — category card grid → drill-down; guest uses localStorage
- frontend/src/pages/Solve.jsx           — timer, tabs, guide hint, wrong popup, share buttons, guest gate
- frontend/src/pages/Profile.jsx         — members-only for guests
- frontend/src/pages/Leaderboard.jsx     — members-only for guests
- frontend/src/pages/ToS.jsx             — Terms of Service (public route)
- frontend/src/pages/Privacy.jsx         — Privacy Policy (public route)
- frontend/src/lib/api.js                — all API calls; guestCheckSolution + askGuideGuest added
- launch-posts.html                      — copy-paste launch posts (BetaList/IH/Reddit/HN/Peerlist)

## Environment Variables
### Railway (backend)
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
- ANTHROPIC_API_KEY
- FRONTEND_URL=https://cognichain-h51n.vercel.app

### Vercel (frontend)
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- VITE_API_URL=https://cognichain-production.up.railway.app

## AdSense Config
- Publisher ID: ca-pub-1056648710785121
- Ad unit slot:  8932186038
- Configured in: frontend/index.html + AdBanner.jsx + Feed.jsx
- Status: waiting on Google approval (site needs traffic first)

## Guest Mode (live)
- Entry: "Try without signing in" button on Login page
- Limits enforced client-side via localStorage (lib/guest.js):
  - GUEST_MAX_SOLVES = 5 (total across all problems)
  - GUEST_MAX_GUIDE_PER_PROB = 3 (per problem, resets on new problem)
- Backend backstop: /solutions/guest-check verifies without writing to DB
- Backend backstop: /guide/guest caps history at 8 messages server-side
- Guests see: Daily, Problems, Solve (with grey points + solve counter banner)
- Guests blocked from: Feed, Leaderboard, Profile (redirect to /daily)
- Sidebar: collapses to icon-only with locked 🔒 icons for Feed/Leaderboard
- Signup gate modal appears after 5th solve or when guide limit hit
- To reset guest state for testing (DevTools console):
  ```js
  localStorage.removeItem('cognichain_guest')
  localStorage.removeItem('cognichain_guest_solves')
  localStorage.removeItem('cognichain_guest_guide')
  location.reload()
  ```

## What's Working
- Auth (Supabase email/password, profile auto-created via trigger)
- Signup agreement checkbox (ToS + Privacy Policy, mandatory)
- ToS (/tos) and Privacy Policy (/privacy) — public routes, no auth required
- Guest mode — 5 free solves, 3 guide messages/problem, no signup needed
- Problems tab: category card grid + difficulty drill-down (48 problems)
- Daily tab: auto-assigns 1 featured challenge + 3 brain gym problems daily
  - All 4 marked daily_date=today → excluded from Problems tab
  - Rotates by oldest-used-first across all 48 problems
- Solve page:
  - Live timer (drift-proof via visibilitychange sync)
  - Mobile tab layout: Problem tab / Guide tab
  - Guide hint: after 90s nudges user toward guide
  - Wrong answer popup: slides in, auto-dismisses after 3.5s
  - Share-after-solve: Twitter / Reddit / WhatsApp / Copy buttons
  - Guest: greyed points, solve counter, signup gate modal
  - Nav: goBackOrFallback() — safe back navigation
- AI Guide: Socratic method, saves to ai_sessions; guest variant skips DB
- Social feed: posts, likes, comments; peer_review answers with reasoning block
- Leaderboard: daily/weekly/alltime/by-category
- Profile: points, streak, rank, badges, recent solutions
- Onboarding modal: 3-step first-time flow (localStorage-gated, skipped for guests)
- Feedback FAB: floating button → mailto (hidden on /solve)
- OG meta tags: Twitter card + og:image configured in index.html
- AdSense: infrastructure wired up (ad every 5 posts in feed)
- Railway deploy (Docker, sh -c PORT expansion)
- Vercel deploy (SPA rewrites in vercel.json)
- launch-posts.html: copy-paste posts for BetaList, Indie Hackers, Reddit, HN, Peerlist

## Reasoning Data — Already Being Collected
Three data sources are live and collecting:
1. `ai_sessions` table — full guide chat history per user per problem
2. `solutions` table — answer content, correctness, time_taken_secs
3. `posts` + comments — peer_review answers in metadata.answer_content,
   community comments = quality feedback on reasoning

Training triplet: problem → user_answer (ai_sessions/solutions) → feedback (comments)
Export pipeline (Supabase → JSONL) not built yet — do this once real users arrive.

## Known Issues / Pending
- AdSense: needs Google approval + real traffic before ads show
- No paywall / Pro tier yet (intentional — wait for 500-1000 users)
- Reasoning data export pipeline not built yet (Supabase → JSONL)
- Rename to Nautz at launch (check nautz.ai and nautz.app domains)
- OG image missing: need 1200×630 PNG → drop in frontend/public/og-image.png
- Plausible analytics deferred: script not added yet, but all event hooks
  (window.plausible?.) are already wired in Solve/Onboarding/Feedback
- UI design needs more polish (acknowledged by founder — post-traction priority)
- Supabase fix needed if signup fails: run this SQL in Supabase SQL editor:
  ```sql
  -- Recreate trigger (if signup gives "Database error saving new user")
  create or replace function public.handle_new_user()
  returns trigger as $$
  begin
    insert into public.profiles (id, username)
    values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
    on conflict (id) do nothing;
    return new;
  end;
  $$ language plpgsql security definer;
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

  -- Drop unique constraint on daily_date (multiple problems share same date now)
  alter table public.problems drop constraint if exists problems_daily_date_key;
  create index if not exists idx_problems_daily_date on public.problems(daily_date);
  ```

## Next Steps (in order)
1.  ✅ Test full solve flow end-to-end
2.  ✅ Test Daily tab
3.  ✅ ToS + Privacy Policy + signup agreement
4.  ✅ Google AdSense integration
5.  ✅ Mobile solve page (tab layout)
6.  ✅ Guide hint nudge (90s)
7.  ✅ Wrong answer popup
8.  ✅ Peer review answers in feed (with reasoning block)
9.  ✅ Onboarding modal + share-after-solve + feedback widget + OG tags
10. ✅ Guest mode (no-signin): 5 solves, 3 guide msgs/problem, signup gate
11. ✅ Bug fixes: Guide panel desktop hidden bug, mobile sidebar collapse
12. → Community launch in progress (launch-posts.html has all drafts):
    - BetaList submitted (takes 2-4 weeks to go live)
    - Indie Hackers post (Day 2)
    - r/SideProject post (Day 3)
    - Show HN (Day 4, post 9-10am ET weekday)
    - Peerlist profile + feed post (any day)
13. Generate OG image (1200×630 PNG) → frontend/public/og-image.png
14. Add Plausible analytics — sign up plausible.io, paste 1 script tag in index.html
    (all window.plausible?.() hooks already in place, will auto-activate)
15. Build reasoning data export pipeline (Supabase → JSONL) — after real users arrive
16. Domain purchase + rename to Nautz (at launch)
17. Pro tier paywall (Stripe) — after 500-1000 users

## Launch Post Strategy (current)
Posts should sound like a real person, not a product announcement.
Key framing: IT professional, built in spare time, UI not perfect yet, honest about limitations.
Authentic > polished. "Tell me what's broken" gets more responses than "excited to announce".
- Don't pitch to investors yet — need 50-100 active users and retention data first
- Reddit safe subreddits: r/SideProject (promotional OK), r/InternetIsBeautiful,
  r/learnmath (post a problem as content, link in comments)
- Product Hunt: save for when 20-30 people are ready to upvote on launch day

## Reasoning Model Vision
- Collect: ai_sessions (chat history) + solutions (answers, time) + peer_review comments
- Format: problem → chain-of-thought → answer → community feedback (JSONL)
- Augment: Claude generates ideal COT traces for all 48 problems (~$5)
- Fine-tune: Llama/Mistral/Qwen on collected data (~$50-200 on Together AI)
- Legal: ToS disclosure done ✅ — users consent on signup
- Business: users earn tokens for contributing quality data (Phase 3)

## Branding
- Final name: **Nautz** (locked in, rename at launch)
- Tagline ideas: "Untangle your thinking" / "Think. Solve. Earn."
- Check nautz.ai and nautz.app domains (avoid .com — likely parked/expensive)
- Logo concept: knot being untied / spark of insight
