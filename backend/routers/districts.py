"""Districts and shelters API router."""
from fastapi import APIRouter

from simulation import load_districts, load_shelters

router = APIRouter(tags=["districts"])


@router.get("/districts")
async def get_districts():
    """Get all districts and shelters without simulation data."""
    districts = load_districts()
    shelters = load_shelters()
    return {
        "districts": [d.model_dump() for d in districts],
        "shelters": [s.model_dump() for s in shelters],
    }
