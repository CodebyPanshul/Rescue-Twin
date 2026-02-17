"""
Pydantic models for Rescue Twin disaster simulation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class DisasterType(str, Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    FIRE = "fire"  # Placeholder for future


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Coordinate(BaseModel):
    lat: float
    lng: float


class District(BaseModel):
    id: str
    name: str
    center: Coordinate
    polygon: List[Coordinate]
    population: int
    elevation: float  # meters above sea level
    drainage_capacity: float  # 0-1 scale
    has_shelter: bool = False
    shelter_capacity: Optional[int] = None


class FloodZone(BaseModel):
    district_id: str
    district_name: str
    risk_score: float = Field(ge=0, le=1)
    flood_depth: float  # estimated depth in meters
    is_flooded: bool
    affected_population: int
    risk_breakdown: dict


class Shelter(BaseModel):
    id: str
    name: str
    location: Coordinate
    capacity: int
    current_occupancy: int = 0
    district_id: str
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    last_updated: Optional[str] = None


class Hospital(BaseModel):
    id: str
    name: str
    location: Coordinate
    capacity: int
    current_occupancy: int = 0
    district_id: str
    icu_capacity: Optional[int] = None
    icu_occupied: Optional[int] = None


class EvacuationRoute(BaseModel):
    from_district: str
    to_shelter: str
    to_shelter_name: Optional[str] = None
    path: List[Coordinate]
    distance_km: float
    estimated_time_minutes: float
    is_accessible: bool = True
    rank: Optional[int] = None
    vehicle_note: Optional[str] = None  # e.g., "High-clearance only"


class EmergencyResources(BaseModel):
    ambulances_needed: int
    rescue_boats_needed: int
    medical_teams_needed: int
    evacuation_buses_needed: int
    food_kits_needed: int
    water_liters_needed: int


class RiskMetrics(BaseModel):
    total_population_at_risk: int
    high_risk_zones: int
    medium_risk_zones: int
    low_risk_zones: int
    estimated_evacuation_time_hours: float
    overall_risk_score: float


class AIExplanation(BaseModel):
    confidence_score: float = Field(ge=0, le=1)
    methodology: str
    factors_considered: List[str]
    limitations: List[str]
    recommendation: str


class SimulationResult(BaseModel):
    disaster_type: DisasterType
    severity: Severity
    rainfall_intensity: float  # mm/hour (flood)
    timestamp: str
    flood_zones: List[FloodZone]
    shelters: List[Shelter]
    evacuation_routes: List[EvacuationRoute]
    risk_metrics: RiskMetrics
    emergency_resources: EmergencyResources
    ai_explanation: AIExplanation


class EarthquakeZone(BaseModel):
    """Shaking intensity zone for a district after an earthquake."""
    district_id: str
    district_name: str
    intensity_score: float = Field(ge=0, le=1)  # 0=low, 1=extreme
    intensity_label: str  # e.g. "High", "Medium"
    distance_km: float
    affected_population: int
    is_epicenter: bool = False


class EarthquakeResult(BaseModel):
    disaster_type: DisasterType = DisasterType.EARTHQUAKE
    magnitude: float
    epicenter_district_id: str
    epicenter_district_name: str
    timestamp: str
    earthquake_zones: List[EarthquakeZone]
    shelters: List[Shelter]
    risk_metrics: RiskMetrics
    emergency_resources: EmergencyResources
    ai_explanation: AIExplanation


class SimulationRequest(BaseModel):
    disaster_type: DisasterType = DisasterType.FLOOD
    severity: Severity = Severity.MEDIUM
    rainfall_intensity: Optional[float] = None  # Override default based on severity


class HealthResponse(BaseModel):
    status: str
    version: str
    simulation_ready: bool


class ResourceType(str, Enum):
    AMBULANCE = "ambulance"
    RESCUE_TEAM = "rescue_team"


class ResourceUnit(BaseModel):
    id: str
    type: ResourceType
    location: Coordinate
    available: bool = True
    status: Optional[str] = None
    speed_kmh: float = 40.0
    assigned_to: Optional[str] = None
    last_updated: Optional[str] = None


class ResourceUpdate(BaseModel):
    id: str
    type: ResourceType
    location: Coordinate
    available: Optional[bool] = None
    speed_kmh: Optional[float] = None


class ResourceAssignment(BaseModel):
    resource_id: str
    resource_type: ResourceType
    to_district_id: str
    to_district_name: Optional[str] = None
    path: List[Coordinate]
    distance_km: float
    estimated_time_minutes: float
    passable: bool = True
    vehicle_note: Optional[str] = None
    destination_hospital_id: Optional[str] = None
    destination_hospital_name: Optional[str] = None
    hospital_wait_minutes: Optional[float] = None


class AssignmentRequest(BaseModel):
    severity: Severity = Severity.MEDIUM
    closed_districts: List[str] = []
    traffic_multiplier: float = 1.0
    departure_hour: Optional[int] = None


class AssignmentResponse(BaseModel):
    assignments: List[ResourceAssignment]
    unassigned_ids: List[str]
