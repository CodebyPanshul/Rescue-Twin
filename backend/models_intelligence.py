"""
Pydantic models for Rescue Twin Intelligence APIs (resource optimization, strategic actions, etc.).
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


# --- Live Flood Intelligence ---
class LiveFloodSnapshot(BaseModel):
    """Real-time adaptive flood digital twin snapshot."""
    water_level_m: float
    rainfall_intensity_mm_hr: float
    flood_spread_radius_km: float
    risk_forecast_30min: RiskLevel
    risk_score: float = Field(ge=0, le=1)
    risk_level_label: str
    risk_factors: dict = {}  # weights and contributions for explainability
    timestamp: str
    zone_heatmap: List[dict]  # district_id, intensity 0-1
    stations: List[dict] = []


# --- Resource Optimization ---
class ResourceOptimizationRequest(BaseModel):
    ambulances_available: int = 10
    rescue_teams: int = 5
    hospital_capacity: int = 200
    population_affected: int = 5000


class PriorityZone(BaseModel):
    zone_id: str
    zone_name: str
    priority_rank: int
    score: float
    population_at_risk: int
    recommended_ambulances: int
    recommended_teams: int


class ResourceOptimizationResponse(BaseModel):
    ranked_zones: List[PriorityZone]
    ambulance_allocation: List[dict]  # zone_id, count
    hospital_load_balancing_suggestion: str
    estimated_response_time_reduction_pct: float
    why_this_decision: dict  # factors, weights, explanation
    ai_driven: bool = True


# --- Strategic Action Simulator ---
class StrategicAction(BaseModel):
    action_id: str
    title: str
    description: str
    casualty_reduction_pct: float
    infrastructure_damage_reduction_pct: float
    time_to_impact_minutes: float
    outcome_rank: int
    branch_summary: str


class StrategicActionsResponse(BaseModel):
    scenario_summary: str
    recommended_actions: List[StrategicAction]
    branches_evaluated: int


# --- Cascading Disaster Chain ---
class ChainNode(BaseModel):
    id: str
    label: str
    type: str  # disaster type
    severity: Optional[str] = None


class CascadingChain(BaseModel):
    chain_id: str
    title: str
    nodes: List[ChainNode]
    edges: List[dict]  # from_id, to_id, label


# --- Resilience Score ---
class ResilienceScoreResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    factors: dict  # population_density, infrastructure_strength, etc.
    label: str
    timestamp: str


# --- Infrastructure Stress ---
class SystemStress(BaseModel):
    system_name: str
    stress_pct: float
    collapse_probability_pct: float
    time_before_failure_minutes: Optional[int] = None
    status: str  # stable, stressed, critical


class InfrastructureStressResponse(BaseModel):
    systems: List[SystemStress]
    overall_collapse_risk_pct: float


# --- Economy Impact ---
class EconomyImpactResponse(BaseModel):
    economic_loss_min_cr: float
    economic_loss_max_cr: float
    infrastructure_repair_cost_cr: float
    estimated_recovery_days: int
    breakdown: List[dict]


# --- Smart Alerts ---
class AlertRequest(BaseModel):
    risk_severity: str  # low, medium, high, critical
    language: str = "en"  # en, hi, regional


class AlertResponse(BaseModel):
    english: str
    hindi: str
    regional: str
    severity: str
