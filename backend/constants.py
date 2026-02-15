"""
Shared constants and static data for Rescue Twin API.
"""

# District IDs to display names (Jammu & Kashmir)
DISTRICT_NAMES = {
    "d1": "Srinagar",
    "d2": "Ganderbal",
    "d3": "Budgam",
    "d4": "Anantnag",
    "d5": "Pulwama",
    "d6": "Baramulla",
    "d7": "Jammu",
    "d8": "Udhampur",
    "d9": "Kathua",
    "d10": "Kupwara",
}

# Zone seed data for resource optimization (zone_id, name, base_population, severity_score)
RESOURCE_OPTIMIZATION_ZONES = [
    ("d1", "Srinagar", 1200, 0.85),
    ("d2", "Ganderbal", 800, 0.72),
    ("d3", "Budgam", 600, 0.58),
    ("d4", "Anantnag", 1100, 0.78),
    ("d5", "Pulwama", 400, 0.45),
]
