from fastapi import APIRouter, Depends, HTTPException, Request
from database import get_client, get_service_client
from models import SolutionIn, SolutionOut
from auth import get_current_user
from ratelimit import limiter
from datetime import date

router = APIRouter()

STREAK_BONUS = {7: 50, 14: 100, 30: 200}
DAILY_BONUS  = 25

def _verify_exact(submitted: str, correct: str) -> bool:
    return submitted.strip().lower() == correct.strip().lower()

def _verify_numeric(submitted: str, correct: str) -> bool:
    try:
        return abs(float(submitted.strip()) - float(correct.strip())) < 0.01
    except ValueError:
        return False

def _get_one(svc, table: str, **filters):
    q = svc.table(table).select("*")
    for k, v in filters.items():
        q = q.eq(k, v)
    res = q.limit(1).execute()
    return res.data[0] if res.data else None

def _check_and_award_badges(user_id: str, svc) -> list[str]:
    earned  = []
    profile = _get_one(svc, "profiles", id=user_id)
    if not profile:
        return earned

    solve_count = svc.table("solutions").select("id", count="exact").eq("user_id", user_id).eq("is_correct", True).execute().count or 0
    streak      = profile.get("streak", 0)

    existing = {
        b["badge_id"]
        for b in (svc.table("user_badges").select("badge_id").eq("user_id", user_id).execute().data or [])
    }

    badge_map = {b["key"]: b for b in (svc.table("badges").select("*").execute().data or [])}

    def award(key: str):
        b = badge_map.get(key)
        if b and b["id"] not in existing:
            svc.table("user_badges").insert({"user_id": user_id, "badge_id": b["id"]}).execute()
            earned.append(b["name"])

    if solve_count >= 1:   award("first_solve")
    if solve_count >= 10:  award("solver_10")
    if solve_count >= 50:  award("solver_50")
    if solve_count >= 100: award("solver_100")
    if streak >= 3:  award("streak_3")
    if streak >= 7:  award("streak_7")
    if streak >= 30: award("streak_30")

    return earned

