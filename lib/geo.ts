import type { LatLng } from "./types";

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in meters. */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Initial bearing from `a` to `b`, normalized to 0..360. */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Signed turn angle between two bearings: negative = left, positive = right. */
export function turnAngle(fromBearing: number, toBearing: number): number {
  return ((toBearing - fromBearing + 540) % 360) - 180;
}

export function pathLengthM(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) total += distanceM(path[i - 1], path[i]);
  return total;
}

export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Point at `progress` (0..1) of the total path length. */
export function pointAlongPath(path: LatLng[], progress: number): LatLng {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1) return path[0];
  const total = pathLengthM(path);
  const target = Math.min(Math.max(progress, 0), 1) * total;
  let walked = 0;
  for (let i = 1; i < path.length; i += 1) {
    const seg = distanceM(path[i - 1], path[i]);
    if (walked + seg >= target) {
      const t = seg === 0 ? 0 : (target - walked) / seg;
      return lerpLatLng(path[i - 1], path[i], t);
    }
    walked += seg;
  }
  return path[path.length - 1];
}

const COMPASS_TR = [
  "kuzey",
  "kuzeydoğu",
  "doğu",
  "güneydoğu",
  "güney",
  "güneybatı",
  "batı",
  "kuzeybatı",
];

export function compassTr(bearing: number): string {
  const index = Math.round(((bearing % 360) + 360) % 360 / 45) % 8;
  return COMPASS_TR[index];
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  return `${h} sa ${minutes % 60} dk`;
}
