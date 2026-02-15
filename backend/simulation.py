"""
Flood Simulation Engine for Rescue Twin.

Risk Score Formula:
Flood Risk Score = (0.5 × Rainfall Intensity) + (0.3 × Elevation Inverse) + (0.2 × Drainage Factor)
"""
import json
import math
import os
import time
from datetime import datetime
from pathlib import Path
from typing import List, Tuple
try:
    import httpx  # type: ignore
except Exception:
    httpx = None

from models import (
    District, FloodZone, Shelter, Severity, DisasterType,
    RiskMetrics, EmergencyResources, AIExplanation, Coordinate
)


# Rainfall intensity mapping (mm/hour)
RAINFALL_BY_SEVERITY = {
    Severity.LOW: 25.0,
    Severity.MEDIUM: 50.0,
    Severity.HIGH: 100.0
}

# Thresholds
FLOOD_THRESHOLD = 0.4  # Risk score above this = flooded
HIGH_RISK_THRESHOLD = 0.7
MEDIUM_RISK_THRESHOLD = 0.4


def load_districts() -> List[District]:
    """Load district data from JSON file."""
    data_path = Path(__file__).parent / "data" / "districts.json"
    with open(data_path, "r") as f:
        data = json.load(f)
    return [District(**d) for d in data["districts"]]


_SHELTER_CACHE: dict = {"ts": 0.0, "data": None}
_SHELTER_TTL_SECONDS = 600


def _fetch_remote_shelters() -> List[dict] | None:
    url = os.environ.get("SHELTERS_FEED_URL")
    if not url:
        return None
    try:
        if httpx is None:
            return None
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            payload = resp.json()
            items = payload.get("shelters", payload) if isinstance(payload, (list, dict)) else None
            if isinstance(items, list):
                canonical = []
                for it in items:
                    try:
                        loc = it.get("location") or {}
                        lat = loc.get("lat") if isinstance(loc, dict) else it.get("lat")
                        lng = loc.get("lng") if isinstance(loc, dict) else it.get("lng")
                        sid = str(it.get("id") or it.get("shelter_id"))
                        if not sid or lat is None or lng is None:
                            continue
                        canonical.append({
                            "id": sid,
                            "name": it.get("name") or f"Shelter {sid}",
                            "location": {"lat": float(lat), "lng": float(lng)},
                            "capacity": int(it.get("capacity") or 0),
                            "current_occupancy": int(it.get("current_occupancy") or it.get("occupancy") or 0),
                            "district_id": it.get("district_id") or "",
                            "contact_phone": it.get("contact") or it.get("contact_phone"),
                            "address": it.get("address"),
                            "last_updated": it.get("last_updated"),
                        })
                    except Exception:
                        continue
                return canonical
    except Exception:
        return None
    return None


def load_shelters() -> List[Shelter]:
    """Load shelters from local JSON and merge optional live metadata from remote feed."""
    data_path = Path(__file__).parent / "data" / "districts.json"
    with open(data_path, "r") as f:
        data = json.load(f)
    local_shelters = [Shelter(**s) for s in data["shelters"]]
    now = time.time()
    use_cache = (_SHELTER_CACHE["data"] is not None) and (now - _SHELTER_CACHE["ts"] < _SHELTER_TTL_SECONDS)
    remote = _SHELTER_CACHE["data"] if use_cache else _fetch_remote_shelters()
    if remote is not None and not use_cache:
        _SHELTER_CACHE["data"] = remote
        _SHELTER_CACHE["ts"] = now
    if not remote:
        return local_shelters
    by_id = {s.id: s for s in local_shelters}
    for r in remote:
        sid = r.get("id")
        if not sid:
            continue
        if sid in by_id:
            s = by_id[sid]
            s.capacity = r.get("capacity", s.capacity)
            s.current_occupancy = r.get("current_occupancy", s.current_occupancy)
            s.contact_phone = r.get("contact_phone", s.contact_phone)
            s.address = r.get("address", s.address)
            s.last_updated = r.get("last_updated", s.last_updated)
        else:
            try:
                by_id[sid] = Shelter(**r)
            except Exception:
                continue
    return list(by_id.values())


