from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


# ── Auth ─────────────────────────────────────────────────────
class UserToken(BaseModel):
    access_token: str

# ── Problems ─────────────────────────────────────────────────
class ProblemOut(BaseModel):
    id: str
    title: str
    body: str
    category_id: int
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    difficulty: str
    answer_type: str
    token_reward: int
    is_daily: bool
    daily_date: Optional[str] = None
    solve_count: int

class ProblemListOut(BaseModel):
    items: List[ProblemOut]
    total: int

# ── Solutions ────────────────────────────────────────────────
class SolutionIn(BaseModel):
    problem_id: str
    content: str = Field(..., min_length=1, max_length=5000)
    time_taken_secs: Optional[int] = None

class SolutionOut(BaseModel):
    id: str
    problem_id: str
    is_correct: bool
    points_awarded: int
    message: str              # feedback message shown to user
    streak: Optional[int] = None
    badges_earned: Optional[List[str]] = None

# ── AI Guide ─────────────────────────────────────────────────
class GuideMessage(BaseModel):
    role: str                 # 'user' | 'assistant'
    content: str

class GuideIn(BaseModel):
    problem_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[GuideMessage] = []

class GuideOut(BaseModel):
    reply: str
    session_id: str

# ── Users ────────────────────────────────────────────────────
class ProfileOut(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str]
    reputation: int
    points: int
    streak: int
    longest_streak: int
    rank_title: str
    badges: Optional[List[dict]] = []
    recent_solutions: Optional[List[dict]] = []

# ── Feed / Posts ─────────────────────────────────────────────
class PostIn(BaseModel):
    type: str = Field(..., pattern="^(status|help)$")
    content: str = Field(..., min_length=1, max_length=1000)
    problem_id: Optional[str] = None
    metadata: Optional[dict] = {}

class CommentIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

# ── Leaderboard ──────────────────────────────────────────────
class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    avatar_url: Optional[str]
    points: int
    time_secs: Optional[int] = None

class LeaderboardOut(BaseModel):
    type: str                  # 'daily' | 'weekly' | 'alltime'
    date: Optional[str] = None
    entries: List[LeaderboardEntry]
