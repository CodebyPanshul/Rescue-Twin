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
    flooded_districts: Set[str]
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
    
    # Add edges (roads), excluding flooded ones
    for edge in road_network["edges"]:
        from_node = edge["from"]
        to_node = edge["to"]
        
        # Check if either endpoint is in a flooded district
        from_district = G.nodes[from_node].get("district_id")
        to_district = G.nodes[to_node].get("district_id")
        
        # Skip edges in flooded districts (unless connecting to shelter)
        from_flooded = from_district in flooded_districts
        to_flooded = to_district in flooded_districts
        from_is_shelter = G.nodes[from_node].get("is_shelter", False)
        to_is_shelter = G.nodes[to_node].get("is_shelter", False)
        
        # Allow edge if it leads to a shelter, even in flooded area
        if (from_flooded and not to_is_shelter) or (to_flooded and not from_is_shelter):
            if from_flooded and to_flooded:
                continue  # Both endpoints flooded, skip
        
        # Calculate distance as weight
        coord1 = Coordinate(lat=G.nodes[from_node]["lat"], lng=G.nodes[from_node]["lng"])
        coord2 = Coordinate(lat=G.nodes[to_node]["lat"], lng=G.nodes[to_node]["lng"])
        distance = haversine_distance(coord1, coord2)
        
        # Add flood penalty if partially flooded
        if from_flooded or to_flooded:
            distance *= 2.0  # Penalty for flooded routes
        
        G.add_edge(from_node, to_node, weight=distance)
    
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


def compute_evacuation_routes(
    flood_zones: List[FloodZone],
    shelters: List[Shelter]
) -> List[EvacuationRoute]:
    """
    Compute evacuation routes from flooded districts to nearest shelters.
    
    Args:
        flood_zones: List of flood zone assessments
        shelters: List of available shelters
    
    Returns:
        List of evacuation routes
    """
    road_network = load_road_network()
    
    # Get flooded district IDs
    flooded_districts = {fz.district_id for fz in flood_zones if fz.is_flooded}
    
    # Build graph excluding flooded roads
    graph = build_graph(road_network, flooded_districts)
    
    # Get shelter node IDs
    shelter_nodes = [node["id"] for node in road_network["nodes"] if node.get("is_shelter")]
    
    # Map shelter nodes to shelter info
    shelter_map = {s.id: s for s in shelters}
    
    routes = []
    
    # For each at-risk district, find evacuation route
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
        shelter_id, distance, path = find_nearest_shelter(graph, start_node, shelter_nodes)
        
        if shelter_id and path:
            coordinates = path_to_coordinates(graph, path)
            
            # Estimate time (assuming 30 km/h average speed in emergency)
            time_minutes = (distance / 30) * 60 if distance else 0
            
            # Check if route passes through heavily flooded areas
            is_accessible = True
            for node_id in path[1:-1]:  # Exclude start and end
                node_district = graph.nodes[node_id].get("district_id")
                if node_district in flooded_districts:
                    # Check flood depth
                    for fz_check in flood_zones:
                        if fz_check.district_id == node_district and fz_check.flood_depth > 0.5:
                            is_accessible = False
                            break
            
            routes.append(EvacuationRoute(
                from_district=fz.district_id,
                to_shelter=shelter_id,
                path=coordinates,
                distance_km=round(distance, 2) if distance else 0,
                estimated_time_minutes=round(time_minutes, 1),
                is_accessible=is_accessible
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
