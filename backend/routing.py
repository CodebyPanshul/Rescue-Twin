"""
Evacuation Routing Engine for Rescue Twin.
Uses Dijkstra's algorithm to find optimal evacuation routes.
"""
import json
import math
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional

import networkx as nx

from models import (
    Coordinate, District, Shelter, FloodZone, EvacuationRoute
)
from simulation import load_districts


def haversine_distance(coord1: Coordinate, coord2: Coordinate) -> float:
    """
    Calculate great-circle distance between two coordinates in kilometers.
    """
    R = 6371  # Earth's radius in km
    
    lat1, lon1 = math.radians(coord1.lat), math.radians(coord1.lng)
    lat2, lon2 = math.radians(coord2.lat), math.radians(coord2.lng)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def load_road_network() -> Dict:
    """Load road network data from JSON file."""
    data_path = Path(__file__).parent / "data" / "districts.json"
    with open(data_path, "r") as f:
        data = json.load(f)
    return data.get("road_network", {"nodes": [], "edges": []})


def build_graph(
    road_network: Dict,
    flooded_districts: Set[str],
    closed_districts: Set[str] = set(),
    traffic_multiplier: float = 1.0,
    depth_by_district: Optional[Dict[str, float]] = None,
    elevation_by_district: Optional[Dict[str, float]] = None,
    block_depth_m: float = 0.7,
    high_clearance_m: float = 0.3,
) -> nx.Graph:
    """
    Build a weighted graph from road network, excluding flooded roads.
    
    Args:
        road_network: Dict with nodes and edges
        flooded_districts: Set of district IDs that are flooded
    
    Returns:
        NetworkX Graph with edge weights as distance
    """
    G = nx.Graph()
    
    # Add nodes
    for node in road_network["nodes"]:
        G.add_node(
            node["id"],
            lat=node["lat"],
            lng=node["lng"],
            district_id=node.get("district_id"),
            is_shelter=node.get("is_shelter", False)
        )
    
    closed = set(closed_districts)
    deg = {}
    for e in road_network["edges"]:
        a = e["from"]
        b = e["to"]
        deg[a] = deg.get(a, 0) + 1
        deg[b] = deg.get(b, 0) + 1
    for edge in road_network["edges"]:
        from_node = edge["from"]
        to_node = edge["to"]
        
        from_district = G.nodes[from_node].get("district_id")
        to_district = G.nodes[to_node].get("district_id")
        from_flooded = from_district in flooded_districts
        to_flooded = to_district in flooded_districts
        from_is_shelter = G.nodes[from_node].get("is_shelter", False)
        to_is_shelter = G.nodes[to_node].get("is_shelter", False)
        if from_district in closed or to_district in closed:
            continue
        if (from_flooded and not to_is_shelter) or (to_flooded and not from_is_shelter):
            if from_flooded and to_flooded:
                continue  # Both endpoints flooded, skip
        if depth_by_district:
            d_from = depth_by_district.get(from_district, 0.0)
            d_to = depth_by_district.get(to_district, 0.0)
            if (d_from >= block_depth_m and not from_is_shelter) or (d_to >= block_depth_m and not to_is_shelter):
                continue
        
        coord1 = Coordinate(lat=G.nodes[from_node]["lat"], lng=G.nodes[from_node]["lng"])
        coord2 = Coordinate(lat=G.nodes[to_node]["lat"], lng=G.nodes[to_node]["lng"])
        distance = haversine_distance(coord1, coord2)
        
        penalty = 1.0
        if from_flooded or to_flooded:
            penalty *= 2.0  # generic flood penalty
        if depth_by_district:
            d_from = depth_by_district.get(from_district, 0.0)
            d_to = depth_by_district.get(to_district, 0.0)
            if d_from > 0 or d_to > 0:
                penalty *= 1.2
            high_clearance = (high_clearance_m <= d_from < block_depth_m) or (high_clearance_m <= d_to < block_depth_m)
        else:
            high_clearance = False
        if elevation_by_district and distance > 0:
            e1 = elevation_by_district.get(from_district)
            e2 = elevation_by_district.get(to_district)
            if e1 is not None and e2 is not None:
                slope = abs(e2 - e1) / (distance * 1000)  # rise per meter
                penalty *= (1.0 + min(slope / 0.05, 0.5))
        if traffic_multiplier and traffic_multiplier > 0:
            penalty *= max(traffic_multiplier, 0.1)
        d_from_deg = deg.get(from_node, 1)
        d_to_deg = deg.get(to_node, 1)
        inter_pen = 1.0 + min(max(d_from_deg - 2, 0), 4) * 0.05
        inter_pen = max(inter_pen, 1.0 + min(max(d_to_deg - 2, 0), 4) * 0.05)
        penalty *= inter_pen
        
        G.add_edge(from_node, to_node, weight=distance * penalty, high_clearance=high_clearance)
    
    return G


