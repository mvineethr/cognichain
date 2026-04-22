from fastapi import APIRouter
from database import get_client

router = APIRouter()

@router.get("")
def list_categories():
    client = get_client()
    res = client.table("categories").select("*").order("id").execute()
    return res.data or []
