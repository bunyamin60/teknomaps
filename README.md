# TeknoMaps · NSosyal

TEKNOFEST NSosyal İnovasyon Yarışması için hazırlanmış prototip. NSosyal web
arayüzünü (sol sidebar, üst trend barları, koyu tema, `#1D9BF0` / `#0084FF`
vurgu renkleri) taklit eder ve sol menüye **TeknoMaps** adında canlı bir alan
haritası sekmesi ekler.

## Özellikler

**NSosyal kabuğu**

- Sol sidebar: "N" beta logosu, Akış / Keşfet / TeknoMaps / Bildirimler /
  Mesajlar / Profil sekmeleri, Giriş-Kayıt butonları ve profil kartı.
- Üst bar: Trendler, Etiketler, Haberler ve TeknoMaps Canlı tableri.
- Akış: gönderi listesi, gönderi oluşturma alanı, sağ sütunda gündem ve canlı
  takım widget'ı.

**TeknoMaps harita modülü**

- Leaflet + OpenStreetMap (CARTO dark) üzerinde tam ekran alan haritası; festival
  bölgeleri, ana yürüyüş aksı ve ara yollar çizilidir.
- Üç pin katmanı: takım/atölye standları, yarışmacı profilleri ve
  T3 / Deneyap / şarj / dinlenme / sahne / sağlık noktaları. Katmanlar
  filtrelenebilir, yetkinliğe göre arama yapılabilir.
- **AI eşleştirme paneli:** kullanıcının uzmanlık alanlarıyla kesişen takım ve
  kişileri uyum yüzdesiyle listeler; "Bağlantı Kur" ve "Rotayı Çiz" aksiyonları.
- **Canlı rota & navigasyon simülasyonu:** hedefe mat mavi `Polyline` çizilir,
  sol altta adım adım yol tarifi kartı açılır, yürüyen imleç rota boyunca
  animasyonla ilerler (başlat / duraklat / başa al).
- **Detay çekmecesi:** pine tıklanınca biyografi, uzmanlıklar, aranan
  yetkinlikler, acil ihtiyaç uyarısı, NSosyal profil linki ve mesaj / bağlantı
  butonları.
- **Gizlilik öncelikli konum:** bağlantı kurulmamış kişiler haritada nokta atışı
  yerine yaklaşık bölge olarak görünür.
- **Ortak çalışma alanları:** kafeterya, atölye ve şarj noktalarında kaç kişinin
  hangi projeler üzerinde çalıştığı listelenir.

## Gizlilik ve ortak çalışma

**Bulanık konum (KVKK).** Bir kişinin tam koordinatı yalnızca karşılıklı
bağlantı onayı varsa haritaya yazılır. Onay yoksa:

- Nokta atışı marker yerine ~85-95 m yarıçaplı kesikli bir çember ve
  `Elif Y. • İHA Bölgesi Çevresinde` biçiminde bir bölge pini çizilir.
- Detay kartında "Tam konum bağlantı kurulduktan sonra paylaşılır" rozeti
  görünür, "Hassas Yol Tarifi Başlat" butonu pasiftir.
- "Bölgeye Rota Oluştur" rotayı kişinin yanına değil çalışma bölgesinin sınırına
  kadar çizer; rota kesikli görünür ve yol tarifi kartı bunu ayrıca belirtir.
- Mesafe hesapları da bulanık merkezden yapılır, bu yüzden AI kartında
  `~398 m uzaktaki bölgede` yazar. Böylece tam konum türetilemez.

"NSosyal ile Bağlan" butonu `connectedIds` state'ine kişiyi ekler; çember
kaybolur, net pin açılır, hassas yol tarifi aktifleşir ve bölgeye çizilmiş
aktif rota otomatik olarak tam konuma yükseltilir. `privacyMode: "exact"`
seçen kullanıcılar (ör. 3D baskı desteği veren gönüllüler) bağlantı olmadan da
net konum paylaşır.

Kurallar tek bir yerde, `lib/privacy.ts` içinde toplanmıştır; harita,
eşleştirme motoru ve detay çekmecesi aynı kaynaktan beslendiği için bir
yüzeyde konum sızıntısı oluşamaz.

**Ortak çalışma alanları.** Alan pinlerinde `activeWorkers` ve
`currentProjects` alanları bulunur. Haritada pinin altına "☕ 4 kişi proje
geliştiriyor" rozeti düşer; detay panelinde "Burada Çalışanlar" listesi, kişi
başına "Masaya Katıl / İletişime Geç" butonu ve o an geliştirilen projeler yer
alır. Listedeki isimler de gizlilik kuralına uyar: bağlantı kurulmadan
kısaltılmış (`Mert A.`), kurulduktan sonra tam ad gösterilir.