def find_nearest_shelter(
    graph: nx.Graph,
    start_node: str,
    shelter_nodes: List[str]
) -> Tuple[Optional[str], Optional[float], Optional[List[str]]]:
    """
    Find the nearest reachable shelter using Dijkstra's algorithm.
    
    Returns:
        Tuple of (shelter_id, distance, path)
    """
    if start_node not in graph:
        return None, None, None
    
    try:
        # Compute shortest paths to all reachable nodes
        distances, paths = nx.single_source_dijkstra(graph, start_node)
        
        # Find closest shelter
        best_shelter = None
        best_distance = float('inf')
        best_path = None
        
        for shelter_id in shelter_nodes:
            if shelter_id in distances and distances[shelter_id] < best_distance:
                best_distance = distances[shelter_id]
                best_shelter = shelter_id
                best_path = paths[shelter_id]
        
        if best_shelter:
            return best_shelter, best_distance, best_path
        
    except nx.NetworkXNoPath:
        pass
    
    return None, None, None


def path_to_coordinates(graph: nx.Graph, path: List[str]) -> List[Coordinate]:
    """Convert node path to coordinate list."""
    coordinates = []
    for node_id in path:
        node = graph.nodes[node_id]
        coordinates.append(Coordinate(lat=node["lat"], lng=node["lng"]))
    return coordinates


def find_nearest_node_id(graph: nx.Graph, lat: float, lng: float) -> Optional[str]:
    best = None
    best_d = float("inf")
    for nid, data in graph.nodes(data=True):
        dy = data.get("lat")
        dx = data.get("lng")
        if dy is None or dx is None:
            continue
        d = (dy - lat) * (dy - lat) + (dx - lng) * (dx - lng)
        if d < best_d:
            best_d = d
            best = nid
    return best


