import os
import math
import json
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional
import httpx
from models_intelligence import LiveFloodSnapshot, RiskLevel
from constants import DISTRICT_NAMES
from simulation import load_districts


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _risk_level_from_score(score: float) -> RiskLevel:
    if score >= 0.75:
        return RiskLevel.CRITICAL
    if score >= 0.5:
        return RiskLevel.HIGH
    if score >= 0.25:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def _centroid(coords: List[Tuple[float, float]]) -> Tuple[float, float]:
    s_lat = 0.0
    s_lng = 0.0
    n = 0
    for c in coords:
        lat, lng = c
        s_lat += lat
        s_lng += lng
        n += 1
    if n == 0:
        return 0.0, 0.0
    return s_lat / n, s_lng / n


def _parse_geojson_polygons(data: Dict[str, Any]) -> List[List[Tuple[float, float]]]:
    out: List[List[Tuple[float, float]]] = []
    feats = []
    if data.get("type") == "FeatureCollection":
        feats = data.get("features", [])
    elif data.get("type") in ("Feature", "Polygon", "MultiPolygon"):
        feats = [{"type": "Feature", "geometry": data}]
    for f in feats:
        g = f.get("geometry", {})
        gtype = g.get("type")
        coords = g.get("coordinates", [])
        if gtype == "Polygon":
            ring = coords[0] if coords else []
            poly = []
            for p in ring:
                lng, lat = p[0], p[1]
                poly.append((lat, lng))
            if poly:
                out.append(poly)
        elif gtype == "MultiPolygon":
            for polycoords in coords:
                ring = polycoords[0] if polycoords else []
                poly = []
                for p in ring:
                    lng, lat = p[0], p[1]
                    poly.append((lat, lng))
                if poly:
                    out.append(poly)
    return out


def _fetch_json(url: str) -> Any:
    if not url:
        raise ValueError("empty url")
    if url.startswith("file://"):
        path = url[len("file://") :]
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    if "://" not in url and os.path.exists(url):
        with open(url, "r", encoding="utf-8") as f:
            return json.load(f)
    with httpx.Client(timeout=10.0) as client:
        r = client.get(url)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if "application/json" in ct or r.text.strip().startswith("{") or r.text.strip().startswith("["):
            return r.json()
        return json.loads(r.text)


def _fetch_cwc() -> Dict[str, Any]:
    url = os.environ.get("CWC_API_URL", "").strip()
    if not url:
        return {}
    data = _fetch_json(url)
    readings = data if isinstance(data, list) else data.get("readings") or data.get("data") or []
    levels = []
    rainfall = []
    stations = []
    for rec in readings:
        wl = rec.get("water_level_m") or rec.get("waterLevel") or rec.get("wl") or rec.get("value")
        rf = rec.get("rainfall_mm_hr") or rec.get("rainfall") or rec.get("rf")
        name = rec.get("station") or rec.get("name") or rec.get("site") or ""
        wl_f = None
        rf_f = None
        if wl is not None:
            try:
                wl_f = float(wl)
                levels.append(wl_f)
            except Exception:
                pass
        if rf is not None:
            try:
                rf_f = float(rf)
                rainfall.append(rf_f)
            except Exception:
                pass
        if name:
            stations.append({"station": str(name), "water_level_m": wl_f, "rainfall_mm_hr": rf_f})
    wl_val = max(levels) if levels else None
    rf_val = max(rainfall) if rainfall else None
    return {"water_level_m": wl_val, "rainfall_intensity_mm_hr": rf_val, "stations": stations}


