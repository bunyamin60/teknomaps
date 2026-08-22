import { NES_MAX } from "./nes";
import type {
  CurrentUser,
  EquipmentCategory,
  EquipmentItem,
  MapPin,
  PersonPin,
  ScoreBreakdown,
  ScorePillar,
  TableParticipant,
  VenueKind,
  VerifiedMetrics,
  WorkTable,
  WorkspacePin,
} from "./types";

/**
 * Mat gece paleti. Parlak halkalar ve renk cümbüşü yerine üç ton:
 * canlı masalar NSosyal mavisi, kişiler açık mavi, boş mekanlar arduvaz grisi.
 */
export const PALETTE = {
  /** Uygulama zemini */
  shell: "#0F141C",
  /** Harita ve panel yüzeyi */
  surface: "#151B26",
  /** Aktif çalışma noktası */
  accent: "#1D9BF0",
  /** Varlığını paylaşan kişi */
  accentSoft: "#38BDF8",
  /** Boş mekan, ikincil bilgi */
  muted: "#64748B",
  mutedSoft: "#94A3B8",
  text: "#F1F5F9",
} as const;

export const VENUE_LABELS: Record<VenueKind, string> = {
  cafe: "Kafe",
  library: "Kütüphane",
  workshop: "Atölye",
  stand: "Stant",
  campus: "Kampüs",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  "3D_PRINT": "3D Baskı",
  TEST_MEASURE: "Test & Ölçüm",
  SOLDERING: "Lehimleme",
  ENERGY: "Enerji",
};

/** Arama çubuğunun cihaz adının ötesinde yakaladığı imece anahtarları. */
const EQUIPMENT_SEARCH_ALIASES: Record<EquipmentCategory, string[]> = {
  "3D_PRINT": ["3d yazıcı", "3d printer", "filament", "baskı"],
  TEST_MEASURE: ["osiloskop", "oscilloscope", "ölçüm", "multimetre", "analizör"],
  SOLDERING: ["havya", "lehim", "sıcak hava", "istasyon"],
  ENERGY: ["lipo", "şarj", "güç kaynağı", "batarya"],
};

export const EQUIPMENT_HOST_VENUES: VenueKind[] = [
  "workshop",
  "stand",
  "campus",
];

export const ORGS = ["T3 Vakfı", "TEKNOFEST", "GitHub"] as const;

function sprintMetrics(
  sprints: number,
  imeceCount: number,
  institutions: string[] = ["T3 Vakfı", "TEKNOFEST", "GitHub"],
): VerifiedMetrics {
  return {
    sprints,
    imeceCount,
    orgCount: institutions.length,
    verifiedInstitutions: institutions,
  };
}

export const CURRENT_USER: CurrentUser = {
  name: "Bünyamin K.",
  handle: "@bunyamin.dev",
  initials: "BK",
  title: "Gömülü Yazılım Geliştirici · Deneyap Mezunu",
  district: "Kadıköy",
  skills: ["Gömülü Yazılım", "ROS", "PCB", "STM32"],
  position: { lat: 40.989, lng: 29.0265 },
  solidarityPoints: 14,
  ...nesCard(
    C(56, [
      "TEKNOFEST 2025 Finalisti",
      "T3 KYS Mentör Kaydı",
    ]),
    H(24, [
      "12 Açık Donanım Şematiği",
      "Bağımsız Garaj İmecesi",
    ]),
    K(14, [
      "3 Aktif C++/ROS Deposu",
      "Uçuş Kontrol PR #14",
    ]),
    sprintMetrics(14, 12),
  ),
};

function pillar(score: number, max: number, records: string[]): ScorePillar {
  return { score, max, records };
}

function C(score: number, records: string[]): ScorePillar {
  return pillar(score, NES_MAX.competition, records);
}

function H(score: number, records: string[]): ScorePillar {
  return pillar(score, NES_MAX.hardware, records);
}

function K(score: number, records: string[]): ScorePillar {
  return pillar(score, NES_MAX.code, records);
}