def normalize_rainfall(rainfall_mm: float, max_rainfall: float = 150.0) -> float:
    """Normalize rainfall to 0-1 scale."""
    return min(rainfall_mm / max_rainfall, 1.0)


def calculate_elevation_factor(elevation: float, min_elev: float = 0, max_elev: float = 100) -> float:
    """
    Calculate elevation inverse factor.
    Lower elevation = higher flood risk.
    Returns 0-1 scale where 1 = highest risk (lowest elevation).
    """
    if max_elev == min_elev:
        return 0.5
    normalized = (elevation - min_elev) / (max_elev - min_elev)
    return 1.0 - normalized  # Inverse: low elevation = high risk


def calculate_drainage_factor(drainage_capacity: float) -> float:
    """
    Calculate drainage factor.
    Poor drainage (low capacity) = higher flood risk.
    Returns 0-1 scale where 1 = highest risk (worst drainage).
    """
    return 1.0 - drainage_capacity


def calculate_flood_risk(
    rainfall_intensity: float,
    elevation: float,
    drainage_capacity: float,
    min_elevation: float,
    max_elevation: float
) -> Tuple[float, dict]:
    """
    Calculate flood risk score using weighted formula.
    
    Returns:
        Tuple of (risk_score, breakdown_dict)
    """
    rainfall_factor = normalize_rainfall(rainfall_intensity)
    elevation_factor = calculate_elevation_factor(elevation, min_elevation, max_elevation)
    drainage_factor = calculate_drainage_factor(drainage_capacity)
    
    # Weighted formula
    risk_score = (
        0.5 * rainfall_factor +
        0.3 * elevation_factor +
        0.2 * drainage_factor
    )
    
    breakdown = {
        "rainfall_contribution": round(0.5 * rainfall_factor, 3),
        "elevation_contribution": round(0.3 * elevation_factor, 3),
        "drainage_contribution": round(0.2 * drainage_factor, 3),
        "rainfall_factor": round(rainfall_factor, 3),
        "elevation_factor": round(elevation_factor, 3),
        "drainage_factor": round(drainage_factor, 3)
    }
    
    return round(risk_score, 3), breakdown


def estimate_flood_depth(risk_score: float, rainfall_mm: float) -> float:
    """Estimate flood depth based on risk score and rainfall."""
    if risk_score < FLOOD_THRESHOLD:
        return 0.0
    # Simple model: depth increases with risk and rainfall
    base_depth = (risk_score - FLOOD_THRESHOLD) * 2.0  # 0-1.2m range
    rainfall_multiplier = rainfall_mm / 50.0  # Scale by rainfall
    return round(min(base_depth * rainfall_multiplier, 3.0), 2)  # Cap at 3m


def calculate_affected_population(
    population: int,
    risk_score: float,
    is_flooded: bool
) -> int:
    """Calculate affected population based on risk level."""
    if not is_flooded:
        return 0
    # Higher risk = more people affected
    affected_ratio = min(risk_score, 1.0)
    return int(population * affected_ratio)