## Harita paleti

Harita, göz yormayan mat bir palet kullanır (`MAP_PALETTE`, `lib/mockData.ts`):

| Öğe | Renk |
| --- | --- |
| Zemin / arka plan | `#1A1D21` mat antrasit |
| Sokak ve yürüyüş aksları | `#38444D` yumuşak gri |
| Takım standları | `#1D9BF0` NSosyal mavisi |
| Yarışmacı profilleri | `#5C7CFA` soft gök mavisi |
| Atölye ve servis alanları | `#81C784` / `#A5D6A7` adaçayı yeşili |
| Önemli noktalar (T3, Ana Sahne) | `#FFB74D` mat turuncu |
| Bölge halkaları | `#5C7CFA` kontur, `#BDBDBD` dolgu |
| Rota | `#1D9BF0` kesintisiz çizgi + ince gölge |
| Etiket metinleri | `#E1E8ED` / `#F8F9FA` off-white |

Zemin ve etiketler ayrı karo katmanı olarak yüklenir (`dark_nolabels` +
`dark_only_labels`); böylece sokak çizgileri yumuşatılırken etiketler ayrı bir
tonda tutulabiliyor.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır (port meşgulse Next.js boş
bir port seçer).

Diğer komutlar:

```bash
npm run build   # üretim derlemesi
npm run start   # derlenmiş uygulamayı çalıştır
npm run lint    # ESLint
```

## Kullanılan paketler

| Paket | Amaç |
| --- | --- |
| `next` (App Router) | Uygulama iskeleti, statik derleme |
| `react` / `react-dom` | UI katmanı |
| `tailwindcss` + `@tailwindcss/postcss` | Tema token'ları ve stiller |
| `lucide-react` | İkonlar |
| `leaflet` + `react-leaflet` | Harita, marker ve polyline katmanları |
| `@types/leaflet` | Leaflet tip tanımları |

## Dosya yapısı

```
app/
  layout.tsx          # kök layout, koyu tema, Türkçe metadata
  page.tsx            # NSosyal kabuğu ve sekme yönlendirmesi
  globals.css         # tema token'ları, Leaflet karanlık tema, pin/rota animasyonları
components/
  Sidebar.tsx         # sol navigasyon (TeknoMaps sekmesi dahil)
  TopBar.tsx          # üst trend barı
  FeedView.tsx        # akış, etiket ve haber panelleri
  RightRail.tsx       # gündem + canlı takım sütunu
  TeknoMapsView.tsx   # harita modülü orkestrasyonu (state, filtreler, simülasyon)
  MapComponent.tsx    # Leaflet haritası (yalnızca istemci)
  AiMatchCard.tsx     # yapay zekâ eşleştirme kartı
  RoutePanel.tsx      # adım adım yol tarifi kartı
  PinDrawer.tsx       # pin detay çekmecesi
lib/
  types.ts            # UserPin, TeamPin, FuzzyArea, Coworker, RoutePlan, ...
  mockData.ts         # takım / kişi / alan pinleri, bölgeler, yürüyüş aksı
  privacy.ts          # bulanık konum, bağlantı ve rota hedefi kuralları
  routing.ts          # rota ve adım adım yol tarifi üretimi
  matching.ts         # yetkinlik + mesafe + aciliyet skorlaması
  geo.ts              # haversine, kerteriz, yol üzerinde interpolasyon
  feedData.ts         # akış, gündem ve haber içerikleri
```

## Teknik notlar

- `MapComponent`, Leaflet'in `window` bağımlılığı nedeniyle
  `dynamic(() => import("./MapComponent"), { ssr: false })` ile yüklenir; yükleme
  sırasında iskelet ekran gösterilir.
- Tüm pinler `L.divIcon` ile üretilir, bu sayede marker görselleri CSS ile
  temalanır (acil ihtiyaç bayrağı, seçili durum, kesik çerçeveli bulanık konum
  pini, ortak çalışma rozeti).
- Rota; kullanıcı konumundan ana yürüyüş aksına çıkıp aks boyunca yürüyen ve
  hedefin bulunduğu ara yola sapan L şeklinde bir güzergâh üretir. Adım
  metinleri kerteriz farkından (sağa/sola/düz) ve en yakın işaret noktasından
  türetilir.
- Veri katmanı tamamen tiplenmiştir (`MapPin = TeamPin | UserPin | FacilityPin`),
  mock veriler gerçek bir API ile birebir değiştirilebilecek şekilde ayrıştırıldı.