function nesCard(
  competition: ScorePillar,
  hardware: ScorePillar,
  code: ScorePillar,
  metrics: VerifiedMetrics,
): {
  engineeringScore: number;
  scoreBreakdown: ScoreBreakdown;
  verifiedMetrics: VerifiedMetrics;
} {
  return {
    engineeringScore:
      (competition?.score || 0) + (hardware?.score || 0) + (code?.score || 0),
    scoreBreakdown: { competition, hardware, code },
    verifiedMetrics: metrics,
  };
}

function seat(
  base: {
    id: string;
    name: string;
    initials: string;
    handle: string;
    skills: string[];
    title?: string;
    isHost?: boolean;
  },
  competition: ScorePillar,
  hardware: ScorePillar,
  code: ScorePillar,
  metrics: VerifiedMetrics,
): TableParticipant {
  return {
    ...base,
    ...nesCard(competition, hardware, code, metrics),
  };
}

export function currentUserAsParticipant(
  id: string,
  isHost?: boolean,
): TableParticipant {
  return {
    id,
    name: CURRENT_USER.name,
    initials: CURRENT_USER.initials,
    handle: CURRENT_USER.handle,
    title: CURRENT_USER.title,
    skills: CURRENT_USER.skills,
    isHost,
    engineeringScore: CURRENT_USER.engineeringScore,
    scoreBreakdown: CURRENT_USER.scoreBreakdown,
    verifiedMetrics: CURRENT_USER.verifiedMetrics,
  };
}

/** Harita ilk açılışta kullanıcının çevresine odaklanır. */
export const MAP_CENTER = CURRENT_USER.position;
export const MAP_ZOOM = 15;

/**
 * Şehir içi mekanlar ve festival noktaları aynı listede yaşar; harita bunları
 * tek tip pinle çizer, aradaki tek fark açık bir masanın olup olmamasıdır.
 */
