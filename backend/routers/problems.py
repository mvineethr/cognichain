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
    """
    Returns today's full daily set: 1 featured challenge + up to 3 brain gym problems.
    All problems in the set are marked daily_date=today so they are excluded
    from the regular Problems tab.
    Auto-assigns the set if it hasn't been picked for today yet.
    """
    svc        = get_service_client()
    categories = _fetch_categories()
    today      = date.today().isoformat()

    # ── Already assigned today? Return cached set ──────────────
    existing = (
        svc.table("problems")
        .select("*")
        .eq("daily_date", today)
        .eq("is_active", True)
        .execute()
    )
    if existing.data:
        featured  = [_attach_category(p, categories) for p in existing.data if p.get("is_daily")]
        spotlight = [_attach_category(p, categories) for p in existing.data if not p.get("is_daily")]
        return {"daily": featured, "spotlight": spotlight, "date": today}

    # ── Auto-assign today's set ────────────────────────────────
    # Clear is_daily flag from yesterday (keep daily_date for history)
    svc.table("problems").update({"is_daily": False}).eq("is_daily", True).execute()

    # Fetch all active problems not already used today
    all_res = (
        svc.table("problems")
        .select("*")
        .eq("is_active", True)
        .execute()
    )
    pool = [p for p in (all_res.data or []) if p.get("daily_date") != today]

    # Sort: never-used first (daily_date IS NULL), then oldest last-used date
    pool.sort(key=lambda p: p.get("daily_date") or "0000-00-00")

    if not pool:
        raise HTTPException(status_code=404, detail="No problems available")

    # Pick featured: must be auto-gradeable (not peer_review)
    featured = next(
        (p for p in pool if p.get("answer_type") != "peer_review"),
        pool[0]  # fallback to any
    )
    used_ids  = {featured["id"]}
    used_cats = {featured["category_id"]}

    # Pick up to 3 brain gym problems from different categories
    brain_gym = []
    for p in pool:
        if p["id"] in used_ids or p["category_id"] in used_cats:
            continue
        used_ids.add(p["id"])
        used_cats.add(p["category_id"])
        brain_gym.append(p)
        if len(brain_gym) >= 3:
            break

    # Persist: mark featured as is_daily=True + daily_date=today
    svc.table("problems").update({"is_daily": True, "daily_date": today}).eq("id", featured["id"]).execute()
    featured["is_daily"]   = True
    featured["daily_date"] = today

    # Persist: mark brain gym with daily_date=today (excluded from Problems tab)
    for p in brain_gym:
        svc.table("problems").update({"daily_date": today}).eq("id", p["id"]).execute()
        p["daily_date"] = today

    return {
        "daily":    [_attach_category(featured, categories)],
        "spotlight": [_attach_category(p, categories) for p in brain_gym],
        "date":     today,
    }


# ── GET /problems/daily ───────────────────────────────────────
@router.get("/daily", response_model=ProblemOut)
def get_daily_problem():
    svc        = get_service_client()
    today      = date.today().isoformat()
    categories = _fetch_categories()

    # Check if today's daily is already set
    res = (
        svc.table("problems")
        .select("*")
        .eq("is_daily", True)
        .eq("daily_date", today)
        .limit(1)
        .execute()
    )
    if res.data:
        return _attach_category(res.data[0], categories)

    # Auto-assign: clear old daily flag only (preserve daily_date for history)
    svc.table("problems").update({"is_daily": False}).eq("is_daily", True).execute()

    # Prefer problems never used as daily (daily_date IS NULL), then oldest used
    all_res = svc.table("problems").select("*").eq("is_active", True).neq("answer_type", "peer_review").execute()
    pool = [p for p in (all_res.data or []) if p.get("daily_date") != today]
    pool.sort(key=lambda p: p.get("daily_date") or "0000-00-00")

    candidate_data = pool[:1]
    class _Wrap:
        def __init__(self, data): self.data = data
    candidate = _Wrap(candidate_data)

    if not candidate.data:
        # Fallback: pick any active problem
        candidate = svc.table("problems").select("*").eq("is_active", True).limit(1).execute()
    if not candidate.data:
        raise HTTPException(status_code=404, detail="No problems available")

    chosen = candidate.data[0]
    svc.table("problems").update({"is_daily": True, "daily_date": today}).eq("id", chosen["id"]).execute()
    chosen["is_daily"]   = True
    chosen["daily_date"] = today
    return _attach_category(chosen, categories)

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
