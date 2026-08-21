import type {
  CurrentUser,
  MapPin,
  PersonPin,
  VenueKind,
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

export const CURRENT_USER: CurrentUser = {
  name: "Bünyamin K.",
  handle: "@bunyamin.dev",
  initials: "BK",
  title: "Gömülü Yazılım Geliştirici · Deneyap Mezunu",
  district: "Kadıköy",
  skills: ["Gömülü Yazılım", "ROS", "PCB", "STM32"],
  position: { lat: 40.989, lng: 29.0265 },
};

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
        {
          id: "tp-mert",
          name: "Mert Kaan Alp",
          initials: "MA",
          handle: "@mertkaanalp",
          skills: ["ROS", "C++", "STM32"],
          isHost: true,
        },
        {
          id: "tp-selin",
          name: "Selin Toprak",
          initials: "ST",
          handle: "@selintoprak",
          skills: ["Computer Vision", "PyTorch"],
        },
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
        {
          id: "tp-ada",
          name: "Ada Nur Yılmaz",
          initials: "AY",
          handle: "@adanury",
          skills: ["Computer Vision", "ROS 2"],
          isHost: true,
        },
        {
          id: "tp-yusuf",
          name: "Yusuf Arslan",
          initials: "YA",
          handle: "@yusufarslan",
          skills: ["C++", "SLAM"],
        },
        {
          id: "tp-irem",
          name: "İrem Su",
          initials: "İS",
          handle: "@iremsu",
          skills: ["Gömülü Yazılım"],
        },
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
        {
          id: "tp-kaan",
          name: "Kaan Öz",
          initials: "KÖ",
          handle: "@kaanoz",
          skills: ["PCB", "Altium"],
          isHost: true,
        },
        {
          id: "tp-burak",
          name: "Burak Şen",
          initials: "BŞ",
          handle: "@buraksen3d",
          skills: ["3D Baskı", "SolidWorks"],
        },
      ],
      request: {
        note: "Lehim istasyonu boş, acil parça basımı için uğrayabilirsiniz.",
        openSeats: 1,
        skills: ["PCB"],
      },
    },
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
        {
          id: "tp-sena",
          name: "Sena Kurt",
          initials: "SK",
          handle: "@senakurt",
          skills: ["Python", "LLM"],
          isHost: true,
        },
        {
          id: "tp-onur",
          name: "Onur Kaya",
          initials: "OK",
          handle: "@onurkaya",
          skills: ["Backend", "Docker"],
        },
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
        {
          id: "tp-baris",
          name: "Barış Ak",
          initials: "BA",
          handle: "@barisak",
          skills: ["PCB", "Aviyonik"],
          isHost: true,
        },
        {
          id: "tp-zehra",
          name: "Zehra Nur",
          initials: "ZN",
          handle: "@zehranur",
          skills: ["Gömülü Yazılım", "PX4"],
        },
      ],
      request: {
        note: "Uçuş kartında son dakika I2C hatası var, gömülü yazılım bilen bir destek arıyoruz.",
        openSeats: 1,
        skills: ["Gömülü Yazılım", "PCB"],
      },
    },
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
        {
          id: "tp-tolga",
          name: "Tolga Bilge",
          initials: "TB",
          handle: "@tolgabilge",
          skills: ["STM32", "CAN Bus"],
          isHost: true,
        },
        {
          id: "tp-ayse",
          name: "Ayşe Kara",
          initials: "AK",
          handle: "@aysekara",
          skills: ["RF Telemetri", "Anten Tasarımı"],
        },
      ],
      request: {
        note: "Antende menzil problemi var, RF tecrübesi olan biriyle çalışmak istiyoruz.",
        openSeats: 2,
        skills: ["RF Telemetri", "STM32"],
      },
    },
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
        {
          id: "tp-hakan",
          name: "Hakan Yüce",
          initials: "HY",
          handle: "@hakanyuce",
          skills: ["Analog Devre", "Test & Ölçüm"],
          isHost: true,
        },
      ],
      request: {
        note: "Ölçüm masası boşta, kart tamiri için uğrayabilirsiniz.",
        openSeats: 3,
        skills: ["PCB", "Analog Devre"],
      },
    },
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
        {
          id: "tp-cemre",
          name: "Cemre Yıldız",
          initials: "CY",
          handle: "@cemreyildiz",
          skills: ["Sunum", "Rapor Yazımı"],
          isHost: true,
        },
        {
          id: "tp-emre",
          name: "Emre Doğan",
          initials: "ED",
          handle: "@emredogan",
          skills: ["Frontend", "UI"],
        },
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