def compute_evacuation_routes(
    flood_zones: List[FloodZone],
    shelters: List[Shelter]
) -> List[EvacuationRoute]:
    """
    Compute evacuation routes from flooded districts to shelters.
    Returns multiple alternatives per district (best + up to 2 alternatives).
    
    Args:
        flood_zones: List of flood zone assessments
        shelters: List of available shelters
    
    Returns:
        List of evacuation routes
    """
    road_network = load_road_network()
    
    # Get flooded district IDs
    flooded_districts = {fz.district_id for fz in flood_zones if fz.is_flooded}
    
    # Build graph excluding flooded roads and applying depth penalties
    depth_by = {fz.district_id: fz.flood_depth for fz in flood_zones}
    elev_by = {d.id: d.elevation for d in load_districts()}
    graph = build_graph(road_network, flooded_districts, set(), 1.0, depth_by, elev_by)
    
    shelter_nodes = [node["id"] for node in road_network["nodes"] if node.get("is_shelter")]
    shelter_map = {s.id: s for s in shelters}
    
    routes = []
    
    # For each at-risk district, find evacuation routes
    for fz in flood_zones:
        if fz.risk_score < 0.3:  # Skip very low risk areas
            continue
        
        # Find district's entry point in road network
        district_nodes = [
            node["id"] for node in road_network["nodes"]
            if node.get("district_id") == fz.district_id and not node.get("is_shelter")
        ]
        
        if not district_nodes:
            continue
        
        start_node = district_nodes[0]
        try:
            distances, paths = nx.single_source_dijkstra(graph, start_node)
        except nx.NetworkXNoPath:
            continue
        best_sid = None
        best_dist = float("inf")
        for sid in shelter_nodes:
            if sid in distances and distances[sid] < best_dist:
                best_dist = distances[sid]
                best_sid = sid
        if best_sid is None:
            continue
        K = 3
        k_paths = []
        try:
            gen = nx.shortest_simple_paths(graph, start_node, best_sid, weight="weight")
            for p in gen:
                k_paths.append(p)
                if len(k_paths) >= K:
                    break
        except nx.NetworkXNoPath:
            continue
        for rank, path in enumerate(k_paths):
            dist = 0.0
            for u, v in zip(path[:-1], path[1:]):
                dist += (graph.get_edge_data(u, v) or {}).get("weight", 0.0)
            coordinates = path_to_coordinates(graph, path)
            time_minutes = (dist / 30) * 60 if dist else 0
            is_accessible = True
            for node_id in path[1:-1]:
                node_district = graph.nodes[node_id].get("district_id")
                if node_district in flooded_districts:
                    for fz_check in flood_zones:
                        if fz_check.district_id == node_district and fz_check.flood_depth > 0.5:
                            is_accessible = False
                            break
                if not is_accessible:
                    break
            to_shelter_name = shelter_map.get(best_sid).name if best_sid in shelter_map else None
            vehicle_note = None
            for u, v in zip(path[:-1], path[1:]):
                ed = graph.get_edge_data(u, v) or {}
                if ed.get("high_clearance"):
                    vehicle_note = "High-clearance only"
                    break
            routes.append(EvacuationRoute(
                from_district=fz.district_id,
                to_shelter=best_sid,
                to_shelter_name=to_shelter_name,
                path=coordinates,
                distance_km=round(dist, 2) if dist else 0,
                estimated_time_minutes=round(time_minutes, 1),
                is_accessible=is_accessible,
                rank=rank,
                vehicle_note=vehicle_note
            ))
    
    return routes


def get_alternative_routes(
    district_id: str,
    flood_zones: List[FloodZone],
    shelters: List[Shelter],
    excluded_shelters: Set[str] = None
) -> List[EvacuationRoute]:
    """
    Get alternative evacuation routes for a district.
    Useful for what-if scenarios.
    """
    if excluded_shelters is None:
        excluded_shelters = set()
    
    road_network = load_road_network()
    flooded_districts = {fz.district_id for fz in flood_zones if fz.is_flooded}
    graph = build_graph(road_network, flooded_districts)
    
    # Get available shelter nodes
    shelter_nodes = [
        node["id"] for node in road_network["nodes"]
        if node.get("is_shelter") and node["id"] not in excluded_shelters
    ]
    
    routes = []
    district_nodes = [
        node["id"] for node in road_network["nodes"]
        if node.get("district_id") == district_id and not node.get("is_shelter")
    ]
    
    if not district_nodes:
        return routes
    
    start_node = district_nodes[0]
    
    # Find routes to all reachable shelters
    try:
        distances, paths = nx.single_source_dijkstra(graph, start_node)
        
        for shelter_id in shelter_nodes:
            if shelter_id in distances:
                coordinates = path_to_coordinates(graph, paths[shelter_id])
                time_minutes = (distances[shelter_id] / 30) * 60
                
                routes.append(EvacuationRoute(
                    from_district=district_id,
                    to_shelter=shelter_id,
                    path=coordinates,
                    distance_km=round(distances[shelter_id], 2),
                    estimated_time_minutes=round(time_minutes, 1),
                    is_accessible=True
                ))
    except nx.NetworkXNoPath:
        pass
    
    # Sort by distance
    routes.sort(key=lambda r: r.distance_km)
    return routes
