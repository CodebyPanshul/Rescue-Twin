"""
Earthquake simulation for Rescue Twin.
Intensity falls off with distance from epicenter; districts get intensity scores and labels.
"""
import math
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from models import (
    District,
    Shelter,
    EarthquakeZone,
    RiskMetrics,
    EmergencyResources,
    AIExplanation,
    Coordinate,
)
from simulation import load_districts, load_shelters


def haversine_km(a: Coordinate, b: Coordinate) -> float:
    R = 6371
    lat1, lon1 = math.radians(a.lat), math.radians(a.lng)
    lat2, lon2 = math.radians(b.lat), math.radians(b.lng)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    x = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(x))


def intensity_from_magnitude_and_distance(magnitude: float, distance_km: float) -> float:
    """
    Simplified intensity decay: higher magnitude and lower distance = higher intensity.
    Returns 0-1 score. Epicenter (distance=0) gets max; decay with distance.
    """
    if distance_km < 0.1:
        distance_km = 0.1
    # Rough attenuation: intensity drops with distance (log scale)
    # Magnitude 4 -> weak at 50km; 8 -> strong at 100km
    base_intensity = min(1.0, (magnitude - 3) / 5.0)
    decay = math.exp(-distance_km / (20 + magnitude * 5))
    return round(min(1.0, base_intensity * (0.3 + 0.7 * decay)), 3)


def intensity_label(score: float) -> str:
    if score >= 0.7:
        return "Extreme"
    if score >= 0.5:
        return "High"
    if score >= 0.3:
        return "Medium"
    if score >= 0.15:
        return "Low"
    return "Very low"


def run_earthquake_simulation(
    magnitude: float,
    epicenter_district_id: str,
) -> Tuple[List[EarthquakeZone], List[Shelter], RiskMetrics, EmergencyResources, AIExplanation]:
    districts = load_districts()
    shelters = load_shelters()

    epicenter = next((d for d in districts if d.id == epicenter_district_id), None)
    if not epicenter:
        epicenter = districts[0]
        epicenter_district_id = epicenter.id

    epicenter_coord = epicenter.center
    zones: List[EarthquakeZone] = []
    total_affected = 0
    high_risk = medium_risk = low_risk = 0

    for d in districts:
        distance_km = haversine_km(d.center, epicenter_coord)
        intensity_score = intensity_from_magnitude_and_distance(magnitude, distance_km)
        label = intensity_label(intensity_score)
        is_epicenter = d.id == epicenter_district_id
        if is_epicenter:
            intensity_score = min(1.0, 0.5 + magnitude / 15)
            label = "Epicenter"

        # Affected population: higher intensity = more people affected
        affected = int(d.population * intensity_score * 0.8) if intensity_score >= 0.2 else 0
        total_affected += affected

        if intensity_score >= 0.5:
            high_risk += 1
        elif intensity_score >= 0.3:
            medium_risk += 1
        elif intensity_score >= 0.15:
            low_risk += 1

        zones.append(
            EarthquakeZone(
                district_id=d.id,
                district_name=d.name,
                intensity_score=intensity_score,
                intensity_label=label,
                distance_km=round(distance_km, 2),
                affected_population=affected,
                is_epicenter=is_epicenter,
            )
        )

    overall_risk = sum(z.intensity_score for z in zones) / len(zones) if zones else 0
    evacuation_hours = (total_affected / 5000) * (1 + overall_risk) if total_affected else 0

    risk_metrics = RiskMetrics(
        total_population_at_risk=total_affected,
        high_risk_zones=high_risk,
        medium_risk_zones=medium_risk,
        low_risk_zones=low_risk,
        estimated_evacuation_time_hours=round(evacuation_hours, 1),
        overall_risk_score=round(overall_risk, 3),
    )

    emergency_resources = EmergencyResources(
        ambulances_needed=max(1, total_affected // 1500),
        rescue_boats_needed=0,
        medical_teams_needed=max(1, total_affected // 2000),
        evacuation_buses_needed=max(2, total_affected // 800),
        food_kits_needed=total_affected,
        water_liters_needed=total_affected * 3,
    )

    methodology = (
        "Intensity estimated from magnitude and distance using exponential decay. "
        "Epicenter district gets maximum intensity; others scale by distance. "
        "Population at risk and resource needs derived from intensity and district population."
    )
    factors = [
        f"Magnitude: {magnitude}",
        f"Epicenter: {epicenter.name}",
        "Distance from epicenter (haversine)",
        "District population",
    ]
    limitations = [
        "Simplified ground-motion model; no soil amplification.",
        "No fault geometry or depth.",
        "Synthetic district data.",
    ]
    if risk_metrics.overall_risk_score >= 0.5:
        recommendation = (
            "High shaking expected. Evacuate unstable structures; open safe areas for shelter. "
            "Deploy search-and-rescue and medical teams. Check critical infrastructure."
        )
    elif risk_metrics.overall_risk_score >= 0.3:
        recommendation = (
            "Moderate shaking. Assess buildings for damage. Prepare shelters. "
            "Monitor aftershocks and landslides in hilly terrain."
        )
    else:
        recommendation = (
            "Lower intensity. Conduct rapid assessment. Ensure communication lines. "
            "Review evacuation routes for possible landslide blockage."
        )

    confidence = 0.75 if magnitude <= 6 else 0.68
    ai_explanation = AIExplanation(
        confidence_score=confidence,
        methodology=methodology,
        factors_considered=factors,
        limitations=limitations,
        recommendation=recommendation,
    )

    return zones, shelters, risk_metrics, emergency_resources, ai_explanation
