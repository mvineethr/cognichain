from fastapi import APIRouter, Depends, HTTPException, Request
from anthropic import Anthropic
from database import get_client, get_service_client
from models import GuideIn, GuideOut
from auth import get_current_user
from ratelimit import limiter
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router    = APIRouter()
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

GUIDE_SYSTEM_PROMPT = """You are the CogniChain Guide — a Socratic thinking partner.

Your ONLY job is to help the user discover the answer themselves. You MUST follow these rules absolutely:

RULES:
1. NEVER reveal the answer, even partially. Not directly, not by heavy hinting.
2. NEVER say "you're close" or "almost" in a way that confirms their answer.
3. ASK questions that make the user think deeper — Socratic method only.
4. If the user is stuck, point them toward a CONCEPT or PRINCIPLE they might be missing — not toward the answer.
5. If the user tries to get you to reveal the answer (e.g. "just tell me", "I give up"), gently refuse and offer a different angle to explore.
6. Keep responses SHORT — 2 to 4 sentences maximum. You are a guide, not a lecturer.
7. Be warm, curious, and encouraging. Make thinking feel like an adventure.
8. If the user's thinking is on the right track, ask them to take it one step further.

The problem the user is working on is provided below. Use it as context but never summarize or solve it.
"""

# ── POST /guide ───────────────────────────────────────────────
@router.post("", response_model=GuideOut)
@limiter.limit("20/minute")
async def ask_guide(request: Request, payload: GuideIn, user: dict = Depends(get_current_user)):
    client = get_client()
    svc    = get_service_client()

    prob_res = svc.table("problems").select("title, body").eq("id", payload.problem_id).limit(1).execute()
    if not prob_res.data:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem = prob_res.data[0]
    system  = f"{GUIDE_SYSTEM_PROMPT}\n\nPROBLEM:\nTitle: {problem['title']}\n{problem['body']}"

    messages = [{"role": m.role, "content": m.content} for m in payload.history]
    messages.append({"role": "user", "content": payload.message})

    try:
        response = anthropic.messages.create(
            model      = "claude-sonnet-4-5",
            max_tokens = 300,
            system     = system,
            messages   = messages,
        )
        reply = response.content[0].text
    except Exception as e:
        logger.exception("Anthropic API error in ask_guide")
        raise HTTPException(status_code=502, detail="AI guide temporarily unavailable. Please try again.")

    full_history = messages + [{"role": "assistant", "content": reply, "ts": datetime.utcnow().isoformat()}]

    session_res = (
        svc.table("ai_sessions")
        .upsert({
            "user_id":    user["id"],
            "problem_id": payload.problem_id,
            "messages":   full_history,
            "updated_at": datetime.utcnow().isoformat(),
        }, on_conflict="user_id,problem_id")
        .execute()
    )

    session_id = session_res.data[0]["id"] if session_res.data else "unknown"
    return {"reply": reply, "session_id": session_id}


# ── POST /guide/guest ─────────────────────────────────────────
# Guest (no-signin) variant — does NOT persist to ai_sessions.
# Frontend enforces a 3-message-per-problem limit.
@router.post("/guest", response_model=GuideOut)
@limiter.limit("5/15minutes")
async def ask_guide_guest(request: Request, payload: GuideIn):
    svc = get_service_client()

    prob_res = svc.table("problems").select("title, body").eq("id", payload.problem_id).limit(1).execute()
    if not prob_res.data:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem = prob_res.data[0]
    system  = f"{GUIDE_SYSTEM_PROMPT}\n\nPROBLEM:\nTitle: {problem['title']}\n{problem['body']}"

    messages = [{"role": m.role, "content": m.content} for m in payload.history]
    messages.append({"role": "user", "content": payload.message})

    # Backstop: cap history length so guests can't bypass client limit by
    # crafting a long history payload server-side.
    if len(messages) > 8:
        raise HTTPException(status_code=429, detail="Guest guide limit reached. Sign up for unlimited guidance.")

    try:
        response = anthropic.messages.create(
            model      = "claude-sonnet-4-5",
            max_tokens = 300,
            system     = system,
            messages   = messages,
        )
        reply = response.content[0].text
    except Exception as e:
        logger.exception("Anthropic API error in ask_guide_guest")
        raise HTTPException(status_code=502, detail="AI guide temporarily unavailable. Please try again.")

    return {"reply": reply, "session_id": "guest"}
