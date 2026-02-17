from datetime import datetime
from typing import Dict, List, Tuple
from fastapi import APIRouter, HTTPException
import networkx as nx
from models import (
    ResourceUnit,
    ResourceUpdate,
    AssignmentRequest,
    AssignmentResponse,
    ResourceAssignment,
    Severity,
    District,
    FloodZone,
    ResourceType,
    Coordinate,
)
from simulation import load_districts, load_shelters, load_hospitals
from services.simulation_service import run_simulation
from routing import load_road_network, build_graph, find_nearest_node_id, path_to_coordinates
from typing import Optional
import math
import networkx as nx

router = APIRouter(prefix="/resources", tags=["resources"])

_RESOURCES: Dict[str, ResourceUnit] = {}

def _seed_demo_resources():
    if _RESOURCES:
        return
    now = datetime.utcnow().isoformat() + "Z"
    districts = load_districts()
    picks = districts[:5] + districts[-3:]
    amb_i = 1
    team_i = 1
    for i, d in enumerate(picks):
        # Alternate types, scatter a bit around center
        jitter = 0.02 * ((i % 3) - 1)
        loc = Coordinate(lat=d.center.lat + jitter, lng=d.center.lng + jitter)
        _RESOURCES[f"AMB-{amb_i:03d}"] = ResourceUnit(
            id=f"AMB-{amb_i:03d}",
            type=ResourceType.AMBULANCE,
            location=loc,
            available=True,
            speed_kmh=50.0,
            last_updated=now,
        )
        amb_i += 1
        if i % 2 == 0:
            _RESOURCES[f"TEAM-{team_i:03d}"] = ResourceUnit(
                id=f"TEAM-{team_i:03d}",
                type=ResourceType.RESCUE_TEAM,
                location=Coordinate(lat=d.center.lat - jitter, lng=d.center.lng - jitter),
                available=True,
                speed_kmh=35.0,
                last_updated=now,
            )
            team_i += 1


@router.get("", response_model=List[ResourceUnit])
async def list_resources():
    _seed_demo_resources()
    return list(_RESOURCES.values())


@router.post("/update", response_model=List[ResourceUnit])
async def update_resources(payload: Dict[str, List[ResourceUpdate]]):
    updates = payload.get("updates", [])
    now = datetime.utcnow().isoformat() + "Z"
    for u in updates:
        existing = _RESOURCES.get(u.id)
        if existing:
            loc = u.location or existing.location
            avail = existing.available if u.available is None else u.available
            spd = existing.speed_kmh if u.speed_kmh is None else u.speed_kmh
            updated = ResourceUnit(
                id=existing.id,
                type=existing.type,
                location=loc,
                available=avail,
                status=existing.status,
                speed_kmh=spd,
                assigned_to=existing.assigned_to,
                last_updated=now,
            )
            _RESOURCES[u.id] = updated
        else:
            new_unit = ResourceUnit(
                id=u.id,
                type=u.type,
                location=u.location,
                available=True if u.available is None else u.available,
                speed_kmh=u.speed_kmh or 40.0,
                last_updated=now,
            )
            _RESOURCES[u.id] = new_unit
    return list(_RESOURCES.values())


def _district_center(districts: List[District], district_id: str) -> Coordinate:
    for d in districts:
        if d.id == district_id:
            return d.center
    return Coordinate(lat=0.0, lng=0.0)


def _shortest_to_district(graph: nx.Graph, district_id: str, start_node: str) -> Tuple[float, List[str]]:
    targets = [n for n, data in graph.nodes(data=True) if data.get("district_id") == district_id and not data.get("is_shelter")]
    if not targets:
        return float("inf"), []
    try:
        dist_map, paths = nx.single_source_dijkstra(graph, start_node)
    except nx.NetworkXNoPath:
        return float("inf"), []
    best = float("inf")
    best_path: List[str] = []
    for t in targets:
        if t in dist_map and dist_map[t] < best:
            best = dist_map[t]
            best_path = paths[t]
    return best, best_path