export const WORKSPACES: WorkspacePin[] = [
  {
    kind: "workspace",
    id: "ws-espressolab",
    venue: "cafe",
    name: "EspressoLab Kadıköy",
    district: "Kadıköy",
    glyph: "☕",
    position: { lat: 40.9899, lng: 29.0252 },
    note: "Üst kat prizli ve sessiz, uzun oturumlar için uygun.",
    hostsTables: true,
  },
  {
    kind: "workspace",
    id: "ws-kahve-dunyasi",
    venue: "cafe",
    name: "Kahve Dünyası",
    district: "Kadıköy · Bahariye",
    glyph: "☕",
    position: { lat: 40.988, lng: 29.0248 },
    note: "Geniş masalar, gün boyu açık. Bahariye girişinde.",
    hostsTables: true,
    table: {
      id: "table-kahve-dunyasi",
      title: "Otonom İHA Proje Ekibi",
      topic: "Gömülü Sistem & Otonom Sürüş",
      endsAt: "18:30",
      participants: [
        seat(
          {
            id: "tp-mert",
            name: "Mert Kaan Alp",
            initials: "MA",
            handle: "@mertkaanalp",
            title: "Gömülü Sistem Geliştirici",
            skills: ["ROS", "C++", "STM32"],
            isHost: true,
          },
          C(54, ["TEKNOFEST 2025 İHA yarı final", "T3 uçuş kontrol kaydı"]),
          H(22, ["PDB şematik paylaşımı", "Maker atölyesi lehim imecesi"]),
          K(12, ["2 aktif ROS deposu", "95+ commit", "STM32 firmware PR #9"]),
          sprintMetrics(11, 8),
        ),
        seat(
          {
            id: "tp-selin",
            name: "Selin Toprak",
            initials: "ST",
            handle: "@selintoprak",
            title: "Görü & Model Geliştirici",
            skills: ["Computer Vision", "PyTorch"],
          },
          C(51, ["TEKNOFEST 2025 görü jüri kaydı"]),
          H(20, ["Kamera jig şeması", "Bağımsız garaj ölçüm desteği"]),
          K(13, ["3 aktif PyTorch deposu", "120+ commit", "Nesne tespiti PR #4"]),
          sprintMetrics(10, 6, ["TEKNOFEST", "GitHub"]),
        ),
      ],
      request: {
        note: "Masamızda 1 boş sandalye var, projeye destek vermek veya tanışmak isteyen gelebilir.",
        openSeats: 1,
        skills: ["Gömülü Yazılım", "ROS"],
      },
    },
  },
  {
    kind: "workspace",
    id: "ws-kadikoy-kutuphane",
    venue: "library",
    name: "Kadıköy Kütüphanesi",
    district: "Kadıköy",
    glyph: "🏛️",
    position: { lat: 40.9868, lng: 29.029 },
    note: "Sessiz çalışma katı, ücretsiz internet ve priz.",
    hostsTables: true,
    table: {
      id: "table-kutuphane",
      title: "Otonom İHA Yazılım Masası",
      topic: "Otonom İHA",
      endsAt: "17:45",
      participants: [
        seat(
          {
            id: "tp-ada",
            name: "Ada Nur Yılmaz",
            initials: "AY",
            handle: "@adanury",
            title: "Otonom Görü Mühendisi",
            skills: ["Computer Vision", "ROS 2"],
            isHost: true,
          },
          C(56, [
            "TEKNOFEST 2025 Finalisti",
            "T3 KYS Mentör Kaydı",
          ]),
          H(24, [
            "12 Açık Donanım Şematiği",
            "Bağımsız Garaj İmecesi",
          ]),
          K(14, [
            "3 Aktif C++/ROS Deposu",
            "Uçuş Kontrol PR #14",
          ]),
          sprintMetrics(14, 12),
        ),
        seat(
          {
            id: "tp-yusuf",
            name: "Yusuf Arslan",
            initials: "YA",
            handle: "@yusufarslan",
            title: "SLAM & C++ Geliştirici",
            skills: ["C++", "SLAM"],
          },
          C(54, ["TEKNOFEST 2025 SLAM jüri kaydı", "T3 kamp belgesi"]),
          H(22, ["LiDAR montaj şeması", "Garaj kalibrasyon imecesi"]),
          K(12, ["2 aktif C++/SLAM deposu", "110+ commit", "Harita füzyonu PR #7"]),
          sprintMetrics(12, 9),
        ),
        seat(
          {
            id: "tp-irem",
            name: "İrem Su",
            initials: "İS",
            handle: "@iremsu",
            title: "Gömülü Yazılım Geliştirici",
            skills: ["Gömülü Yazılım"],
          },
          C(51, ["TEKNOFEST 2025 gömülü yarı final", "Deneyap mezun kaydı"]),
          H(21, ["8 açık şematik paylaşımı", "Atölye lehim imecesi"]),
          K(13, ["STM32 firmware deposu", "80+ commit", "Uçuş alt sistemi PR #5"]),
          sprintMetrics(9, 8, ["T3 Vakfı", "TEKNOFEST", "GitHub"]),
        ),
      ],
      request: {
        note: "Sessiz kattayız; kod incelemesi ve SLAM tartışmasına açığız.",
        openSeats: 2,
        skills: ["SLAM", "C++"],
      },
    },
  },
  {
    kind: "workspace",
    id: "ws-maker-atolye",
    venue: "workshop",
    name: "Kadıköy Maker Atölyesi",
    district: "Kadıköy",
    glyph: "🛠️",
    position: { lat: 40.9915, lng: 29.031 },
    note: "Lehim istasyonu, 3D yazıcı ve el aletleri üyelere açık.",
    hostsTables: true,
    table: {
      id: "table-maker",
      title: "PCB & Lehimleme Masası",
      topic: "Donanım Prototipleme",
      endsAt: "20:00",
      participants: [
        seat(
          {
            id: "tp-kaan",
            name: "Kaan Öz",
            initials: "KÖ",
            handle: "@kaanoz",
            title: "PCB Tasarım Mentörü",
            skills: ["PCB", "Altium"],
            isHost: true,
          },
          C(53, ["T3 donanım mentör kaydı", "TEKNOFEST PCB jüri yardımcısı"]),
          H(24, ["Gerber / PDB şematikleri", "Maker atölyesi imecesi"]),
          K(12, ["Açık Altium kütüphanesi", "70+ commit", "PDB revizyon PR #2"]),
          sprintMetrics(13, 15),
        ),
        seat(
          {
            id: "tp-burak",
            name: "Burak Şen",
            initials: "BŞ",
            handle: "@buraksen3d",
            title: "Mekanik & 3D Baskı",
            skills: ["3D Baskı", "SolidWorks"],
          },
          C(45, ["TEKNOFEST mekanik yarı final"]),
          H(24, ["12 parça jig paylaşımı", "Bağımsız garaj baskı imecesi"]),
          K(11, ["Açık STEP / STL deposu", "55+ commit"]),
          sprintMetrics(8, 11, ["TEKNOFEST", "GitHub"]),
        ),
      ],
      request: {
        note: "Lehim istasyonu boş, acil parça basımı için uğrayabilirsiniz.",
        openSeats: 1,
        skills: ["PCB"],
      },
    },
    equipment: [
      {
        id: "eq-creality-k1",
        name: "Creality K1 Max 3D Yazıcı",
        category: "3D_PRINT",
        provider: "Kadıköy Maker Atölyesi",
        note: "Kendi filamentini getiren herkes dayanışma ile basabilir.",
        isAvailable: true,
      },
      {
        id: "eq-hakko",
        name: "Hakko FX-888D Lehim İstasyonu",
        category: "SOLDERING",
        provider: "Kadıköy Maker Atölyesi",
        note: "İstasyon şu an PCB masasında; sıra ile paylaşılıyor.",
        isAvailable: false,
      },
    ],
  },
  {
    kind: "workspace",
    id: "ws-genc-merkez",
    venue: "workshop",
    name: "Kadıköy Gençlik Merkezi",
    district: "Kadıköy",
    glyph: "🛠️",
    position: { lat: 40.9902, lng: 29.022 },
    note: "Açık atölye saatlerinde 3D yazıcı ve el aletleri imeceye açık.",
    hostsTables: true,
    equipment: [
      {
        id: "eq-prusa",
        name: "Prusa MK4 3D Yazıcı",
        category: "3D_PRINT",
        provider: "Kadıköy Gençlik Merkezi",
        note: "Hafta içi 14:00–18:00 arası müsait. Filamentini getirmen yeterli.",
        isAvailable: true,
      },
    ],
  },
  {
    kind: "workspace",
    id: "ws-walters",
    venue: "cafe",
    name: "Walter's Coffee Moda",
    district: "Kadıköy · Moda",
    glyph: "☕",
    position: { lat: 40.9832, lng: 29.0281 },
    note: "Deniz tarafı, hafta içi öğleden sonra sakin.",
    hostsTables: true,
  },
  {
    kind: "workspace",
    id: "ws-kolektif",
    venue: "campus",
    name: "Kolektif House Kozyatağı",
    district: "Kozyatağı",
    glyph: "🏢",
    position: { lat: 40.977, lng: 29.0985 },
    note: "Ortak çalışma alanı, günlük misafir girişi mevcut.",
    hostsTables: true,
    table: {
      id: "table-kolektif",
      title: "Yapay Zekâ Girişim Masası",
      topic: "LLM & Ürün Geliştirme",
      endsAt: "19:15",
      participants: [
        seat(
          {
            id: "tp-sena",
            name: "Sena Kurt",
            initials: "SK",
            handle: "@senakurt",
            title: "LLM Ürün Geliştirici",
            skills: ["Python", "LLM"],
            isHost: true,
          },
          C(50, ["TEKNOFEST 2025 yapay zekâ jüri kaydı"]),
          H(18, ["Jetson kutu şeması", "Kampüs garaj paylaşımı"]),
          K(13, ["2 aktif Python deposu", "130+ commit", "RAG hattı PR #11"]),
          sprintMetrics(16, 5, ["TEKNOFEST", "GitHub"]),
        ),
        seat(
          {
            id: "tp-onur",
            name: "Onur Kaya",
            initials: "OK",
            handle: "@onurkaya",
            title: "Backend Geliştirici",
            skills: ["Backend", "Docker"],
          },
          C(42, ["T3 yazılım kampı belgesi"]),
          H(16, ["Sunucu kablolama şeması"]),
          K(14, ["3 aktif API deposu", "150+ commit", "Canlı oturum servisi PR #8"]),
          sprintMetrics(15, 4, ["T3 Vakfı", "GitHub"]),
        ),
      ],
      request: {
        note: "Frontend ve UI konusunda sohbet edecek birini arıyoruz.",
        openSeats: 2,
        skills: ["Frontend", "UI"],
      },
    },
  },
  {
    kind: "workspace",
    id: "ws-albatros",
    venue: "stand",
    name: "Albatros İHA Standı",
    district: "TEKNOFEST Alanı",
    glyph: "✈",
    position: { lat: 40.9771, lng: 28.8168 },
    note: "Çadır B · Stant 14. Sabit kanat İHA takımı.",
    hostsTables: false,
    table: {
      id: "table-albatros",
      title: "Uçuş Kontrol Kartı Masası",
      topic: "Gömülü Yazılım & PX4",
      endsAt: "21:00",
      participants: [
        seat(
          {
            id: "tp-baris",
            name: "Barış Ak",
            initials: "BA",
            handle: "@barisak",
            title: "Aviyonik Donanım",
            skills: ["PCB", "Aviyonik"],
            isHost: true,
          },
          C(56, ["TEKNOFEST 2025 Savaşan İHA finalisti", "T3 aviyonik kaydı"]),
          H(24, ["PDB / Gerber paylaşımı", "Stand garaj imecesi"]),
          K(13, ["PX4 parametre deposu", "90+ commit", "Uçuş kartı PR #12"]),
          sprintMetrics(12, 10),
        ),
        seat(
          {
            id: "tp-zehra",
            name: "Zehra Nur",
            initials: "ZN",
            handle: "@zehranur",
            title: "PX4 Gömülü Yazılım",
            skills: ["Gömülü Yazılım", "PX4"],
          },
          C(53, ["TEKNOFEST 2025 gömülü jüri kaydı"]),
          H(21, ["Kablo demeti şeması", "Atölye lehim imecesi"]),
          K(13, ["PX4 fork", "100+ commit", "I2C sürücü PR #6"]),
          sprintMetrics(11, 7),
        ),
      ],
      request: {
        note: "Uçuş kartında son dakika I2C hatası var, gömülü yazılım bilen bir destek arıyoruz.",
        openSeats: 1,
        skills: ["Gömülü Yazılım", "PCB"],
      },
    },
    equipment: [
      {
        id: "eq-psu",
        name: "Korad KA3005D Güç Kaynağı",
        category: "ENERGY",
        provider: "Albatros İHA Takımı",
        note: "Stand masasında; kısa süreli besleme ve kart uyanırma için paylaşılır.",
        isAvailable: true,
      },
    ],
  },
  {
    kind: "workspace",
    id: "ws-gokboru",
    venue: "stand",
    name: "Gökbörü Roket Standı",
    district: "TEKNOFEST Alanı",
    glyph: "🚀",
    position: { lat: 40.9747, lng: 28.8221 },
    note: "Çadır D · Stant 3. Orta irtifa roket takımı.",
    hostsTables: false,
    table: {
      id: "table-gokboru",
      title: "Aviyonik & Telemetri Masası",
      topic: "RF Telemetri",
      endsAt: "22:00",
      participants: [
        seat(
          {
            id: "tp-tolga",
            name: "Tolga Bilge",
            initials: "TB",
            handle: "@tolgabilge",
            title: "Aviyonik Yazılım",
            skills: ["STM32", "CAN Bus"],
            isHost: true,
          },
          C(54, ["TEKNOFEST 2025 roket aviyonik kaydı"]),
          H(22, ["Anten PCB şeması", "Garaj RF imecesi"]),
          K(12, ["STM32 CAN deposu", "85+ commit", "Telemetri PR #3"]),
          sprintMetrics(10, 8),
        ),
        seat(
          {
            id: "tp-ayse",
            name: "Ayşe Kara",
            initials: "AK",
            handle: "@aysekara",
            title: "RF & Anten Tasarımı",
            skills: ["RF Telemetri", "Anten Tasarımı"],
          },
          C(51, ["TEKNOFEST RF jüri kaydı", "T3 anten kampı"]),
          H(24, ["RF şematik paylaşımı", "Spektrum ölçüm imecesi"]),
          K(11, ["Anten simülasyon deposu", "60+ commit"]),
          sprintMetrics(9, 12),
        ),
      ],
      request: {
        note: "Antende menzil problemi var, RF tecrübesi olan biriyle çalışmak istiyoruz.",
        openSeats: 2,
        skills: ["RF Telemetri", "STM32"],
      },
    },
    equipment: [
      {
        id: "eq-lipo",
        name: "LiPo Balans Şarj İstasyonu",
        category: "ENERGY",
        provider: "Gökbörü Ar-Ge Atölyesi",
        note: "Kendi paketinle gel; yangın kumu ve LiPo çantası masada hazır.",
        isAvailable: true,
      },
      {
        id: "eq-spectrum",
        name: "Siglent SSA3021X Spektrum Analizörü",
        category: "TEST_MEASURE",
        provider: "Gökbörü Ar-Ge Atölyesi",
        note: "Anten hizalama için kullanımda; sıraya yazılınca paylaşılır.",
        isAvailable: false,
      },
    ],
  },
  {
    kind: "workspace",
    id: "ws-deneyap",
    venue: "workshop",
    name: "Deneyap Atölyesi",
    district: "TEKNOFEST Alanı",
    glyph: "🛠️",
    position: { lat: 40.9746, lng: 28.8179 },
    note: "Osiloskop, sıcak hava istasyonu ve lehim ekipmanı açık.",
    hostsTables: true,
    table: {
      id: "table-deneyap",
      title: "PCB Tamir İstasyonu",
      topic: "Donanım Tamiri",
      endsAt: "20:30",
      participants: [
        seat(
          {
            id: "tp-hakan",
            name: "Hakan Yüce",
            initials: "HY",
            handle: "@hakanyuce",
            title: "Analog Test Mentörü",
            skills: ["Analog Devre", "Test & Ölçüm"],
            isHost: true,
          },
          C(56, ["T3 KYS donanım mentörlüğü", "TEKNOFEST ölçüm jürisi"]),
          H(24, ["Osiloskop jig şeması", "Deneyap atölye imecesi"]),
          K(11, ["Açık test firmware", "50+ commit"]),
          sprintMetrics(18, 16),
        ),
      ],
      request: {
        note: "Ölçüm masası boşta, kart tamiri için uğrayabilirsiniz.",
        openSeats: 3,
        skills: ["PCB", "Analog Devre"],
      },
    },
    equipment: [
      {
        id: "eq-rigol",
        name: "Rigol 100MHz Dijital Osiloskop",
        category: "TEST_MEASURE",
        provider: "Deneyap Atölyesi",
        note: "Acil devre kartı testi için masamız açık.",
        isAvailable: true,
      },
      {
        id: "eq-hotair",
        name: "Sıcak Hava Havya İstasyonu",
        category: "SOLDERING",
        provider: "Deneyap Atölyesi",
        note: "SMD sökme-takma için paylaşılır; kendi uçlarını getirebilirsin.",
        isAvailable: true,
      },
    ],
  },
  {
    kind: "workspace",
    id: "ws-festival-kafeterya",
    venue: "cafe",
    name: "Festival Kafeteryası",
    district: "TEKNOFEST Alanı",
    glyph: "☕",
    position: { lat: 40.9741, lng: 28.8205 },
    note: "Gölgelikli oturma alanı, ücretsiz su ve kahve.",
    hostsTables: true,
    table: {
      id: "table-festival-kafeterya",
      title: "Sunum & Rapor Masası",
      topic: "Final Sunumu",
      endsAt: "19:00",
      participants: [
        seat(
          {
            id: "tp-cemre",
            name: "Cemre Yıldız",
            initials: "CY",
            handle: "@cemreyildiz",
            title: "Teknik İletişim",
            skills: ["Sunum", "Rapor Yazımı"],
            isHost: true,
          },
          C(48, ["TEKNOFEST final sunum kaydı"]),
          H(17, ["Stand düzen şeması"]),
          K(12, ["Rapor şablon deposu", "40+ commit", "Sunum PR #1"]),
          sprintMetrics(7, 3, ["TEKNOFEST", "GitHub"]),
        ),
        seat(
          {
            id: "tp-emre",
            name: "Emre Doğan",
            initials: "ED",
            handle: "@emredogan",
            title: "Arayüz Geliştirici",
            skills: ["Frontend", "UI"],
          },
          C(41, ["T3 arayüz kampı belgesi"]),
          H(15, ["Kiosk montaj şeması"]),
          K(14, ["3 aktif arayüz deposu", "160+ commit", "Canlı harita PR #21"]),
          sprintMetrics(14, 4, ["T3 Vakfı", "GitHub"]),
        ),
      ],
      request: {
        note: "Sunum akışını dinleyip geri bildirim verecek birini arıyoruz.",
        openSeats: 2,
        skills: ["Sunum", "UI"],
      },
    },
  },
  {
    kind: "workspace",
    id: "ws-t3",
    venue: "stand",
    name: "T3 Vakfı Standı",
    district: "TEKNOFEST Alanı",
    glyph: "T3",
    position: { lat: 40.9756, lng: 28.8194 },
    note: "Kayıt, danışma ve mentör yönlendirme noktası.",
    hostsTables: false,
  },
];

