import type { LatLng, MapPin, PersonPin, RouteDestination } from "./types";

/**
 * Konum gizliliğinin tek kaynağı. Harita, eşleştirme motoru ve detay kartı
 * aynı fonksiyonlardan beslendiği için hiçbir yüzeyde tam konum sızmaz.
 *
 * Kural: kişisel GPS noktası hiçbir zaman doğrudan haritaya yazılmaz.
 * Bir kişi ya bulunduğu kamusal mekan (masası) üzerinden ya da şeffaf bir
 * odak alanı olarak görünür; tam konum yalnızca karşılıklı NSosyal bağlantısı
 * onaylandıktan sonra açılır.
 */

export function isConnectedPerson(
  person: PersonPin,
  connectedIds: string[],
): boolean {
  return person.isConnected || connectedIds.includes(person.id);
}

/** Mekanlar kamusaldır; kişiler yalnızca bağlantı sonrası net konum açar. */
export function revealsExactLocation(
  pin: MapPin,
  connectedIds: string[],
): boolean {
  if (pin.kind !== "person") return true;
  return isConnectedPerson(pin, connectedIds);
}

/** Haritada ve tüm mesafe hesaplarında kullanılacak konum. */
export function displayPosition(pin: MapPin, connectedIds: string[]): LatLng {
  if (pin.kind === "person" && !isConnectedPerson(pin, connectedIds)) {
    return pin.focusArea.center;
  }
  return pin.position;
}

/** "Elif Yaman" -> "Elif Y." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/** Harita etiketi: "Elif Y. • Moda çevresinde" */
export function fuzzyMapLabel(person: PersonPin): string {
  return `${shortName(person.name)} • ${person.focusArea.label}`;
}

export function resolveDestination(
  pin: MapPin,
  connectedIds: string[],
): RouteDestination {
  if (pin.kind === "person") {
    if (!isConnectedPerson(pin, connectedIds)) {
      return {
        id: pin.id,
        name: `${shortName(pin.name)} · ${pin.focusArea.label}`,
        detail: `Yaklaşık alan · ~${pin.focusArea.radius} m`,
        point: pin.focusArea.center,
        precise: false,
        arrivalNote: `${shortName(pin.name)} bu alanda çalışıyor.`,
      };
    }
    return {
      id: pin.id,
      name: pin.name,
      detail: pin.workingOn,
      point: pin.position,
      precise: true,
      arrivalNote: `${pin.name} burada bekliyor.`,
    };
  }

  return {
    id: pin.id,
    name: pin.table ? `${pin.name} — ${pin.table.title}` : pin.name,
    detail: pin.district,
    point: pin.position,
    precise: true,
    arrivalNote: pin.table
      ? `${pin.name} içindeki masa seni bekliyor.`
      : `${pin.name} tam karşında.`,
  };
}
