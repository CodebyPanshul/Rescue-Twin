/**
 * Geo utilities: point-in-polygon, distance, district lookup, nearest shelter, safe-zone from simulation.
 */
import { DISTRICT_POLYGONS } from '../constants/mapData';

/** Point-in-polygon (ray casting). Polygon: array of [lat, lng]. Uses lng as x, lat as y. */
export function pointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;
  const x = lng;
  const y = lat;
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Get district id containing (lat, lng), or null. */
export function getDistrictAtPoint(lat, lng) {
  for (const [districtId, polygon] of Object.entries(DISTRICT_POLYGONS)) {
    if (pointInPolygon(lat, lng, polygon)) return districtId;
  }
  return null;
}

/** Get risk for a district from current simulation (flood or earthquake). Returns { riskScore, districtName, isSafe } or null. */
export function getZoneRiskForDistrict(simulationData, districtId) {
  if (!simulationData || !districtId) return null;
  const zones = simulationData.flood_zones || simulationData.earthquake_zones;
  if (!zones) return null;
  const zone = zones.find((z) => z.district_id === districtId);
  if (!zone) return null;
  const riskScore = zone.risk_score ?? zone.intensity_score ?? 0;
  const isSafe = riskScore < 0.2;
  return {
    riskScore,
    districtName: zone.district_name,
    isSafe,
  };
}

/** Haversine distance in km. */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Get nearest shelter from user position. Returns { shelter, distanceKm } or null. */
export function getNearestShelter(userLat, userLng, shelters) {
  if (!shelters?.length || userLat == null || userLng == null) return null;
  let nearest = null;
  let minDist = Infinity;
  for (const shelter of shelters) {
    const lat = shelter.location?.lat;
    const lng = shelter.location?.lng;
    if (lat == null || lng == null) continue;
    const d = haversineDistance(userLat, userLng, lat, lng);
    if (d < minDist) {
      minDist = d;
      nearest = shelter;
    }
  }
  return nearest ? { shelter: nearest, distanceKm: Math.round(minDist * 10) / 10 } : null;
}

/** Build Google Maps directions URL from origin to destination (lat, lng). */
export function getDirectionsUrl(originLat, originLng, destLat, destLng) {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
}