@router.post("/assign", response_model=AssignmentResponse)
async def assign_resources(req: AssignmentRequest):
    try:
        _seed_demo_resources()
        sim = run_simulation(severity=req.severity)
        districts = load_districts()
        zones = [z for z in sim.flood_zones if z.is_flooded]
        zones.sort(key=lambda z: (-z.risk_score, -z.affected_population))
        road = load_road_network()
        flooded = {z.district_id for z in zones}
        closed = set(req.closed_districts or [])
        depth_by = {z.district_id: z.flood_depth for z in zones}
        elev_by = {d.id: d.elevation for d in districts}
        hour_mult = req.traffic_multiplier or 1.0
        if req.departure_hour is not None:
            h = int(req.departure_hour) % 24
            if h in (8, 9, 17, 18):
                hour_mult *= 1.3
            elif h in (7, 10, 16, 19):
                hour_mult *= 1.15
        G = build_graph(road, flooded, closed, hour_mult, depth_by, elev_by)
        ambulances = [r for r in _RESOURCES.values() if r.type == ResourceType.AMBULANCE and r.available]
        teams = [r for r in _RESOURCES.values() if r.type == ResourceType.RESCUE_TEAM and r.available]
        hospitals = load_hospitals()
        occ: Dict[str, int] = {h.id: h.current_occupancy for h in hospitals}
        cap: Dict[str, int] = {h.id: h.capacity for h in hospitals}
        assigned_ids = set()
        res: List[ResourceAssignment] = []
        def _vehicle_note_for_path(path: List[str]) -> Optional[str]:
            if not path:
                return None
            for u, v in zip(path[:-1], path[1:]):
                ed = G.get_edge_data(u, v) or {}
                if ed.get("high_clearance"):
                    return "High-clearance only"
            return None
        def assign_for(resources: List[ResourceUnit], demand_map: Dict[str, int]):
            nonlocal assigned_ids, res
            resources = [r for r in resources if r.id not in assigned_ids]
            if not resources:
                return
            zone_ids = [zid for zid, n in demand_map.items() if n > 0]
            if not zone_ids:
                return
            pairs: Dict[tuple, tuple] = {}
            for r in resources:
                sn = find_nearest_node_id(G, r.location.lat, r.location.lng)
                if not sn:
                    continue
                for zid in zone_ids:
                    dist_km, path = _shortest_to_district(G, zid, sn)
                    if path:
                        pairs[(r.id, zid)] = (dist_km, path)
            if not pairs:
                return
            DG = nx.DiGraph()
            src = "_src"
            sink = "_sink"
            DG.add_node(src, demand=-len(resources))
            DG.add_node(sink, demand=sum(demand_map[zid] for zid in zone_ids))
            for r in resources:
                DG.add_edge(src, f"R:{r.id}", capacity=1, weight=0)
                DG.add_node(f"R:{r.id}", demand=0)
            for zid in zone_ids:
                DG.add_node(f"Z:{zid}", demand=0)
                DG.add_edge(f"Z:{zid}", sink, capacity=demand_map[zid], weight=0)
            for (rid, zid), (dist_km, path) in pairs.items():
                loc_pen = 0 if dist_km <= 20 else int((dist_km - 20) * 2)
                t_turn = 30
                cost = int(dist_km * 100) + loc_pen + t_turn
                DG.add_edge(f"R:{rid}", f"Z:{zid}", capacity=1, weight=cost)
            try:
                flow = nx.network_simplex(DG)
                flow_dict = flow[1]
            except Exception:
                flow_dict = {}
            for r in resources:
                edges = flow_dict.get(f"R:{r.id}", {})
                for znode, fval in edges.items():
                    if not fval:
                        continue
                    if not znode.startswith("Z:"):
                        continue
                    zid = znode[2:]
                    dist_km, path = pairs[(r.id, zid)]
                    speed = max(r.speed_kmh, 5.0)
                    tmin = (dist_km / max(speed, 1e-6)) * 60.0
                    coords = path_to_coordinates(G, path)
                    note = _vehicle_note_for_path(path)
                    hx = None
                    hx_dist = float("inf")
                    zx = next((z for z in zones if z.district_id == zid), None)
                    zc = _district_center(districts, zid)
                    for h in hospitals:
                        d_km = math.hypot(h.location.lat - zc.lat, h.location.lng - zc.lng) * 111
                        if d_km < hx_dist:
                            hx = h
                            hx_dist = d_km
                    wait_min = None
                    if hx:
                        o = occ[hx.id]
                        c = cap[hx.id]
                        if o >= c:
                            rate_per_min = 8 / 60.0
                            wait_min = round(max(0.0, (o - c + 1) / max(rate_per_min, 1e-6)))
                        occ[hx.id] = o + 1
                    res.append(ResourceAssignment(
                        resource_id=r.id,
                        resource_type=r.type,
                        to_district_id=zid,
                        to_district_name=next((z.district_name for z in zones if z.district_id == zid), None),
                        path=coords,
                        distance_km=round(dist_km, 2),
                        estimated_time_minutes=round(tmin, 1),
                        passable=True,
                        vehicle_note=note,
                        destination_hospital_id=hx.id if hx else None,
                        destination_hospital_name=hx.name if hx else None,
                        hospital_wait_minutes=wait_min,
                    ))
                    assigned_ids.add(r.id)
        dem_amb: Dict[str, int] = {}
        dem_team: Dict[str, int] = {}
        total_pop = sum(z.affected_population for z in zones) or 1
        total_amb = len(ambulances)
        total_team = len(teams)
        for z in zones:
            share = z.affected_population / total_pop
            dem_amb[z.district_id] = max(0, int(round(share * total_amb)))
            dem_team[z.district_id] = max(0, int(round(share * total_team)))
        if sum(dem_amb.values()) < total_amb and zones:
            dem_amb[zones[0].district_id] += total_amb - sum(dem_amb.values())
        if sum(dem_team.values()) < total_team and zones:
            dem_team[zones[0].district_id] += total_team - sum(dem_team.values())
        assign_for(ambulances, dem_amb)
        assign_for(teams, dem_team)
        unassigned = [r.id for r in _RESOURCES.values() if r.available and r.id not in assigned_ids]
        return AssignmentResponse(assignments=res, unassigned_ids=unassigned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _nearest_ambulance_to_district(district_id: str, graph: nx.Graph) -> Optional[tuple]:
    ambulances = [r for r in _RESOURCES.values() if r.type == ResourceType.AMBULANCE and r.available]
    best = None
    best_dist = float("inf")
    best_path: List[str] = []
    for r in ambulances:
        sn = find_nearest_node_id(graph, r.location.lat, r.location.lng)
        if not sn:
            continue
        dist_km, path = _shortest_to_district(graph, district_id, sn)
        if path and dist_km < best_dist:
            best = r
            best_dist = dist_km
            best_path = path
    if best is None:
        return None
    return best, best_dist, best_path


@router.get("/available-ambulances", response_model=List[ResourceUnit])
async def get_available_ambulances():
    _seed_demo_resources()
    return [r for r in _RESOURCES.values() if r.type == ResourceType.AMBULANCE and r.available]


@router.get("/nearest-ambulance")
async def get_nearest_ambulance(district_id: str):
    try:
        _seed_demo_resources()
        sim = run_simulation(severity=Severity.MEDIUM)
        flooded = {z.district_id for z in sim.flood_zones if z.is_flooded}
        road = load_road_network()
        G = build_graph(road, flooded, set(), 1.0)
        result = _nearest_ambulance_to_district(district_id, G)
        if not result:
            return {"found": False}
        amb, dist_km, path = result
        eta_min = (dist_km / max(amb.speed_kmh, 5.0)) * 60.0
        coords = path_to_coordinates(G, path)
        return {
            "found": True,
            "ambulance": amb.model_dump(),
            "distance_km": round(dist_km, 2),
            "estimated_time_minutes": round(eta_min, 1),
            "path": [c.model_dump() for c in coords],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
