"""
Application configuration for Rescue Twin API.
"""
import os
from typing import List
try:
    from dotenv import load_dotenv  # type: ignore
    # Load .env from backend folder (when running `cd backend && python main.py`)
    load_dotenv()
    # Also try project root .env (when backend runs from root)
    _root_env = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(_root_env):
        load_dotenv(_root_env)
except Exception:
    # If python-dotenv isn't available or .env missing, continue with OS env only
    pass

# CORS origins for frontend
_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# Allow any origin (e.g. when sharing publicly from GitHub Pages)
if os.getenv("ALLOW_ANY_ORIGIN", "").lower() in ("1", "true", "yes"):
    CORS_ORIGINS: List[str] = ["*"]
else:
    extra = os.getenv("CORS_ORIGINS", "")  # Comma-separated, e.g. https://user.github.io
    CORS_ORIGINS = _DEFAULT_ORIGINS + [s.strip() for s in extra.split(",") if s.strip()]

APP_TITLE = "Rescue Twin API"
APP_DESCRIPTION = "AI-Powered Disaster Digital Twin - Flood Simulation & Evacuation Planning"
APP_VERSION = "1.0.0"
