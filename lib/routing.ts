import {
  bearingDeg,
  compassTr,
  distanceM,
  lerpLatLng,
  pathLengthM,
  turnAngle,
} from "./geo";
import { LANDMARKS } from "./mockData";
import type {
  LatLng,
  RouteDestination,
  RoutePlan,
  RouteStep,
  StepIcon,
} from "./types";

const WALK_SPEED_MPS = 1.35;
/** Metro + aktarma ortalaması, ~25 km/sa. */
const TRANSIT_SPEED_MPS = 7;
/** Bekleme ve aktarma payı. */
const TRANSIT_OVERHEAD_MIN = 9;
/** Bu mesafenin üzerinde yürüyüş yerine toplu taşıma tarif edilir. */
const TRANSIT_MIN_M = 1500;
const STOP_WALK_M = 260;
const ARRIVAL_WALK_M = 320;
const MIN_SEGMENT_M = 15;

/** `from` noktasından `to` yönünde verilen metre kadar ilerlemiş nokta. */
function pointToward(from: LatLng, to: LatLng, meters: number): LatLng {
  const total = distanceM(from, to);
  if (total === 0) return from;
  return lerpLatLng(from, to, Math.min(1, meters / total));
}

/**
 * Aynı referans noktasının üst üste iki adımda tekrarlanmaması için, daha önce
 * kullanılmış mekanları atlayan bir seçici üretir.
 */
function createLandmarkPicker(excludeId?: string) {
  const used = new Set<string>(excludeId ? [excludeId] : []);
  return (point: LatLng): string => {
    const sorted = [...LANDMARKS].sort(
      (a, b) => distanceM(point, a.position) - distanceM(point, b.position),
    );
    const picked = sorted.find((landmark) => !used.has(landmark.id)) ?? sorted[0];
    if (!picked) return "ana cadde";
    used.add(picked.id);
    return picked.shortName;
  };
}

function turnKind(angle: number): { icon: StepIcon; word: string } {
  if (angle < -25) return { icon: "left", word: "sola dön" };
  if (angle > 25) return { icon: "right", word: "sağa dön" };
  return { icon: "straight", word: "düz ilerle" };
}

/** Tek köşeli, sokak dokusuna yakın bir yürüyüş güzergâhı. */
function walkPath(from: LatLng, to: LatLng): LatLng[] {
  const alongLng = { lat: from.lat, lng: to.lng };
  const alongLat = { lat: to.lat, lng: from.lng };
  const corner =
    distanceM(from, alongLng) >= distanceM(from, alongLat) ? alongLng : alongLat;

  const path = [from];
  if (
    distanceM(from, corner) >= MIN_SEGMENT_M &&
    distanceM(corner, to) >= MIN_SEGMENT_M
  ) {
    path.push(corner);
  }
  path.push(to);
  return path;
}

function buildWalkSteps(
  path: LatLng[],
  destination: RouteDestination,
): RouteStep[] {
  const steps: RouteStep[] = [];
  const landmarkNear = createLandmarkPicker(destination.id);

  for (let i = 1; i < path.length; i += 1) {
    const start = path[i - 1];
    const end = path[i];
    const legDistance = distanceM(start, end);
    const legBearing = bearingDeg(start, end);
    const isLastLeg = i === path.length - 1;

    if (i === 1) {
      steps.push({
        id: `step-${i}`,
        icon: "start",
        instruction: `Mevcut konumundan ${compassTr(
          legBearing,
        )} yönüne dönüp ${Math.round(legDistance)} m yürü.`,
        distanceM: legDistance,
      });
      continue;
    }

    const turn = turnKind(turnAngle(bearingDeg(path[i - 2], start), legBearing));
    const landmark = landmarkNear(isLastLeg ? end : start);

    steps.push({
      id: `step-${i}`,
      icon: turn.icon,
      instruction: isLastLeg
        ? `${landmark} hizasında ${turn.word} ve ${Math.round(
            legDistance,
          )} m ilerle. ${destination.arrivalNote}`
        : `${landmark} yanından ${turn.word}, ${Math.round(legDistance)} m yürü.`,
      distanceM: legDistance,
    });
  }

  return steps;
}

/** Şehrin öbür ucundaki bir masa için kaba toplu taşıma tarifi. */
function buildTransitSteps(
  path: LatLng[],
  destination: RouteDestination,
  transitDistanceM: number,
): RouteStep[] {
  const [from, stop, alight] = path;
  const transitMinutes = Math.round(
    TRANSIT_OVERHEAD_MIN + transitDistanceM / TRANSIT_SPEED_MPS / 60,
  );

  return [
    {
      id: "step-stop",
      icon: "start",
      instruction: `En yakın durağa doğru ${compassTr(
        bearingDeg(from, stop),
      )} yönünde ${Math.round(distanceM(from, stop))} m yürü.`,
      distanceM: distanceM(from, stop),
    },
    {
      id: "step-transit",
      icon: "transit",
      instruction: `Toplu taşıma ile ${compassTr(
        bearingDeg(stop, alight),
      )} yönüne ${(transitDistanceM / 1000).toFixed(1)} km ilerle (~${transitMinutes} dk, aktarma payı dahil).`,
      distanceM: transitDistanceM,
    },
    {
      id: "step-arrival-walk",
      icon: "straight",
      instruction: `İniş noktasından ${Math.round(
        distanceM(alight, destination.point),
      )} m yürü. ${destination.arrivalNote}`,
      distanceM: distanceM(alight, destination.point),
    },
  ];
}

export function buildRoute(
  from: LatLng,
  destination: RouteDestination,
): RoutePlan {
  const directDistance = distanceM(from, destination.point);
  const transit = directDistance >= TRANSIT_MIN_M;

  const path = transit
    ? [
        from,
        pointToward(from, destination.point, STOP_WALK_M),
        pointToward(destination.point, from, ARRIVAL_WALK_M),
        destination.point,
      ]
    : walkPath(from, destination.point);

  const totalDistanceM = pathLengthM(path);

  const steps = transit
    ? buildTransitSteps(
        path,
        destination,
        distanceM(path[1], path[2]),
      )
    : buildWalkSteps(path, destination);

  steps.push({
    id: "step-arrive",
    icon: "arrive",
    instruction: destination.precise
      ? `Hedefe ulaştın: ${destination.name}.`
      : `Odak alanına ulaştın: ${destination.name}. Tam konum için bağlantı kurman gerekiyor.`,
    distanceM: 0,
  });

  const etaMinutes = transit
    ? Math.round(
        TRANSIT_OVERHEAD_MIN +
          (STOP_WALK_M + ARRIVAL_WALK_M) / WALK_SPEED_MPS / 60 +
          distanceM(path[1], path[2]) / TRANSIT_SPEED_MPS / 60,
      )
    : Math.round(totalDistanceM / WALK_SPEED_MPS / 60);

  return {
    id: `route-${destination.id}-${Date.now()}`,
    targetId: destination.id,
    targetName: destination.name,
    targetDetail: destination.detail,
    precise: destination.precise,
    transit,
    path,
    steps,
    totalDistanceM,
    etaMinutes: Math.max(1, etaMinutes),
  };
}

/** Yürüyüş ilerlemesine (0..1) karşılık gelen aktif adım indeksi. */
export function activeStepIndex(route: RoutePlan, progress: number): number {
  const walked = route.totalDistanceM * Math.min(Math.max(progress, 0), 1);
  let accumulated = 0;
  for (let i = 0; i < route.steps.length; i += 1) {
    accumulated += route.steps[i].distanceM;
    if (walked < accumulated) return i;
  }
  return route.steps.length - 1;
}
