export type LatLng = { lat: number; lng: number };

/**
 * Mekan türü. Harita tek tip pin kullanır; tür yalnızca ikonu ve
 * "Kafe / Kütüphane / Atölye" etiketini belirler.
 */
export type VenueKind = "cafe" | "library" | "workshop" | "stand" | "campus";

/** Masada oturan geliştirici. Kişisel konum taşımaz; mekanın konumunu paylaşır. */
export interface TableParticipant {
  id: string;
  name: string;
  initials: string;
  handle: string;
  /** "ROS", "C++", "Computer Vision" */
  skills: string[];
  /** Masayı açan kişi. */
  isHost?: boolean;
}

/** Masanın açık çağrısı: kaç sandalye boş ve ne tür destek aranıyor. */
export interface TableRequest {
  /** "Masamızda 1 boş sandalye var, tanışmak isteyen gelebilir." */
  note: string;
  openSeats: number;
  skills: string[];
}

/** Bir mekanda açılmış canlı çalışma masası. */
export interface WorkTable {
  id: string;
  /** "Otonom İHA Proje Ekibi" */
  title: string;
  /** "Gömülü Sistem & Otonom Sürüş" */
  topic: string;
  participants: TableParticipant[];
  request?: TableRequest;
  /** 3 saatlik oturumun bitiş saati: "18:30" */
  endsAt: string;
  /** Kullanıcının kendi açtığı masa. */
  isMine?: boolean;
}

/**
 * Haritanın temel birimi: kafe, kütüphane, atölye, stant veya kampüs.
 * Konum her zaman kamusal mekan konumudur, bu yüzden paylaşılması güvenlidir.
 */
export interface WorkspacePin {
  kind: "workspace";
  id: string;
  venue: VenueKind;
  name: string;
  /** "Kadıköy", "TEKNOFEST Alanı" */
  district: string;
  glyph: string;
  position: LatLng;
  /** Mekan hakkında tek satır bilgi. */
  note: string;
  /** Kullanıcı burada masa açabilir mi? */
  hostsTables: boolean;
  table?: WorkTable;
}

/** Bağlantı kurulmamış kişiler için gösterilen şeffaf odak alanı. */
export interface FuzzyArea {
  /** Bulunma hâli: "Moda çevresinde" */
  label: string;
  center: LatLng;
  /** Metre cinsinden yarıçap (80-100 m). */
  radius: number;
}

/**
 * Bir mekana bağlı olmadan varlığını paylaşan geliştirici. Tam konum yalnızca
 * karşılıklı NSosyal bağlantısı onaylandıktan sonra haritaya yazılır.
 */
export interface PersonPin {
  kind: "person";
  id: string;
  name: string;
  initials: string;
  handle: string;
  title: string;
  skills: string[];
  /** Üzerinde çalıştığı konu. */
  workingOn: string;
  online: boolean;
  isConnected: boolean;
  focusArea: FuzzyArea;
  /** Yalnızca bağlantı onayından sonra kullanılır. */
  position: LatLng;
}

export type MapPin = WorkspacePin | PersonPin;

export type StepIcon =
  | "start"
  | "straight"
  | "left"
  | "right"
  | "transit"
  | "arrive";

export interface RouteStep {
  id: string;
  icon: StepIcon;
  instruction: string;
  distanceM: number;
}

/**
 * Rotanın varış noktası. Gizlilik nedeniyle bir kişinin tam konumu yerine
 * odak alanı hedeflenebilir (`precise: false`).
 */
export interface RouteDestination {
  id: string;
  name: string;
  detail?: string;
  point: LatLng;
  precise: boolean;
  arrivalNote: string;
}

export interface RoutePlan {
  id: string;
  targetId: string;
  targetName: string;
  targetDetail?: string;
  precise: boolean;
  /** Mesafe yürüyüşle değil toplu taşımayla kapatılıyorsa true. */
  transit: boolean;
  path: LatLng[];
  steps: RouteStep[];
  totalDistanceM: number;
  etaMinutes: number;
}

export interface CurrentUser {
  name: string;
  handle: string;
  initials: string;
  title: string;
  district: string;
  skills: string[];
  position: LatLng;
}

export interface AiMatch {
  pin: MapPin;
  score: number;
  reason: string;
  sharedSkills: string[];
}

/** Yeni masa formunun çıktısı. */
export interface NewTableDraft {
  venueId: string;
  topic: string;
  note: string;
}

export type NavTabId =
  | "feed"
  | "explore"
  | "teknomaps"
  | "notifications"
  | "messages"
  | "profile";

export type TopTabId = "trends" | "tags" | "news" | "teknomaps-live";
