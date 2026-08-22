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
  /** "Gömülü Yazılım Mühendisi" */
  title?: string;
  /** "ROS", "C++", "Computer Vision" */
  skills: string[];
  /** Masayı açan kişi. */
  isHost?: boolean;
  engineeringScore: number;
  scoreBreakdown: ScoreBreakdown;
  verifiedMetrics: VerifiedMetrics;
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
  /** Açık donanım imecesi: para değil dayanışma. */
  equipment?: EquipmentItem[];
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
  /** NSosyal Doğrulanmış Mühendislik Skoru (NES). */
  engineeringScore: number;
  scoreBreakdown: ScoreBreakdown;
  verifiedMetrics: VerifiedMetrics;
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
  /** Paylaşılan her cihaz veya kabul edilen imece için biriken teşekkür. */
  solidarityPoints: number;
  engineeringScore: number;
  scoreBreakdown: ScoreBreakdown;
  verifiedMetrics: VerifiedMetrics;
}

/** NES alt puanları: yarışma 60, donanım 25, kod 15. */
export interface ScorePillar {
  /** Kazanılan puan. */
  score: number;
  /** Kategorinin azami ağırlığı. */
  max: number;
  /** Tıklanınca açılan doğrulanmış kayıtlar. */
  records: string[];
}

export interface ScoreBreakdown {
  /** Resmî dereceler ve jüri puanı, azami 60. */
  competition: ScorePillar;
  /** Donanım imecesi ve garaj katkısı, azami 25. */
  hardware: ScorePillar;
  /** Doğrulanmış çıktı ve kod kalitesi, azami 15. */
  code: ScorePillar;
}

export interface VerifiedMetrics {
  /** Doğrulanmış sprint / çıktı döngüsü. */
  sprints: number;
  /** Açık cihaz ve şematik paylaşımı. */
  imeceCount: number;
  /** T3, TEKNOFEST, GitHub gibi kurum sayısı. */
  orgCount: number;
  /** Kurum adları; rozet alt metni. */
  verifiedInstitutions: string[];
}

/** Canlı masa oturumu: BLE yakınlık simülasyonu. */
export interface LiveSession {
  workspaceId: string;
  venueName: string;
  topic: string;
  startedAt: number;
  peers: Array<{ name: string; handle: string }>;
}

/** Açık donanım kategorisi. Ücret veya kiralama yok; yalnızca imece. */
export type EquipmentCategory =
  | "3D_PRINT"
  | "TEST_MEASURE"
  | "SOLDERING"
  | "ENERGY";

/**
 * Atölye veya takımın dayanışmaya açtığı cihaz.
 * Maddi kazanç alanı yoktur; konum kamusal mekan üzerinden görünür.
 */
export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  /** Takım veya atölye adı. */
  provider: string;
  note: string;
  isAvailable: boolean;
}

/** İmeceye cihaz ekleme formunun çıktısı. */
export interface NewEquipmentDraft {
  name: string;
  category: EquipmentCategory;
  venueId: string;
  note: string;
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
