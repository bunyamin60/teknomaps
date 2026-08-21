import { distanceM, formatDistance } from "./geo";
import { pinSkills, venueLabel } from "./mockData";
import { displayPosition, revealsExactLocation } from "./privacy";
import type { AiMatch, CurrentUser, MapPin } from "./types";

const normalize = (value: string) => value.toLocaleLowerCase("tr");

/** Ortak yetkinlikler; masa verisi birden çok kişiden geldiği için tekilleştirilir. */
function overlap(mine: string[], theirs: string[]): string[] {
  const wanted = new Set(mine.map(normalize));
  const seen = new Set<string>();
  return theirs.filter((skill) => {
    const key = normalize(skill);
    if (!wanted.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function reasonFor(pin: MapPin, meters: number, approximate: boolean): string {
  const distance = `${approximate ? "~" : ""}${formatDistance(meters)}`;
  if (pin.kind === "person") {
    return `${pin.title} · ${distance} · ${pin.workingOn}`;
  }
  const seats = pin.table?.request?.openSeats ?? 0;
  return `${venueLabel(pin)} · ${distance} · ${
    seats > 0 ? `${seats} boş sandalye` : "masa dolu"
  }`;
}

/**
 * Yetkinlik kesişimi + yakınlık + boş sandalye üzerinden basit bir skorlama.
 * Mesafe, bağlantı kurulmamış kişiler için tam konumdan değil odak alanından
 * hesaplanır; böylece öneri listesi de konum sızdırmaz.
 */
export function findMatches(
  user: CurrentUser,
  pins: MapPin[],
  connectedIds: string[] = [],
  limit = 3,
): AiMatch[] {
  return pins
    .filter((pin) =>
      pin.kind === "person" ? true : Boolean(pin.table) && !pin.table?.isMine,
    )
    .map((pin) => {
      const shared = overlap(user.skills, pinSkills(pin));
      const approximate = !revealsExactLocation(pin, connectedIds);
      const meters = distanceM(
        user.position,
        displayPosition(pin, connectedIds),
      );
      const openSeats =
        pin.kind === "workspace" ? (pin.table?.request?.openSeats ?? 0) : 0;
      const score = Math.min(
        99,
        Math.round(
          shared.length * 24 +
            Math.max(0, 24 - meters / 60) +
            Math.min(8, openSeats * 4) +
            (pin.kind === "person" && pin.online ? 5 : 0),
        ),
      );

      return {
        pin,
        score,
        sharedSkills: shared,
        reason: reasonFor(pin, meters, approximate),
      } satisfies AiMatch;
    })
    .filter((match) => match.sharedSkills.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