/**
 * Bir mekana bağlı olmayan kişiler. Bağlantı yoksa haritada yalnızca odak
 * alanları görünür; tam konum hiç yazılmaz.
 */
export const PEOPLE: PersonPin[] = [
  {
    kind: "person",
    id: "p-elif",
    name: "Elif Yaman",
    initials: "EY",
    handle: "@elifyaman",
    title: "Gömülü Yazılım Mühendisi",
    skills: ["Gömülü Yazılım", "ROS", "PCB", "C++"],
    workingOn: "Uçuş kontrol firmware'i v3",
    online: true,
    isConnected: false,
    focusArea: {
      label: "Moda çevresinde",
      center: { lat: 40.9845, lng: 29.027 },
      radius: 95,
    },
    position: { lat: 40.9841, lng: 29.0264 },
    ...nesCard(
      C(56, [
        "TEKNOFEST 2025 Savaşan İHA Finalisti (KTR: 89.4 Puan)",
        "T3 Vakfı KYS Onaylı Mentörlük",
      ]),
      H(24, [
        "12 Açık Kaynak Donanım Desteği (Gerber / PDB Şematiği)",
        "Kadıköy Atölye & Bağımsız Garaj Paylaşımı",
      ]),
      K(14, [
        "3 Aktif C++ / ROS Deposu",
        "Uçuş Kontrol STM32 Firmware PR #14",
      ]),
      {
        sprints: 14,
        imeceCount: 12,
        orgCount: 3,
        verifiedInstitutions: ["T3 Vakfı", "TEKNOFEST", "GitHub"],
      },
    ),
  },
  {
    kind: "person",
    id: "p-zeynep",
    name: "Zeynep Arslan",
    initials: "ZA",
    handle: "@zeyneparslan",
    title: "Yapay Zekâ Araştırmacısı",
    skills: ["Computer Vision", "PyTorch", "Jetson"],
    workingOn: "Gerçek zamanlı nesne tespiti",
    online: false,
    isConnected: false,
    focusArea: {
      label: "Bahariye çevresinde",
      center: { lat: 40.9872, lng: 29.0225 },
      radius: 85,
    },
    position: { lat: 40.9869, lng: 29.0231 },
    ...nesCard(
      C(48, [
        "TEKNOFEST 2025 Yapay Zekâ yarı final jüri kaydı",
        "T3 araştırma kampı katılım belgesi",
      ]),
      H(22, [
        "6 açık donanım paylaşımı (kamera jig / kablo şeması)",
        "Bağımsız garaj ölçüm katkısı",
      ]),
      K(13, [
        "2 aktif PyTorch / Jetson deposu",
        "Nesne tespiti modeli PR #6",
      ]),
      {
        sprints: 10,
        imeceCount: 6,
        orgCount: 2,
        verifiedInstitutions: ["TEKNOFEST", "GitHub"],
      },
    ),
  },
  {
    kind: "person",
    id: "p-deniz",
    name: "Deniz Korkmaz",
    initials: "DK",
    handle: "@denizkorkmaz",
    title: "Donanım Mentörü",
    skills: ["PCB", "Analog Devre", "Test & Ölçüm"],
    workingOn: "Kart tamiri & ölçüm desteği",
    online: true,
    isConnected: true,
    focusArea: {
      label: "Rıhtım çevresinde",
      center: { lat: 40.9908, lng: 29.0288 },
      radius: 90,
    },
    position: { lat: 40.9905, lng: 29.0292 },
    ...nesCard(
      C(54, [
        "T3 Vakfı KYS onaylı donanım mentörlüğü",
        "TEKNOFEST 2024 jüri yardımcı kaydı",
      ]),
      H(24, [
        "18 Gerber / PDB şematik paylaşımı",
        "Festival atölyesi ve bağımsız garaj imecesi",
      ]),
      K(13, [
        "Açık donanım kart depoları",
        "Analog ölçüm firmware PR #3",
      ]),
      {
        sprints: 18,
        imeceCount: 18,
        orgCount: 3,
        verifiedInstitutions: ["T3 Vakfı", "TEKNOFEST", "GitHub"],
      },
    ),
  },
];

