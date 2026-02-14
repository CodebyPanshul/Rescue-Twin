"""Simulation API router."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query, HTTPException

from models import (
    DisasterType,
    Severity,
    SimulationResult,
    SimulationRequest,
    EarthquakeResult,
)
from services.simulation_service import run_simulation
from earthquake import run_earthquake_simulation

router = APIRouter(tags=["simulation"])


@router.get("/simulate-flood", response_model=SimulationResult)
async def simulate_flood(
    intensity: Severity = Query(
        default=Severity.MEDIUM,
        description="Flood severity level (low, medium, high)",
    ),
    rainfall: Optional[float] = Query(
        default=None,
        description="Override rainfall intensity in mm/hour (optional)",
    ),
) -> SimulationResult:
    """
    Run flood simulation with specified parameters.
    Returns flood zones, evacuation routes, risk metrics, and AI explanation.
    """
    try:
        return run_simulation(severity=intensity, rainfall_override=rainfall)
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="District data not found. Please ensure data files are properly configured.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.post("/simulate", response_model=SimulationResult)
async def simulate_disaster(request: SimulationRequest) -> SimulationResult:
    """Run disaster simulation with POST body. Currently supports flood only."""
    if request.disaster_type != DisasterType.FLOOD:
        raise HTTPException(
            status_code=400,
            detail="Only flood simulation is currently supported",
        )
    return run_simulation(
        severity=request.severity,
        rainfall_override=request.rainfall_intensity,
    )


@router.get("/simulate-earthquake", response_model=EarthquakeResult)
async def simulate_earthquake(
    magnitude: float = Query(default=6.0, ge=4.0, le=8.0, description="Richter magnitude 4–8"),
    epicenter: str = Query(default="d1", description="District ID of epicenter (e.g. d1, d2)"),
) -> EarthquakeResult:
    """
    Run earthquake scenario: magnitude and epicenter district.
    Returns intensity zones, risk metrics, and AI explanation.
    """
    try:
        zones, shelters, risk_metrics, emergency_resources, ai_explanation = run_earthquake_simulation(
            magnitude=magnitude,
            epicenter_district_id=epicenter,
        )
        epicenter_district = next((z for z in zones if z.is_epicenter), zones[0])
        return EarthquakeResult(
            disaster_type=DisasterType.EARTHQUAKE,
            magnitude=magnitude,
            epicenter_district_id=epicenter_district.district_id,
            epicenter_district_name=epicenter_district.district_name,
            timestamp=datetime.utcnow().isoformat() + "Z",
            earthquake_zones=zones,
            shelters=shelters,
            risk_metrics=risk_metrics,
            emergency_resources=emergency_resources,
            ai_explanation=ai_explanation,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="District data not found. Please ensure data files are properly configured.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Earthquake simulation error: {str(e)}")
