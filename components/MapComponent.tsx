"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { Crosshair, Maximize2, Minus, Plus } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { MAP_CENTER, MAP_ZOOM, PALETTE, pinAccent } from "@/lib/mockData";
import { fuzzyMapLabel, isConnectedPerson } from "@/lib/privacy";
import type {
  CurrentUser,
  LatLng,
  MapPin,
  PersonPin,
  RoutePlan,
  WorkspacePin,
} from "@/lib/types";

export interface MapFocus {
  position: LatLng;
  /** Aynı pine tekrar tıklandığında da uçuşu tetiklemek için artan sayaç. */
  key: number;
  zoom?: number;
}

interface MapComponentProps {
  pins: MapPin[];
  currentUser: CurrentUser;
  selectedPinId: string | null;
  dimmedPinIds: string[];
  /** Bağlantısı onaylanmış kişiler; yalnızca bunların tam konumu çizilir. */
  connectedIds: string[];
  route: RoutePlan | null;
  walkerPosition: LatLng | null;
  focus: MapFocus | null;
  /** Sağdaki detay kartı açıksa kontroller ve kamera dolgusu sola kayar. */
  drawerOpen: boolean;
  onSelectPin: (pin: MapPin) => void;
}

/** Detay kartı genişliği (sm ve üzeri). */
const DRAWER_WIDTH = 384;

/**
 * react-leaflet'in MapContainer'ı harita kaldırıldığında iç referansını
 * sıfırlamıyor; modül her yeniden değerlendirildiğinde yeni bir kimlik üretmek
 * React'i temiz bir örnek kurmaya zorlar (Fast Refresh koruması).
 */
const MAP_INSTANCE_KEY = `tm-map-${Date.now()}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Mekan pini: tek tip gövde, altında ad ve varsa canlı masa rozeti. */
function buildWorkspaceIcon(
  pin: WorkspacePin,
  selected: boolean,
  dimmed: boolean,
): L.DivIcon {
  const table = pin.table;
  const hasImece = (pin.equipment?.length ?? 0) > 0;
  const badge = table
    ? `<span class="tm-pin__badge${
        table.isMine ? " tm-pin__badge--mine" : ""
      }">${table.participants.length} geliştirici · ${escapeHtml(
        table.topic,
      )}</span>`
    : hasImece
      ? `<span class="tm-pin__badge">🤝 ${pin.equipment?.length ?? 0} imece cihazı</span>`
      : "";
  const imeceMark = hasImece
    ? `<span class="tm-pin__imece" title="Açık imece">🤝</span>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="tm-pin tm-pin--venue${table || hasImece ? "" : " tm-pin--idle"}${
        selected ? " is-selected" : ""
      }${dimmed ? " is-dimmed" : ""}" style="--tm-accent:${pinAccent(pin)}">
        <span class="tm-pin__body">${imeceMark}<span class="tm-pin__glyph">${escapeHtml(
          pin.glyph,
        )}</span></span>
        <span class="tm-pin__label">${escapeHtml(pin.name)}</span>
        ${badge}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/** Bağlantısı onaylanmış kişinin net pini. */
function buildPersonIcon(
  pin: PersonPin,
  selected: boolean,
  dimmed: boolean,
): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div class="tm-pin tm-pin--person${selected ? " is-selected" : ""}${
        dimmed ? " is-dimmed" : ""
      }" style="--tm-accent:${PALETTE.accentSoft}">
        <span class="tm-pin__body">${escapeHtml(pin.initials)}</span>
        <span class="tm-pin__label">${escapeHtml(pin.name)}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * Bağlantı kurulmamış kişi için nokta atışı konum yerine odak alanı pini.
 * "≈" öneki ve kesik çerçeve, konumun yaklaşık olduğunu görsel olarak anlatır.
 */