/** Yol tarifi metinlerinde kullanılan sabit referans noktaları. */
export const LANDMARKS = WORKSPACES.map((workspace) => ({
  id: workspace.id,
  shortName: workspace.name,
  position: workspace.position,
}));

export function venueLabel(pin: WorkspacePin): string {
  return VENUE_LABELS[pin.venue];
}

/** Canlı masa mavi, boş mekan arduvaz grisi, kişi açık mavi. */
export function pinAccent(pin: MapPin): string {
  if (pin.kind === "person") return PALETTE.accentSoft;
  return pin.table ? PALETTE.accent : PALETTE.muted;
}

export function pinSubtitle(pin: MapPin): string {
  if (pin.kind === "person") return pin.title;
  return `${venueLabel(pin)} · ${pin.district}`;
}

/** Aramada ve eşleştirmede taranan yetkinlikler. */
export function pinSkills(pin: MapPin): string[] {
  if (pin.kind === "person") return pin.skills;
  if (!pin.table) return [];
  return [
    pin.table.topic,
    ...pin.table.participants.flatMap((participant) => participant.skills),
    ...(pin.table.request?.skills ?? []),
  ];
}

export function tableSeatSummary(table: WorkTable): string {
  const count = table.participants.length;
  const open = table.request?.openSeats ?? 0;
  if (open > 0) return `${count} geliştirici · ${open} boş sandalye`;
  return `${count} geliştirici`;
}

