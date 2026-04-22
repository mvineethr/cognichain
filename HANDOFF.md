# CogniChain — Claude Code Handoff

## What is CogniChain
A platform where humans solve problems (math, logic, science, social, hypothetical)
guided by an AI Socratic assistant, rewarded with points (later crypto tokens).
Think Wordle meets Stack Overflow meets crypto rewards.

## Stack
- Backend:  FastAPI + Python, hosted on Railway
- Database: Supabase (Postgres + Auth + Storage)
- Frontend: React + Vite, hosted on Vercel
- AI Guide: Anthropic Claude API (Socratic-only system prompt)
- No AWS — hard spending caps on Railway (~$150/mo total)

## What's done in this scaffold
### Backend (complete)
- schema.sql         — all tables, RLS, indexes, streak functions, 12 seed problems
- main.py            — FastAPI app with CORS
- database.py        — Supabase client singleton
- models.py          — all Pydantic request/response models
- auth.py            — Supabase JWT verification
- routers/problems.py    — daily problem + problem feed + single problem
- routers/guide.py       — Claude API wired with full Socratic system prompt
- routers/solutions.py   — submit, verify, award points, streaks, badges
- routers/users.py       — profile endpoints (me + public)
- routers/leaderboard.py — daily, weekly, all-time leaderboards

### Frontend (partial)
- package.json
- src/lib/supabase.js    — Supabase client
- src/lib/api.js         — all backend API calls in one place
- src/main.jsx           — React Router setup with auth guard
- src/context/AuthContext.jsx — Supabase auth state

## What Claude Code needs to finish
### Pages (create in src/pages/)
- Login.jsx        — Supabase email/password auth, sign up + sign in
- Feed.jsx         — Daily problem card at top, problem list below, category/difficulty filter
- Solve.jsx        — Problem on left, GuideChat on right, submit solution at bottom
- Profile.jsx      — Points, streak, rank title, badges grid, recent solutions
- Leaderboard.jsx  — Tab switcher: Daily / Weekly / All-time tables

### Components (create in src/components/)
- Layout.jsx       — Nav bar with logo, links, user points badge, sign out
- ProblemCard.jsx  — Card showing title, category icon, difficulty badge, reward points
- GuideChat.jsx    — Chat UI, sends to /guide endpoint, shows message history
- PointsBadge.jsx  — Shows current user points + streak flame icon

### Other files needed
- src/index.css    — Global styles (dark theme: bg #0a0a0a, accent #00cc6a)
- vite.config.js   — Standard Vite React config
- Procfile         — For Railway: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- vercel.json      — For Vercel frontend deploy

## Setup steps before running

### 1. Supabase
- Create a new project at supabase.com
- Go to SQL Editor and run backend/schema.sql
- Copy your Project URL and anon key

### 2. Environment variables
Backend — copy backend/.env.example to backend/.env and fill in:
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  ANTHROPIC_API_KEY=
  FRONTEND_URL=http://localhost:5173

Frontend — copy frontend/.env.example to frontend/.env and fill in:
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_API_URL=http://localhost:8000

### 3. Run backend
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload
  → API running at http://localhost:8000
  → Docs at http://localhost:8000/docs

### 4. Run frontend
  cd frontend
  npm install
  npm run dev
  → App running at http://localhost:5173

## Key design decisions
- Daily problem: one problem per day, same for all users, resets at midnight
- Streaks: solve at least one problem per day to maintain streak
- Points: difficulty × quality, bonus for daily solve (+25), streak milestones
- AI Guide: Claude API with Socratic-only system prompt — NEVER gives the answer
- Leaderboard: Daily resets daily (fair for new users), Weekly resets Monday, All-time is rep score
- Tokens: Phase 1 = points only. Phase 2 = cash redemption. Phase 3 = real on-chain token
- No blockchain yet — that comes after the MVP proves retention

## Prompt to start Claude Code
Paste this when you open claude in the cognichain directory:

"I'm building CogniChain. The backend scaffold is complete (FastAPI + Supabase).
The frontend has routing, auth context, and API lib but needs all pages and components.
Please finish the frontend: Login, Feed, Solve, Profile, Leaderboard pages plus
Layout, ProblemCard, GuideChat, PointsBadge components, index.css (dark theme, green accent #00cc6a),
vite.config.js, and deploy configs for Railway and Vercel. Read the HANDOFF.md for full context."
