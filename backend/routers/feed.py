from fastapi import APIRouter, Depends, Query, HTTPException
from database import get_service_client
from models import PostIn, CommentIn
from auth import get_current_user

router = APIRouter()


@router.get("")
def get_feed(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    svc = get_service_client()

    res = (
        svc.table("posts")
        .select("*, profiles(username, avatar_url, rank_title)")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    liked_res = (
        svc.table("post_likes")
        .select("post_id")
        .eq("user_id", user["id"])
        .execute()
    )
    liked_ids = {l["post_id"] for l in (liked_res.data or [])}

    result = []
    for post in (res.data or []):
        profile = post.pop("profiles", {}) or {}
        result.append({
            **post,
            "username":   profile.get("username", "Unknown"),
            "avatar_url": profile.get("avatar_url"),
            "rank_title": profile.get("rank_title", "Novice"),
            "liked":      post["id"] in liked_ids,
        })

    return result


@router.post("")
def create_post(payload: PostIn, user: dict = Depends(get_current_user)):
    svc = get_service_client()

    data = {
        "user_id":  user["id"],
        "type":     payload.type,
        "content":  payload.content,
        "metadata": payload.metadata or {},
    }
    if payload.problem_id:
        data["problem_id"] = payload.problem_id

    res = svc.table("posts").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create post")

    post = res.data[0]
    profile = (
        svc.table("profiles")
        .select("username, avatar_url, rank_title")
        .eq("id", user["id"])
        .single()
        .execute()
    ).data or {}

    return {
        **post,
        "username":   profile.get("username", ""),
        "avatar_url": profile.get("avatar_url"),
        "rank_title": profile.get("rank_title", "Novice"),
        "liked":      False,
    }


@router.post("/{post_id}/like")
def toggle_like(post_id: str, user: dict = Depends(get_current_user)):
    svc = get_service_client()
    result = svc.rpc("toggle_post_like", {
        "p_post_id": post_id,
        "p_user_id": user["id"],
    }).execute()
    return result.data


@router.get("/{post_id}/comments")
def get_comments(post_id: str, user: dict = Depends(get_current_user)):
    svc = get_service_client()

    res = (
        svc.table("post_comments")
        .select("*, profiles(username, avatar_url)")
        .eq("post_id", post_id)
        .order("created_at")
        .execute()
    )

    comments = []
    for c in (res.data or []):
        profile = c.pop("profiles", {}) or {}
        comments.append({
            **c,
            "username":   profile.get("username", "Unknown"),
            "avatar_url": profile.get("avatar_url"),
        })
    return comments


@router.post("/{post_id}/comments")
def add_comment(post_id: str, payload: CommentIn, user: dict = Depends(get_current_user)):
    svc = get_service_client()

    res = svc.table("post_comments").insert({
        "post_id": post_id,
        "user_id": user["id"],
        "content": payload.content,
    }).execute()

    svc.rpc("increment_comment_count", {"p_post_id": post_id}).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to add comment")

    comment = res.data[0]
    profile = (
        svc.table("profiles")
        .select("username, avatar_url")
        .eq("id", user["id"])
        .single()
        .execute()
    ).data or {}

    return {
        **comment,
        "username":   profile.get("username", ""),
        "avatar_url": profile.get("avatar_url"),
    }
