"""
Simulation service: orchestrates flood simulation and evacuation routing.
"""
from datetime import datetime
from typing import Optional

from models import (
    DisasterType,
    Severity,
    SimulationResult,
    SimulationRequest,
)
from simulation import run_flood_simulation
from routing import compute_evacuation_routes


def run_simulation(
    severity: Severity,
    rainfall_override: Optional[float] = None,
) -> SimulationResult:
    """
    Run full flood simulation and return structured result.
    """
    flood_zones, shelters, risk_metrics, emergency_resources, ai_explanation, actual_rainfall = (
        run_flood_simulation(severity=severity, rainfall_override=rainfall_override)
    )
    evacuation_routes = compute_evacuation_routes(flood_zones, shelters)

    return SimulationResult(
        disaster_type=DisasterType.FLOOD,
        severity=severity,
        rainfall_intensity=actual_rainfall,
        timestamp=datetime.utcnow().isoformat() + "Z",
        flood_zones=flood_zones,
        shelters=shelters,
        evacuation_routes=evacuation_routes,
        risk_metrics=risk_metrics,
        emergency_resources=emergency_resources,
        ai_explanation=ai_explanation,
    )