# ── POST /solutions ───────────────────────────────────────────
@router.post("", response_model=SolutionOut)
@limiter.limit("30/minute")
def submit_solution(request: Request, payload: SolutionIn, user: dict = Depends(get_current_user)):
    client = get_client()
    svc    = get_service_client()

    prob_res = svc.table("problems").select("*").eq("id", payload.problem_id).limit(1).execute()
    if not prob_res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    prob = prob_res.data[0]

    existing = (
        svc.table("solutions")
        .select("id, is_correct")
        .eq("user_id", user["id"])
        .eq("problem_id", payload.problem_id)
        .execute()
    ).data
    if existing and existing[0].get("is_correct"):
        raise HTTPException(status_code=400, detail="You already solved this problem")

    answer_type = prob["answer_type"]
    is_correct  = False

    if answer_type == "exact":
        is_correct = _verify_exact(payload.content, prob["correct_answer"] or "")
    elif answer_type == "numeric":
        is_correct = _verify_numeric(payload.content, prob["correct_answer"] or "")
    elif answer_type == "peer_review":
        is_correct = True

    points = 0
    if is_correct:
        points = prob["token_reward"]
        if prob["is_daily"]:
            points += DAILY_BONUS

    sol_res = (
        svc.table("solutions")
        .upsert({
            "user_id":         user["id"],
            "problem_id":      payload.problem_id,
            "content":         payload.content,
            "is_correct":      is_correct,
            "points_awarded":  points,
            "time_taken_secs": payload.time_taken_secs,
        }, on_conflict="user_id,problem_id")
        .execute()
    )
    sol_id = sol_res.data[0]["id"] if sol_res.data else "unknown"

    badges_earned = []
    new_streak    = None

    if is_correct:
        profile = _get_one(svc, "profiles", id=user["id"])
        new_points = (profile.get("points", 0) or 0) + points
        new_rep    = (profile.get("reputation", 0) or 0) + points

        svc.table("profiles").update({"points": new_points, "reputation": new_rep}).eq("id", user["id"]).execute()

        svc.table("points_ledger").insert({
            "user_id":    user["id"],
            "amount":     points,
            "reason":     "daily_solve" if prob["is_daily"] else "problem_solve",
            "problem_id": payload.problem_id,
        }).execute()

        svc.rpc("update_streak",     {"p_user_id": user["id"]}).execute()
        svc.rpc("update_rank_title", {"p_user_id": user["id"]}).execute()

        svc.table("problems").update({"solve_count": prob["solve_count"] + 1}).eq("id", payload.problem_id).execute()

        updated = _get_one(svc, "profiles", id=user["id"])
        new_streak = updated.get("streak") if updated else None

        bonus = STREAK_BONUS.get(new_streak, 0)
        if bonus:
            svc.table("profiles").update({"points": new_points + bonus}).eq("id", user["id"]).execute()
            svc.table("points_ledger").insert({
                "user_id": user["id"],
                "amount":  bonus,
                "reason":  f"streak_bonus_{new_streak}",
            }).execute()
            points += bonus

        if prob["is_daily"]:
            profile_full = _get_one(svc, "profiles", id=user["id"])
            svc.table("daily_leaderboard").upsert({
                "date":       date.today().isoformat(),
                "user_id":    user["id"],
                "username":   profile_full.get("username", ""),
                "avatar_url": profile_full.get("avatar_url"),
                "points":     points,
                "time_secs":  payload.time_taken_secs,
            }, on_conflict="date,user_id").execute()

        badges_earned = _check_and_award_badges(user["id"], svc)

        # Auto-post solve to social feed (non-critical)
        try:
            is_peer_review = prob["answer_type"] == "peer_review"

            if is_peer_review:
                # Show the reasoning and invite discussion
                solve_content = f'shared their reasoning on "{prob["title"]}" — what do you think?'
                if new_streak and new_streak > 1:
                    solve_content += f" 🔥 {new_streak}-day streak!"
            else:
                solve_content = f'solved "{prob["title"]}" and earned {points} points!'
                if prob["is_daily"]:
                    solve_content += " ⭐ Daily challenge bonus!"
                if new_streak and new_streak > 1:
                    solve_content += f" 🔥 {new_streak}-day streak!"

            svc.table("posts").insert({
                "user_id":    user["id"],
                "type":       "solve",
                "content":    solve_content,
                "problem_id": payload.problem_id,
                "metadata": {
                    "problem_title":   prob["title"],
                    "difficulty":      prob["difficulty"],
                    "points":          points,
                    "is_daily":        prob["is_daily"],
                    "streak":          new_streak,
                    "is_peer_review":  is_peer_review,
                    # Include answer for peer_review — used for community feedback
                    # and as reasoning training data (problem → answer → comments)
                    "answer_content":  payload.content if is_peer_review else None,
                },
            }).execute()
            for badge_name in badges_earned:
                svc.table("posts").insert({
                    "user_id":  user["id"],
                    "type":     "achievement",
                    "content":  f'earned the "{badge_name}" badge! 🏆',
                    "metadata": {"badge_name": badge_name},
                }).execute()
        except Exception:
            pass

    if is_correct:
        msg = f"Correct! You earned {points} points."
        if prob["is_daily"]:
            msg += f" +{DAILY_BONUS} daily bonus!"
        if new_streak and new_streak > 1:
            msg += f" 🔥 {new_streak}-day streak!"
    elif answer_type == "peer_review":
        msg = "Your answer has been submitted for review."
    else:
        msg = "Not quite — keep thinking! The AI guide can help."

    return {
        "id":             sol_id,
        "problem_id":     payload.problem_id,
        "is_correct":     is_correct,
        "points_awarded": points,
        "message":        msg,
        "streak":         new_streak,
        "badges_earned":  badges_earned,
    }

# ── POST /solutions/guest-check ───────────────────────────────
# Verifies an answer without persisting. Used by guest (no-signin) mode.
# No DB writes, no points, no posts, no badges.
@router.post("/guest-check")
@limiter.limit("5/15minutes")
def guest_check_solution(request: Request, payload: SolutionIn):
    svc = get_service_client()

    prob_res = svc.table("problems").select("*").eq("id", payload.problem_id).limit(1).execute()
    if not prob_res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    prob = prob_res.data[0]

    answer_type = prob["answer_type"]
    is_correct  = False

    if answer_type == "exact":
        is_correct = _verify_exact(payload.content, prob["correct_answer"] or "")
    elif answer_type == "numeric":
        is_correct = _verify_numeric(payload.content, prob["correct_answer"] or "")
    elif answer_type == "peer_review":
        # Guests can't submit peer-reviewed answers (require an account for community feedback)
        raise HTTPException(status_code=403, detail="Peer-reviewed problems require a free account")

    if is_correct:
        msg = "Correct! 🎉 Sign up to keep your progress and earn points."
    else:
        msg = "Not quite — keep thinking!"

    return {
        "id":             "guest",
        "problem_id":     payload.problem_id,
        "is_correct":     is_correct,
        "points_awarded": 0,
        "message":        msg,
        "streak":         None,
        "badges_earned":  [],
    }


# ── GET /solutions/me ─────────────────────────────────────────
@router.get("/me")
def my_solutions(user: dict = Depends(get_current_user)):
    svc = get_service_client()
    res = (
        svc.table("solutions")
        .select("*, problems(title, difficulty, category_id)")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return res.data or []
