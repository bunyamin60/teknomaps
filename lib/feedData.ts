export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  initials: string;
  accent: string;
  verified: boolean;
  time: string;
  body: string;
  tags: string[];
  stats: { replies: number; reposts: number; likes: number };
  pinned?: boolean;
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: "p1",
    author: "Albatros İHA Takımı",
    handle: "@albatrosiha",
    initials: "Aİ",
    accent: "#1D9BF0",
    verified: true,
    time: "12 dk",
    body:
      "Uçuş kartımızın firmware'inde son dakika bir I2C sorunu çıktı. Çadır B · Stant 14'teyiz, gömülü yazılım bilen varsa TeknoMaps'ten konumumuza rota çizip gelebilir. Kahve bizden ☕",
    tags: ["TEKNOFEST", "İHA", "GömülüYazılım"],
    stats: { replies: 34, reposts: 96, likes: 512 },
    pinned: true,
  },
  {
    id: "p2",
    author: "T3 Vakfı",
    handle: "@t3vakfi",
    initials: "T3",
    accent: "#FFB74D",
    verified: true,
    time: "38 dk",
    body:
      "Ana Sahne'de 14:30'da \"İnsansız Sistemlerde Yeni Nesil Aviyonik\" paneli başlıyor. Alan haritasında sahneye en kısa yürüyüş rotasını TeknoMaps üzerinden alabilirsiniz.",
    tags: ["AnaSahne", "Panel"],
    stats: { replies: 12, reposts: 148, likes: 1204 },
  },
  {
    id: "p3",
    author: "Burak Şen",
    handle: "@buraksen3d",
    initials: "BŞ",
    accent: "#5C7CFA",
    verified: false,
    time: "1 sa",
    body:
      "Yanımda 2 çalışan 3D yazıcı var, acil parça ihtiyacı olan takımlara ücretsiz baskı yapıyorum. Rover Vadisi'ndeyim, TeknoMaps'te beni bulup rota çizebilirsiniz 🖨️",
    tags: ["3DBaskı", "Dayanışma"],
    stats: { replies: 51, reposts: 210, likes: 894 },
  },
  {
    id: "p4",
    author: "Gökbörü Roket Takımı",
    handle: "@gokboruroket",
    initials: "GR",
    accent: "#1D9BF0",
    verified: true,
    time: "2 sa",
    body:
      "Telemetri antenimizin menzili beklediğimizin yarısı çıktı. RF tarafında tecrübeli bir arkadaşa ihtiyacımız var, Çadır D · Stant 3. 15.000 ft hedefimiz için son 18 saat!",
    tags: ["Roket", "RF", "Telemetri"],
    stats: { replies: 78, reposts: 132, likes: 640 },
  },
  {
    id: "p5",
    author: "Deneyap Türkiye",
    handle: "@deneyapturkiye",
    initials: "D",
    accent: "#81C784",
    verified: true,
    time: "3 sa",
    body:
      "Atölyemizde osiloskop, sıcak hava istasyonu ve lehim istasyonları boşta. Sıra bekleme süresi şu an ~8 dakika. Haritadaki yeşil atölye pinine dokunup rota alın.",
    tags: ["Deneyap", "Atölye"],
    stats: { replies: 9, reposts: 64, likes: 388 },
  },
];

export const TRENDS = [
  { topic: "TEKNOFEST 2026", meta: "Teknoloji · 128 B gönderi" },
  { topic: "#TeknoMaps", meta: "Yeni · 24,8 B gönderi" },
  { topic: "#İHAYarışması", meta: "Havacılık · 41,2 B gönderi" },
  { topic: "#RoketFinal", meta: "Uzay · 18,9 B gönderi" },
  { topic: "#Deneyap", meta: "Eğitim · 12,4 B gönderi" },
];

export const HASHTAGS = [
  { tag: "#GömülüYazılım", posts: "9.412 gönderi", growth: "+38%" },
  { tag: "#ROS2", posts: "4.180 gönderi", growth: "+22%" },
  { tag: "#PCBTasarım", posts: "3.765 gönderi", growth: "+17%" },
  { tag: "#3DBaskı", posts: "7.902 gönderi", growth: "+54%" },
  { tag: "#Aviyonik", posts: "2.318 gönderi", growth: "+11%" },
];

export const NEWS = [
  {
    title: "TEKNOFEST alanında 4.200 takım yarışıyor",
    meta: "NSosyal Haber · 22 dk",
  },
  {
    title: "İHA finalleri hava koşulları nedeniyle 15:00'e ertelendi",
    meta: "Duyuru · 47 dk",
  },
  {
    title: "TeknoMaps beta: alandaki takımları canlı haritada gör",
    meta: "Ürün · 1 sa",
  },
];

export const SUGGESTED = [
  { name: "Elif Yaman", handle: "@elifyaman", initials: "EY", accent: "#5C7CFA" },
  { name: "Mert Kaan Alp", handle: "@mertkaanalp", initials: "MA", accent: "#5C7CFA" },
  { name: "Zeynep Arslan", handle: "@zeyneparslan", initials: "ZA", accent: "#5C7CFA" },
];
