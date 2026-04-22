from fastapi import APIRouter, Query
from database import get_service_client
from models import LeaderboardOut
from datetime import date, timedelta
from typing import Optional

router = APIRouter()

# ── GET /leaderboard/category ────────────────────────────────
@router.get("/category", response_model=LeaderboardOut)
def category_leaderboard(
    category_id: int = Query(..., description="Category ID"),
    limit: int       = Query(20, ge=1, le=50),
):
    """Top solvers in a specific category by cumulative points on category problems."""
    svc = get_service_client()

    prob_res = (
        svc.table("problems")
        .select("id")
        .eq("category_id", category_id)
        .execute()
    )
    problem_ids = [p["id"] for p in (prob_res.data or [])]
    if not problem_ids:
        return {"type": "category", "entries": []}

    sols_res = (
        svc.table("solutions")
        .select("user_id, points_awarded")
        .in_("problem_id", problem_ids)
        .eq("is_correct", True)
        .execute()
    )

    totals: dict[str, int] = {}
    for row in (sols_res.data or []):
        uid = row["user_id"]
        totals[uid] = totals.get(uid, 0) + row["points_awarded"]

    sorted_users = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:limit]
    if not sorted_users:
        return {"type": "category", "entries": []}

    user_ids     = [uid for uid, _ in sorted_users]
    profiles_res = (
        svc.table("profiles")
        .select("id, username, avatar_url")
        .in_("id", user_ids)
        .execute()
    )
    profile_map = {p["id"]: p for p in (profiles_res.data or [])}

    entries = [
        {
            "rank":       i + 1,
            "user_id":    uid,
            "username":   profile_map.get(uid, {}).get("username", "Unknown"),
            "avatar_url": profile_map.get(uid, {}).get("avatar_url"),
            "points":     pts,
        }
        for i, (uid, pts) in enumerate(sorted_users)
    ]
    return {"type": "category", "entries": entries}


# ── GET /leaderboard/daily ────────────────────────────────────
@router.get("/daily", response_model=LeaderboardOut)
def daily_leaderboard(limit: int = Query(20, ge=1, le=50)):
    """Today's leaderboard — fastest correct solvers of the daily problem."""
    svc   = get_service_client()
    today = date.today().isoformat()

    res = (
        svc.table("daily_leaderboard")
        .select("*")
        .eq("date", today)
        .order("points", desc=True)
        .order("time_secs", desc=False)   # tie-break: faster wins
        .limit(limit)
        .execute()
    )

    entries = [
        {
            "rank":       i + 1,
            "user_id":    e["user_id"],
            "username":   e["username"],
            "avatar_url": e.get("avatar_url"),
            "points":     e["points"],
            "time_secs":  e.get("time_secs"),
        }
        for i, e in enumerate(res.data or [])
    ]

    return {"type": "daily", "date": today, "entries": entries}

# ── GET /leaderboard/weekly ───────────────────────────────────
@router.get("/weekly", response_model=LeaderboardOut)
def weekly_leaderboard(limit: int = Query(20, ge=1, le=50)):
    """This week's top solvers by cumulative points earned."""
    svc        = get_service_client()
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()

    res = (
        svc.table("points_ledger")
        .select("user_id, amount")
        .gte("created_at", week_start)
        .execute()
    )

    # Aggregate points per user
    totals: dict[str, int] = {}
    for row in (res.data or []):
        uid = row["user_id"]
        totals[uid] = totals.get(uid, 0) + row["amount"]

    sorted_users = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:limit]

    # Fetch usernames
    user_ids = [uid for uid, _ in sorted_users]
    if not user_ids:
        return {"type": "weekly", "entries": []}

    profiles_res = (
        svc.table("profiles")
        .select("id, username, avatar_url")
        .in_("id", user_ids)
        .execute()
    )
    profile_map = {p["id"]: p for p in (profiles_res.data or [])}

    entries = [
        {
            "rank":       i + 1,
            "user_id":    uid,
            "username":   profile_map.get(uid, {}).get("username", "Unknown"),
            "avatar_url": profile_map.get(uid, {}).get("avatar_url"),
            "points":     pts,
        }
        for i, (uid, pts) in enumerate(sorted_users)
    ]

    return {"type": "weekly", "entries": entries}

# ── GET /leaderboard/alltime ──────────────────────────────────
@router.get("/alltime", response_model=LeaderboardOut)
def alltime_leaderboard(limit: int = Query(20, ge=1, le=50)):
    """All-time top solvers by reputation score."""
    svc = get_service_client()

    res = (
        svc.table("profiles")
        .select("id, username, avatar_url, reputation")
        .order("reputation", desc=True)
        .limit(limit)
        .execute()
    )

    entries = [
        {
            "rank":       i + 1,
            "user_id":    p["id"],
            "username":   p["username"],
            "avatar_url": p.get("avatar_url"),
            "points":     p["reputation"],
        }
        for i, p in enumerate(res.data or [])
    ]

    return {"type": "alltime", "entries": entries}