def run_flood_simulation(
    severity: Severity,
    rainfall_override: float = None
) -> Tuple[List[FloodZone], List[Shelter], RiskMetrics, EmergencyResources, AIExplanation, float]:
    """
    Run complete flood simulation.
    
    Returns:
        Tuple of (flood_zones, shelters, risk_metrics, emergency_resources, ai_explanation, rainfall)
    """
    districts = load_districts()
    shelters = load_shelters()
    
    # Determine rainfall
    rainfall = rainfall_override if rainfall_override else RAINFALL_BY_SEVERITY[severity]
    
    # Get elevation range for normalization
    elevations = [d.elevation for d in districts]
    min_elev, max_elev = min(elevations), max(elevations)
    
    # Calculate flood zones
    flood_zones = []
    total_affected = 0
    high_risk = medium_risk = low_risk = 0
    
    for district in districts:
        risk_score, breakdown = calculate_flood_risk(
            rainfall_intensity=rainfall,
            elevation=district.elevation,
            drainage_capacity=district.drainage_capacity,
            min_elevation=min_elev,
            max_elevation=max_elev
        )
        
        is_flooded = risk_score >= FLOOD_THRESHOLD
        flood_depth = estimate_flood_depth(risk_score, rainfall)
        affected_pop = calculate_affected_population(
            district.population, risk_score, is_flooded
        )
        
        total_affected += affected_pop
        
        # Categorize risk level
        if risk_score >= HIGH_RISK_THRESHOLD:
            high_risk += 1
        elif risk_score >= MEDIUM_RISK_THRESHOLD:
            medium_risk += 1
        else:
            low_risk += 1
        
        flood_zones.append(FloodZone(
            district_id=district.id,
            district_name=district.name,
            risk_score=risk_score,
            flood_depth=flood_depth,
            is_flooded=is_flooded,
            affected_population=affected_pop,
            risk_breakdown=breakdown
        ))
    
    # Calculate overall risk
    overall_risk = sum(fz.risk_score for fz in flood_zones) / len(flood_zones)
    
    # Estimate evacuation time (simplified model)
    evacuation_hours = (total_affected / 5000) * (1 + overall_risk)  # ~5000 people/hour base rate
    
    risk_metrics = RiskMetrics(
        total_population_at_risk=total_affected,
        high_risk_zones=high_risk,
        medium_risk_zones=medium_risk,
        low_risk_zones=low_risk,
        estimated_evacuation_time_hours=round(evacuation_hours, 1),
        overall_risk_score=round(overall_risk, 3)
    )
    
    # Calculate emergency resources needed
    emergency_resources = calculate_emergency_resources(total_affected, high_risk, flood_zones)
    
    # Generate AI explanation
    ai_explanation = generate_ai_explanation(severity, rainfall, flood_zones, risk_metrics)
    
    return flood_zones, shelters, risk_metrics, emergency_resources, ai_explanation, rainfall


def calculate_emergency_resources(
    affected_population: int,
    high_risk_zones: int,
    flood_zones: List[FloodZone]
) -> EmergencyResources:
    """Calculate required emergency resources."""
    flooded_zones = sum(1 for fz in flood_zones if fz.is_flooded)
    
    return EmergencyResources(
        ambulances_needed=max(1, affected_population // 2000),
        rescue_boats_needed=max(2, flooded_zones * 2),
        medical_teams_needed=max(1, affected_population // 3000),
        evacuation_buses_needed=max(2, affected_population // 1000),
        food_kits_needed=affected_population,
        water_liters_needed=affected_population * 4  # 4L per person per day
    )


def generate_ai_explanation(
    severity: Severity,
    rainfall: float,
    flood_zones: List[FloodZone],
    risk_metrics: RiskMetrics
) -> AIExplanation:
    """Generate explainable AI output."""
    
    # Confidence based on data quality (simulated)
    confidence = 0.85 if severity == Severity.LOW else (0.78 if severity == Severity.MEDIUM else 0.72)
    
    methodology = (
        "Risk scores calculated using weighted formula: "
        "Flood Risk = (0.5 × Rainfall Intensity) + (0.3 × Elevation Inverse) + (0.2 × Drainage Factor). "
        "Evacuation routes computed using Dijkstra's shortest path algorithm, "
        "excluding flooded road segments."
    )
    
    factors = [
        f"Rainfall intensity: {rainfall} mm/hour",
        "Terrain elevation data (synthetic)",
        "Drainage system capacity ratings",
        "District population density",
        "Shelter locations and capacities"
    ]
    
    limitations = [
        "Using synthetic elevation data; real DEM would improve accuracy",
        "Drainage capacity is estimated, not measured",
        "Does not account for real-time sensor data",
        "Simplified flood propagation model"
    ]
    
    # Generate recommendation
    if risk_metrics.overall_risk_score >= 0.7:
        recommendation = (
            "CRITICAL: Immediate evacuation recommended for all high-risk zones. "
            "Deploy all available rescue teams. Activate emergency shelters."
        )
    elif risk_metrics.overall_risk_score >= 0.4:
        recommendation = (
            "WARNING: Prepare evacuation for vulnerable populations. "
            "Monitor water levels closely. Pre-position rescue resources."
        )
    else:
        recommendation = (
            "ADVISORY: Low flood risk. Monitor weather conditions. "
            "Ensure drainage systems are clear. Review evacuation plans."
        )
    
    return AIExplanation(
        confidence_score=confidence,
        methodology=methodology,
        factors_considered=factors,
        limitations=limitations,
        recommendation=recommendation
    )
