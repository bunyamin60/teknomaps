"use client";

import dynamic from "next/dynamic";
import {
  Armchair,
  Check,
  Compass,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { pointAlongPath } from "@/lib/geo";
import { findMatches } from "@/lib/matching";
import { CURRENT_USER, PEOPLE, WORKSPACES, pinSkills } from "@/lib/mockData";
import { displayPosition, isConnectedPerson } from "@/lib/privacy";
import { activeStepIndex, buildRoute } from "@/lib/routing";
import { resolveDestination } from "@/lib/privacy";
import type {
  MapPin,
  NewTableDraft,
  PersonPin,
  RoutePlan,
  TableParticipant,
  WorkTable,
  WorkspacePin,
} from "@/lib/types";
import AiMatchCard from "./AiMatchCard";
import type { MapFocus } from "./MapComponent";
import OpenTableModal from "./OpenTableModal";
import PinDrawer from "./PinDrawer";
import RoutePanel from "./RoutePanel";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const NAV_TICK_MS = 90;
const NAV_STEP = 0.012;
/** Masa oturumu üç saat sonra kendiliğinden kalkar. */
const TABLE_HOURS = 3;

interface Toast {
  id: number;
  text: string;
  tone: "info" | "success";
}

export default function TeknoMapsView() {
  const [workspaces, setWorkspaces] = useState<WorkspacePin[]>(WORKSPACES);
  const [query, setQuery] = useState("");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [route, setRoute] = useState<RoutePlan | null>(null);
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>(() =>
    PEOPLE.filter((person) => person.isConnected).map((person) => person.id),
  );
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tableModal, setTableModal] = useState<{ venueId: string | null } | null>(
    null,
  );
  const progressRef = useRef(0);

  const updateProgress = useCallback((value: number) => {
    progressRef.current = value;
    setProgress(value);
  }, []);

  const pushToast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, tone }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      2800,
    );
  }, []);

  /** Şehir mekanları ve festival noktaları tek listede akar. */
  const allPins = useMemo<MapPin[]>(
    () => [...workspaces, ...PEOPLE],
    [workspaces],
  );

  const myTableVenue = useMemo(
    () => workspaces.find((workspace) => workspace.table?.isMine) ?? null,
    [workspaces],
  );

  const summary = useMemo(() => {
    const live = workspaces.filter((workspace) => workspace.table);
    return {
      venues: workspaces.length,
      liveTables: live.length,
      developers: live.reduce(
        (total, workspace) => total + (workspace.table?.participants.length ?? 0),
        0,
      ),
      openSeats: live.reduce(
        (total, workspace) => total + (workspace.table?.request?.openSeats ?? 0),
        0,
      ),
    };
  }, [workspaces]);

  const dimmedPinIds = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr");
    if (!term) return [];
    return allPins
      .filter((pin) => {
        const district = pin.kind === "workspace" ? pin.district : pin.title;
        const haystack = [pin.name, district, ...pinSkills(pin)]
          .join(" ")
          .toLocaleLowerCase("tr");
        return !haystack.includes(term);
      })
      .map((pin) => pin.id);
  }, [query, allPins]);

  const selectedPin = useMemo(
    () => allPins.find((pin) => pin.id === selectedPinId) ?? null,
    [allPins, selectedPinId],
  );

  const fuzzyCount = useMemo(
    () =>
      PEOPLE.filter((person) => !isConnectedPerson(person, connectedIds)).length,
    [connectedIds],
  );

  const matches = useMemo(
    () => findMatches(CURRENT_USER, allPins, connectedIds, 3),
    [allPins, connectedIds],
  );

  const walkerPosition = useMemo(
    () => (route && progress > 0 ? pointAlongPath(route.path, progress) : null),
    [route, progress],
  );

  useEffect(() => {
    if (!isNavigating || !route) return;
    const timer = window.setInterval(() => {
      const next = Math.min(1, progressRef.current + NAV_STEP);
      updateProgress(next);
      if (next >= 1) {
        window.clearInterval(timer);
        setIsNavigating(false);
        pushToast(`Hedefe vardın: ${route.targetName}`, "success");
      }
    }, NAV_TICK_MS);
    return () => window.clearInterval(timer);
  }, [isNavigating, route, pushToast, updateProgress]);

  const focusOn = useCallback(
    (pin: MapPin, zoom?: number) => {
      // Gizli profillerde kamera tam konuma değil, odak alanına gider.
      setFocus({
        position: displayPosition(pin, connectedIds),
        key: Date.now(),
        zoom,
      });
    },
    [connectedIds],
  );

  const handleSelectPin = useCallback(
    (pin: MapPin) => {
      setSelectedPinId(pin.id);
      focusOn(pin);
    },
    [focusOn],
  );

  /** Rota hedefi, gizlilik durumuna göre tam konum veya odak alanı olur. */
  const startRoute = useCallback(
    (pin: MapPin, ids: string[]) => {
      const plan = buildRoute(
        CURRENT_USER.position,
        resolveDestination(pin, ids),
      );
      setRoute(plan);
      updateProgress(0);
      setIsNavigating(true);
      setSelectedPinId(
        typeof window !== "undefined" && window.innerWidth < 640 ? null : pin.id,
      );
      pushToast(
        plan.transit
          ? `Toplu taşıma rotası · ${plan.targetName} · ~${plan.etaMinutes} dk`
          : `Yürüyüş rotası hazır · ${plan.targetName} · ${plan.etaMinutes} dk`,
        "success",
      );
      return plan;
    },
    [pushToast, updateProgress],
  );

  const handleCreateRoute = useCallback(
    (pin: MapPin) => startRoute(pin, connectedIds),
    [startRoute, connectedIds],
  );

  const handleConnect = useCallback(
    (person: PersonPin) => {
      if (isConnectedPerson(person, connectedIds)) return;
      const nextIds = [...connectedIds, person.id];
      setConnectedIds(nextIds);
      pushToast(`Bağlantı kuruldu · ${person.name} tam konumunu paylaştı`, "success");
      setFocus({ position: person.position, key: Date.now(), zoom: 17 });
      // Odak alanına çizilmiş aktif rota varsa tam konuma yükseltilir.
      if (route?.targetId === person.id && !route.precise) {
        startRoute(person, nextIds);
      }
    },
    [connectedIds, pushToast, route, startRoute],
  );

  const handleJoinTable = useCallback(
    (workspace: WorkspacePin) => {
      if (!workspace.table) return;
      pushToast(
        `Selam gönderildi · ${workspace.name} · ${workspace.table.title}`,
        "success",
      );
    },
    [pushToast],
  );

  const handleGreetParticipant = useCallback(
    (participant: TableParticipant) => {
      pushToast(`${participant.name} ile sohbet başlatıldı`);
    },
    [pushToast],
  );

  const handleCreateTable = useCallback(
    (draft: NewTableDraft) => {
      const venue = workspaces.find((item) => item.id === draft.venueId);
      if (!venue) return;

      const ends = new Date(Date.now() + TABLE_HOURS * 60 * 60 * 1000);
      const endsAt = `${String(ends.getHours()).padStart(2, "0")}:${String(
        ends.getMinutes(),
      ).padStart(2, "0")}`;

      const table: WorkTable = {
        id: `table-mine-${Date.now()}`,
        title: "Senin Masan",
        topic: draft.topic,
        endsAt,
        isMine: true,
        participants: [
          {
            id: "tp-me",
            name: CURRENT_USER.name,
            initials: CURRENT_USER.initials,
            handle: CURRENT_USER.handle,
            skills: CURRENT_USER.skills,
            isHost: true,
          },
        ],
        request: draft.note
          ? { note: draft.note, openSeats: 3, skills: [] }
          : undefined,
      };

      // Aynı anda tek masa: varsa önceki masa kaldırılır.
      setWorkspaces((current) =>
        current.map((item) => {
          if (item.id === venue.id) return { ...item, table };
          if (item.table?.isMine) return { ...item, table: undefined };
          return item;
        }),
      );

      setTableModal(null);
      setSelectedPinId(venue.id);
      setFocus({ position: venue.position, key: Date.now(), zoom: 17 });
      pushToast(
        `Masan haritada · ${venue.name} · ${endsAt}'a kadar açık`,
        "success",
      );
    },
    [workspaces, pushToast],
  );

  const handleCloseMyTable = useCallback(
    (workspace: WorkspacePin) => {
      setWorkspaces((current) =>
        current.map((item) =>
          item.id === workspace.id ? { ...item, table: undefined } : item,
        ),
      );
      pushToast(`Masan kapatıldı · ${workspace.name}`);
    },
    [pushToast],
  );

  const closeRoute = useCallback(() => {
    setRoute(null);
    setIsNavigating(false);
    updateProgress(0);
  }, [updateProgress]);

  const openTableFlow = useCallback(() => {
    if (myTableVenue) {
      setSelectedPinId(myTableVenue.id);
      setFocus({ position: myTableVenue.position, key: Date.now(), zoom: 17 });
      return;
    }
    setTableModal({ venueId: null });
  }, [myTableVenue]);

  const drawerOpen = Boolean(selectedPin);

  return (
    <div className="relative h-full w-full overflow-hidden bg-ns-bg">
      <MapComponent
        pins={allPins}
        currentUser={CURRENT_USER}
        selectedPinId={selectedPinId}
        dimmedPinIds={dimmedPinIds}
        connectedIds={connectedIds}
        route={route}
        walkerPosition={walkerPosition}
        focus={focus}
        drawerOpen={drawerOpen}
        onSelectPin={handleSelectPin}
      />

      {/* Özet + arama: mod veya katman anahtarı yok, tek görünüm. */}
      <div className="pointer-events-auto absolute top-3 left-3 z-[605] w-[min(66vw,282px)] overflow-hidden rounded-2xl border border-ns-border tm-glass sm:w-[282px]">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Compass size={15} strokeWidth={1.75} className="text-ns-blue" />
          <span className="text-[12.5px] font-semibold text-slate-100">
            Çalışma Haritası
          </span>
          <span className="ml-auto text-[10.5px] font-medium text-ns-dim">
            {summary.venues} mekan
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 px-3 pb-2.5">
          <Stat label={`${summary.liveTables} canlı masa`} accent />
          <Stat label={`${summary.developers} geliştirici`} />
          <Stat label={`${summary.openSeats} boş sandalye`} />
        </div>

        <div className="flex items-center gap-2 border-t border-ns-border/70 px-3 py-2">
          <Search size={13} strokeWidth={1.75} className="text-ns-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Konu, mekan veya yetkinlik ara"
            className="w-full bg-transparent text-[12px] text-slate-200 outline-none placeholder:text-ns-dim"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-ns-dim transition-colors hover:text-slate-100"
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        {fuzzyCount > 0 ? (
          <p className="flex items-start gap-1.5 border-t border-ns-border/70 px-3 py-2 text-[10.5px] leading-snug text-ns-dim">
            <Lock size={11} strokeWidth={1.75} className="mt-px shrink-0" />
            <span>
              Kişisel konumlar haritaya işlenmez.{" "}
              <span className="font-medium text-ns-muted">
                {fuzzyCount} kişi
              </span>{" "}
              odak alanı olarak görünüyor.
            </span>
          </p>
        ) : null}
      </div>

      <AiMatchCard
        matches={matches}
        currentUser={CURRENT_USER}
        connectedIds={connectedIds}
        onSelect={handleSelectPin}
        onRoute={handleCreateRoute}
        onConnect={handleConnect}
        shifted={drawerOpen}
      />

      {route ? (
        <RoutePanel
          route={route}
          progress={progress}
          activeIndex={activeStepIndex(route, progress)}
          isNavigating={isNavigating}
          onToggleNavigation={() => {
            if (progress >= 1) updateProgress(0);
            setIsNavigating((value) => !value);
          }}
          onRestart={() => {
            updateProgress(0);
            setIsNavigating(true);
          }}
          onClose={closeRoute}
        />
      ) : null}

      {/* Çalışma masası aç / masamı göster */}
      <button
        type="button"
        onClick={openTableFlow}
        className={cn(
          "pointer-events-auto absolute right-3 bottom-4 z-[615] flex items-center gap-2 rounded-full bg-ns-blue px-4 py-3 text-[13px] font-semibold text-white transition-[transform,background-color] duration-300 hover:bg-[#1a8cd8]",
          drawerOpen && "sm:-translate-x-[384px]",
        )}
      >
        {myTableVenue ? (
          <Armchair size={16} strokeWidth={1.75} />
        ) : (
          <Plus size={16} strokeWidth={1.75} />
        )}
        {myTableVenue ? "Masamı Göster" : "Çalışma Masası Aç"}
      </button>

      {selectedPin ? (
        <PinDrawer
          pin={selectedPin}
          currentUser={CURRENT_USER}
          connectedIds={connectedIds}
          hasRoute={route?.targetId === selectedPin.id}
          onClose={() => setSelectedPinId(null)}
          onCreateRoute={handleCreateRoute}
          onConnect={handleConnect}
          onJoinTable={handleJoinTable}
          onGreetParticipant={handleGreetParticipant}
          onOpenTableHere={(venue) => setTableModal({ venueId: venue.id })}
          onCloseMyTable={handleCloseMyTable}
        />
      ) : null}

      {tableModal ? (
        <OpenTableModal
          venues={workspaces.filter(
            (workspace) => workspace.hostsTables && !workspace.table,
          )}
          currentUser={CURRENT_USER}
          initialVenueId={tableModal.venueId}
          onClose={() => setTableModal(null)}
          onCreate={handleCreateTable}
        />
      ) : null}

      {/* Bildirimler */}
      <div className="pointer-events-none absolute bottom-20 left-1/2 z-[700] flex w-[min(88vw,400px)] -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-medium animate-[var(--animate-fade-up)] tm-glass",
              toast.tone === "success"
                ? "border-ns-blue/35 text-slate-100"
                : "border-ns-border text-ns-muted",
            )}
          >
            {toast.tone === "success" ? (
              <Check size={14} strokeWidth={2} className="shrink-0 text-ns-blue" />
            ) : (
              <MessageCircle size={14} strokeWidth={1.75} className="shrink-0" />
            )}
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
        accent ? "bg-ns-blue/12 text-ns-blue-soft" : "bg-ns-hover text-ns-muted",
      )}
    >
      {label}
    </span>
  );
}

function MapSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-ns-bg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-ns-blue" />
        <p className="text-[13px] font-medium text-ns-muted">
          Çalışma haritası yükleniyor…
        </p>
      </div>
    </div>
  );
}
