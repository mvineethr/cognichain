from fastapi import APIRouter, Depends, HTTPException
from database import get_client, get_service_client
from models import ProfileOut
from auth import get_current_user

router = APIRouter()

# ── GET /users/me ─────────────────────────────────────────────
@router.get("/me", response_model=ProfileOut)
def get_my_profile(user: dict = Depends(get_current_user)):
    svc = get_service_client()

    res = svc.table("profiles").select("*").eq("id", user["id"]).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = res.data[0]

    badges_res = (
        svc.table("user_badges")
        .select("awarded_at, badges(key, name, description, icon)")
        .eq("user_id", user["id"])
        .execute()
    )
    badges = [
        {**b["badges"], "awarded_at": b["awarded_at"]}
        for b in (badges_res.data or [])
        if b.get("badges")
    ]

    sols_res = (
        svc.table("solutions")
        .select("is_correct, points_awarded, created_at, problems(title, difficulty)")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    return {**profile, "badges": badges, "recent_solutions": sols_res.data or []}

# ── GET /users/{username} ─────────────────────────────────────
@router.get("/{username}", response_model=ProfileOut)
def get_profile(username: str):
    svc = get_service_client()

    res = svc.table("profiles").select("*").eq("username", username).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    profile = res.data[0]

    badges_res = (
        svc.table("user_badges")
        .select("awarded_at, badges(key, name, description, icon)")
        .eq("user_id", profile["id"])
        .execute()
    )
    badges = [
        {**b["badges"], "awarded_at": b["awarded_at"]}
        for b in (badges_res.data or [])
        if b.get("badges")
    ]

    return {**profile, "badges": badges, "recent_solutions": []}