function buildFuzzyIcon(
  pin: PersonPin,
  selected: boolean,
  dimmed: boolean,
): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div class="tm-pin tm-pin--person tm-pin--fuzzy${
        selected ? " is-selected" : ""
      }${dimmed ? " is-dimmed" : ""}">
        <span class="tm-pin__body"><span class="tm-pin__glyph">≈</span></span>
        <span class="tm-pin__label tm-pin__label--fuzzy">${escapeHtml(
          fuzzyMapLabel(pin),
        )}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

const selfIcon = () =>
  L.divIcon({
    className: "",
    html: `<div class="tm-self"><span class="tm-self__ring"></span><span class="tm-self__core"></span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const walkerIcon = () =>
  L.divIcon({
    className: "",
    html: `<div class="tm-walker">🚶</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

function MapCommands({
  focus,
  route,
  padRight,
}: {
  focus: MapFocus | null;
  route: RoutePlan | null;
  padRight: number;
}) {
  const map = useMap();
  const routeIdRef = useRef<string | null>(null);
  const focusKeyRef = useRef<number>(-1);

  useEffect(() => {
    if (!route || routeIdRef.current === route.id) return;
    routeIdRef.current = route.id;
    map.flyToBounds(
      L.latLngBounds(
        route.path.map((point) => [point.lat, point.lng] as [number, number]),
      ),
      {
        paddingTopLeft: [80, 110],
        paddingBottomRight: [padRight, 240],
        duration: 1,
      },
    );
  }, [map, route, padRight]);

  useEffect(() => {
    if (!focus || focusKeyRef.current === focus.key) return;
    focusKeyRef.current = focus.key;
    map.flyTo(
      [focus.position.lat, focus.position.lng],
      focus.zoom ?? Math.max(map.getZoom(), 16.5),
      { duration: 0.8 },
    );
  }, [map, focus]);

  return null;
}

function MapControls({
  home,
  points,
  padRight,
  shifted,
}: {
  home: LatLng;
  points: LatLng[];
  padRight: number;
  shifted: boolean;
}) {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  const fitAll = () => {
    if (points.length === 0) return;
    map.flyToBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
      {
        paddingTopLeft: [60, 80],
        paddingBottomRight: [padRight, 120],
        duration: 0.9,
      },
    );
  };

  return (
    <div
      ref={ref}
      className={`absolute right-3 bottom-[104px] z-[600] flex flex-col gap-1.5 transition-transform duration-300 ${
        shifted ? "sm:-translate-x-[384px]" : ""
      }`}
    >
      <ControlButton title="Yakınlaştır" onClick={() => map.zoomIn()}>
        <Plus size={16} strokeWidth={1.75} />
      </ControlButton>
      <ControlButton title="Uzaklaştır" onClick={() => map.zoomOut()}>
        <Minus size={16} strokeWidth={1.75} />
      </ControlButton>
      <ControlButton title="Tümünü sığdır" onClick={fitAll}>
        <Maximize2 size={15} strokeWidth={1.75} />
      </ControlButton>
      <ControlButton
        title="Konumuma dön"
        accent
        onClick={() => map.flyTo([home.lat, home.lng], 15.5, { duration: 0.7 })}
      >
        <Crosshair size={16} strokeWidth={1.75} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  title,
  onClick,
  accent,
  children,
}: {
  title: string;
  onClick: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        accent
          ? "grid size-9 place-items-center rounded-xl border border-ns-blue/40 tm-glass text-ns-blue transition-colors hover:bg-ns-blue/12"
          : "grid size-9 place-items-center rounded-xl border border-ns-border tm-glass text-ns-muted transition-colors hover:bg-ns-hover hover:text-slate-100"
      }
    >
      {children}
    </button>
  );
}