export function workspaceEquipment(pin: WorkspacePin): EquipmentItem[] {
  return pin.equipment ?? [];
}

export function hasOpenImece(pin: MapPin): boolean {
  return pin.kind === "workspace" && workspaceEquipment(pin).length > 0;
}

export function hasLiveTable(pin: MapPin): boolean {
  return pin.kind === "workspace" && Boolean(pin.table);
}

export function allEquipment(workspaces: WorkspacePin[]): EquipmentItem[] {
  return workspaces.flatMap(workspaceEquipment);
}

export function canHostEquipment(pin: WorkspacePin): boolean {
  return EQUIPMENT_HOST_VENUES.includes(pin.venue);
}

export function equipmentSearchBlob(item: EquipmentItem): string {
  return [
    item.name,
    item.provider,
    item.note,
    EQUIPMENT_CATEGORY_LABELS[item.category],
    ...EQUIPMENT_SEARCH_ALIASES[item.category],
  ].join(" ");
}

/** Pin aramasında mekan, masa ve imece cihazları tek haystack'te. */
export function pinSearchText(pin: MapPin): string {
  if (pin.kind === "person") {
    return [pin.name, pin.title, pin.workingOn, ...pin.skills].join(" ");
  }
  return [
    pin.name,
    pin.district,
    pin.note,
    venueLabel(pin),
    ...pinSkills(pin),
    ...workspaceEquipment(pin).flatMap((item) => [
      equipmentSearchBlob(item),
    ]),
  ].join(" ");
}
