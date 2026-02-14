"""Health check router."""
from fastapi import APIRouter

from models import HealthResponse
from config import APP_VERSION

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version=APP_VERSION,
        simulation_ready=True,
    )