export default function MapComponent({
  pins,
  currentUser,
  selectedPinId,
  dimmedPinIds,
  connectedIds,
  route,
  walkerPosition,
  focus,
  drawerOpen,
  onSelectPin,
}: MapComponentProps) {
  const dimmed = useMemo(() => new Set(dimmedPinIds), [dimmedPinIds]);
  const padRight = drawerOpen ? DRAWER_WIDTH + 40 : 40;

  const routePositions = useMemo(
    () =>
      route
        ? route.path.map((point) => [point.lat, point.lng] as [number, number])
        : [],
    [route],
  );

  const allPoints = useMemo(
    () => [
      currentUser.position,
      ...pins.map((pin) =>
        pin.kind === "person" && !isConnectedPerson(pin, connectedIds)
          ? pin.focusArea.center
          : pin.position,
      ),
    ],
    [pins, currentUser.position, connectedIds],
  );

  return (
    <MapContainer
      key={MAP_INSTANCE_KEY}
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={MAP_ZOOM}
      minZoom={11}
      maxZoom={19}
      zoomControl={false}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      {/* Zemin ve etiketler ayrı katmanlar: her biri kendi tonunda işlenir. */}
      <TileLayer
        className="tm-tiles-base"
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · TeknoMaps'
      />
      <TileLayer
        className="tm-tiles-labels"
        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      {route ? (
        <>
          {/* İnce gölge katmanı rotayı zeminden ayırır. */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#080C12",
              weight: 8,
              opacity: 0.35,
              lineCap: "round",
              lineJoin: "round",
              interactive: false,
            }}
          />
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: PALETTE.accent,
              weight: 4,
              opacity: 0.9,
              dashArray: route.precise ? undefined : "10 8",
              lineCap: "round",
              lineJoin: "round",
              interactive: false,
            }}
          />
        </>
      ) : null}

      <Marker
        position={[currentUser.position.lat, currentUser.position.lng]}
        icon={selfIcon()}
        zIndexOffset={400}
      />

      {walkerPosition ? (
        <Marker
          position={[walkerPosition.lat, walkerPosition.lng]}
          icon={walkerIcon()}
          zIndexOffset={800}
        />
      ) : null}

      {pins.map((pin) => {
        const isSelected = pin.id === selectedPinId;
        const isDimmed = dimmed.has(pin.id);

        if (pin.kind === "workspace") {
          return (
            <Marker
              key={pin.id}
              position={[pin.position.lat, pin.position.lng]}
              icon={buildWorkspaceIcon(pin, isSelected, isDimmed)}
              zIndexOffset={
                isSelected
                  ? 600
                  : pin.table
                    ? 300
                    : pin.equipment?.length
                      ? 220
                      : 100
              }
              eventHandlers={{ click: () => onSelectPin(pin) }}
            />
          );
        }

        // Gizlilik: bağlantı yoksa tam koordinat haritaya hiç yazılmaz,
        // yalnızca şeffaf odak alanı çizilir.
        if (!isConnectedPerson(pin, connectedIds)) {
          const area = pin.focusArea;
          return (
            <Fragment key={pin.id}>
              <Circle
                center={[area.center.lat, area.center.lng]}
                radius={area.radius}
                pathOptions={{
                  className: "tm-fuzzy-ring",
                  color: PALETTE.accentSoft,
                  weight: 1.2,
                  opacity: isDimmed ? 0.12 : 0.4,
                  dashArray: "5 9",
                  fillColor: PALETTE.accentSoft,
                  fillOpacity: isDimmed ? 0.02 : isSelected ? 0.1 : 0.06,
                  interactive: false,
                }}
              />
              <Marker
                position={[area.center.lat, area.center.lng]}
                icon={buildFuzzyIcon(pin, isSelected, isDimmed)}
                zIndexOffset={isSelected ? 600 : 200}
                eventHandlers={{ click: () => onSelectPin(pin) }}
              />
            </Fragment>
          );
        }

        return (
          <Marker
            key={pin.id}
            position={[pin.position.lat, pin.position.lng]}
            icon={buildPersonIcon(pin, isSelected, isDimmed)}
            zIndexOffset={isSelected ? 600 : 250}
            eventHandlers={{ click: () => onSelectPin(pin) }}
          />
        );
      })}

      <MapCommands focus={focus} route={route} padRight={padRight} />
      <MapControls
        home={currentUser.position}
        points={allPoints}
        padRight={padRight}
        shifted={drawerOpen}
      />
    </MapContainer>
  );
}
