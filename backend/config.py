"""
Application configuration for Rescue Twin API.
"""
from typing import List

# CORS origins for frontend (include all common dev ports)
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

APP_TITLE = "Rescue Twin API"
APP_DESCRIPTION = "AI-Powered Disaster Digital Twin - Flood Simulation & Evacuation Planning"
APP_VERSION = "1.0.0"