def _fetch_sentinel() -> Dict[str, Any]:
    url = os.environ.get("SENTINEL_FLOOD_GEOJSON_URL", "").strip()
    if not url:
        return {}
    data = _fetch_json(url)
    polys = _parse_geojson_polygons(data)
    if not polys:
        return {}
    cents = [_centroid(p) for p in polys]
    c_lat = sum(c[0] for c in cents) / len(cents)
    c_lng = sum(c[1] for c in cents) / len(cents)
    r = 0.0
    for p in polys:
        for v in p:
            d = _haversine_km(c_lat, c_lng, v[0], v[1])
            if d > r:
                r = d
    districts = load_districts()
    zones = []
    for d in districts:
        dist = min(_haversine_km(d.center.lat, d.center.lng, c[0], c[1]) for c in cents)
        inten = 0.0
        if r > 0:
            inten = max(0.0, 1.0 - (dist / (r * 2)))
        zones.append({"district_id": d.id, "district_name": DISTRICT_NAMES.get(d.id, d.id), "intensity": round(inten, 3)})
    return {"radius_km": r, "zones": zones}


def _fetch_legacy() -> Optional[Dict[str, Any]]:
    url = os.environ.get("FLOOD_LIVE_URL", "").strip()
    if not url:
        return None
    try:
        data = _fetch_json(url)
    except Exception:
        return None
    wl = data.get("water_level_m") or data.get("water_level") or data.get("waterLevel")
    rain = data.get("rainfall_intensity_mm_hr") or data.get("rainfall") or data.get("rainfall_mmhr")
    radius = data.get("flood_spread_radius_km") or data.get("radius_km") or data.get("radius")
    zones = data.get("zone_heatmap") or data.get("zones") or []
    out = {}
    if wl is not None:
        out["water_level_m"] = wl
    if rain is not None:
        out["rainfall_intensity_mm_hr"] = rain
    if radius is not None:
        out["radius_km"] = radius
    out["zones"] = zones
    return out


def get_live_snapshot() -> LiveFloodSnapshot:
    cwc = _fetch_cwc()
    sentinel = _fetch_sentinel()
    legacy = None
    wl = cwc.get("water_level_m")
    rain = cwc.get("rainfall_intensity_mm_hr")
    radius = sentinel.get("radius_km")
    zones = sentinel.get("zones") or []
    if wl is None and rain is None and radius is None and not zones:
        legacy = _fetch_legacy()
        if legacy:
            wl = legacy.get("water_level_m")
            rain = legacy.get("rainfall_intensity_mm_hr")
            radius = legacy.get("radius_km")
            zones = legacy.get("zones") or []
        else:
            raise RuntimeError("No real-time sources configured. Set CWC_API_URL and/or SENTINEL_FLOOD_GEOJSON_URL (or FLOOD_LIVE_URL for a unified feed).")
    wl = float(wl) if wl is not None else 0.0
    rain = float(rain) if rain is not None else 0.0
    radius = float(radius) if radius is not None else 0.0
    wl_n = min(wl / 6.0, 1.0)
    rain_n = min(rain / 120.0, 1.0)
    rad_n = min(radius / 15.0, 1.0)
    w_wl, w_rain, w_rad = 0.5, 0.3, 0.2
    score = (wl_n * w_wl) + (rain_n * w_rain) + (rad_n * w_rad)
    level = _risk_level_from_score(score)
    stations = cwc.get("stations") or []
    def station_key(s):
        wl_s = s.get("water_level_m") or 0.0
        rf_s = s.get("rainfall_mm_hr") or 0.0
        return max(float(wl_s), float(rf_s))
    stations_sorted = sorted(stations, key=station_key, reverse=True)[:3]
    return LiveFloodSnapshot(
        water_level_m=round(wl, 2),
        rainfall_intensity_mm_hr=round(rain, 2),
        flood_spread_radius_km=round(radius, 2),
        risk_forecast_30min=level,
        risk_score=round(score, 3),
        risk_level_label=level.value.capitalize(),
        risk_factors={
            "weights": {"water_level": w_wl, "rainfall": w_rain, "extent_radius": w_rad},
            "normalized": {"water_level": round(wl_n, 3), "rainfall": round(rain_n, 3), "extent_radius": round(rad_n, 3)},
            "contribution": {
                "water_level": round(wl_n * w_wl, 3),
                "rainfall": round(rain_n * w_rain, 3),
                "extent_radius": round(rad_n * w_rad, 3),
            },
        },
        timestamp=datetime.utcnow().isoformat() + "Z",
        zone_heatmap=zones,
        stations=stations_sorted,
    )
