# Nautz (formerly CogniChain) — Session Handoff

## Project Name
Working name is **Nautz** — do not rename files/repos yet, rename closer to launch.
Current repo/deploy still uses "cognichain" everywhere.

## What This App Is
A problem-solving platform where users solve math, science, logic, puzzles, aptitude
and mystery problems guided by a Socratic AI. Users earn points, maintain streaks,
and post to a social feed. Long-term plan: collect reasoning data from user sessions
to fine-tune an open-source reasoning model (ethically, with ToS disclosure).

## Monetization Plan
- Free tier: ads + basic AI guide
- Pro tier ($5-8/mo): no ads + enhanced AI guide (more hints, deeper explanations)
- Background: collect reasoning data (ai_sessions + solutions tables) for model training
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
- Layout: sidebar nav (220px), collapses to icons at 900px
- CSS vars for difficulty: --diff-novice/apprentice/expert/master/legend

## Key Files
- backend/main.py              — FastAPI app, CORS uses FRONTEND_URL env var
- backend/routers/problems.py  — daily auto-assign on /problems/daily
- backend/routers/feed.py      — explicit profile lookup (no PostgREST join)
- backend/routers/solutions.py — auto-posts to feed on correct solve
- backend/categories_seed.sql  — 48 problems across 6 categories (RUN IN SUPABASE)
- frontend/src/index.css       — full design system tokens
- frontend/src/components/Layout.jsx    — sidebar nav, full-width for /solve/:id
- frontend/src/components/PointsBadge.jsx
- frontend/src/components/PostCard.jsx  — TYPE_CONFIG uses CSS vars
- frontend/src/components/GuideChat.jsx
- frontend/src/pages/Feed.jsx
- frontend/src/pages/Daily.jsx
- frontend/src/pages/Problems.jsx — category card grid → drill-down by difficulty
- frontend/src/pages/Solve.jsx   — timer, full-width, result display
- frontend/src/pages/Profile.jsx
- frontend/src/pages/Leaderboard.jsx
- frontend/src/lib/api.js        — all API calls centralized

## Environment Variables
### Railway (backend)
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
- ANTHROPIC_API_KEY
- FRONTEND_URL=https://cognichain-h51n.vercel.app

### Vercel (frontend)
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- VITE_API_URL=https://cognichain-production.up.railway.app

## What's Working
- Auth (Supabase email/password, profile auto-created via trigger)
- Problems feed with category cards + difficulty drill-down
- Daily problem auto-assigns itself if none set for today
- Solve page: timer, AI guide chat, submit + points award
- Social feed: posts, likes, comments (feed 500 fixed)
- Leaderboard: daily/weekly/alltime/by-category
- Profile: points, streak, rank, badges, recent solutions
- Railway deploy (Docker, sh -c PORT expansion)
- Vercel deploy (SPA rewrites in vercel.json)

## Known Issues / Pending
- categories_seed.sql must be run in Supabase if not done yet (48 problems)
- No ToS / Privacy Policy pages yet (needed before real users)
- No ad integration yet
- No paywall / Pro tier yet
- Feed auto-posts need end-to-end testing (solve → post appears in feed)
- Daily tab (/daily) needs testing with real daily-set data
- Reasoning data pipeline not built yet (future phase)

## Next Steps (in order)
1. Test full solve flow end-to-end (solve problem → points awarded → post in feed)
2. Test Daily tab
3. Build ToS + Privacy Policy pages
4. Add Google AdSense integration (free tier)
5. Design + build Pro tier paywall (Stripe)
6. Start reasoning data export pipeline (Supabase → JSONL)
7. Rename everything to Nautz closer to launch

## Reasoning Model Vision
- Collect: ai_sessions (chat history) + solutions (answers, correctness, time)
- Format: problem → chain-of-thought → answer (JSONL)
- Augment: Claude generates ideal COT traces for all 48 problems (~$5)
- Fine-tune: Llama/Mistral/Qwen on collected data (~$50-200 on Together AI)
- Legal: needs ToS disclosure before collecting data for training
- Business: users earn tokens for contributing quality data (Phase 3)

## Branding
- Final name: **Nautz** (locked in, rename at launch)
- Tagline ideas: "Untangle your thinking" / "Think. Solve. Earn."
- Check nautz.ai and nautz.app domains (avoid .com — likely parked/expensive)
- Logo concept: knot being untied / spark of insight
