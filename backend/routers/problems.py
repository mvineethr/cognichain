from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import date
from database import get_client, get_service_client
from models import ProblemOut, ProblemListOut

router = APIRouter()

def _attach_category(problem: dict, categories: dict) -> dict:
    cat = categories.get(problem.get("category_id"))
    if cat:
        problem["category_name"] = cat["name"]
        problem["category_icon"] = cat["icon"]
    return problem

def _fetch_categories() -> dict:
    svc = get_service_client()
    res = svc.table("categories").select("*").execute()
    return {c["id"]: c for c in (res.data or [])}

# ── GET /problems/categories ─────────────────────────────────
@router.get("/categories")
def list_categories():
    svc = get_service_client()
    cats = svc.table("categories").select("*").order("name").execute().data or []
    # attach problem count per category
    for cat in cats:
        count_res = (
            svc.table("problems")
            .select("id", count="exact")
            .eq("category_id", cat["id"])
            .eq("is_active", True)
            .execute()
        )
        cat["problem_count"] = count_res.count or 0
    return cats


# ── GET /problems/daily-set ───────────────────────────────────
@router.get("/daily-set")
def get_daily_set():
    """Returns today's daily + 2 spotlight problems for the Daily tab."""
    client     = get_client()
    categories = _fetch_categories()
    today      = date.today().isoformat()

    daily_res = (
        client.table("problems")
        .select("*")
        .eq("is_daily", True)
        .eq("daily_date", today)
        .eq("is_active", True)
        .execute()
    )
    daily = [_attach_category(p, categories) for p in (daily_res.data or [])]
    used_cats = {p["category_id"] for p in daily}

    spotlight_res = (
        client.table("problems")
        .select("*")
        .eq("is_active", True)
        .order("token_reward", desc=True)
        .limit(30)
        .execute()
    )
    seen_cats = set(used_cats)
    spotlight = []
    for p in (spotlight_res.data or []):
        if p.get("daily_date") == today:
            continue
        if p["category_id"] not in seen_cats and len(spotlight) < 2:
            seen_cats.add(p["category_id"])
            spotlight.append(_attach_category(p, categories))

    return {"daily": daily, "spotlight": spotlight, "date": today}


# ── GET /problems/daily ───────────────────────────────────────
@router.get("/daily", response_model=ProblemOut)
def get_daily_problem():
    svc        = get_service_client()
    today      = date.today().isoformat()
    categories = _fetch_categories()

    res = (
        svc.table("problems")
        .select("*")
        .eq("is_daily", "true")
        .eq("daily_date", today)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="No daily problem set for today")

    return _attach_category(res.data[0], categories)

# ── GET /problems ─────────────────────────────────────────────
@router.get("", response_model=ProblemListOut)
def list_problems(
    category: Optional[int]  = Query(None, description="Filter by category id"),
    difficulty: Optional[str] = Query(None, description="novice|apprentice|expert|master|unsolved"),
    limit: int                = Query(20, ge=1, le=50),
    offset: int               = Query(0, ge=0),
):
    svc        = get_service_client()
    today      = date.today().isoformat()
    categories = _fetch_categories()

    query = (
        svc.table("problems")
        .select("*", count="exact")
        .eq("is_active", "true")
        .or_(f"daily_date.is.null,daily_date.neq.{today}")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if category:
        query = query.eq("category_id", category)
    if difficulty:
        query = query.eq("difficulty", difficulty)

    res = query.execute()
    items = [_attach_category(p, categories) for p in (res.data or [])]
    return {"items": items, "total": res.count or 0}

# ── GET /problems/{id} ────────────────────────────────────────
@router.get("/{problem_id}", response_model=ProblemOut)
def get_problem(problem_id: str):
    svc        = get_service_client()
    categories = _fetch_categories()

    res = (
        svc.table("problems")
        .select("*")
        .eq("id", problem_id)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")

    return _attach_category(res.data[0], categories)
