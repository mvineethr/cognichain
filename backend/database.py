from supabase import create_client, Client
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

@lru_cache(maxsize=1)
def get_client() -> Client:
    url  = os.getenv("SUPABASE_URL")
    key  = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    return create_client(url, key)

@lru_cache(maxsize=1)
def get_service_client() -> Client:
    """Service role client — use only for server-side mutations (points, badges, etc.)"""
    url  = os.getenv("SUPABASE_URL")
    key  = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    return create_client(url, key)
