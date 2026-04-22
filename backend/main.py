from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import problems, solutions, guide, users, leaderboard, feed

load_dotenv()

app = FastAPI(
    title="CogniChain API",
    description="Humans solve problems. AI guides. Tokens reward.",
    version="0.1.0",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(problems.router,    prefix="/problems",    tags=["Problems"])
app.include_router(solutions.router,   prefix="/solutions",   tags=["Solutions"])
app.include_router(guide.router,       prefix="/guide",       tags=["AI Guide"])
app.include_router(users.router,       prefix="/users",       tags=["Users"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(feed.router,        prefix="/feed",        tags=["Feed"])

@app.get("/health")
def health():
    return {"status": "ok", "app": "CogniChain"}
