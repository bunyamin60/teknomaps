"use client";

import dynamic from "next/dynamic";
import {
  Armchair,
  Check,
  Compass,
  Handshake,
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
import {
  CURRENT_USER,
  PEOPLE,
  WORKSPACES,
  allEquipment,
  canHostEquipment,
  currentUserAsParticipant,
  hasLiveTable,
  hasOpenImece,
  pinSearchText,
} from "@/lib/mockData";
import { creditSession } from "@/lib/nes";
import { displayPosition, isConnectedPerson } from "@/lib/privacy";
import { activeStepIndex, buildRoute } from "@/lib/routing";
import { resolveDestination } from "@/lib/privacy";
import type {
  EquipmentItem,
  LiveSession,
  MapPin,
  NewEquipmentDraft,
  NewTableDraft,
  PersonPin,
  RoutePlan,
  TableParticipant,
  WorkTable,
  WorkspacePin,
} from "@/lib/types";
import AiMatchCard from "./AiMatchCard";
import type { MapFocus } from "./MapComponent";
import LiveSessionPanel from "./LiveSessionPanel";
import OpenEquipmentModal from "./OpenEquipmentModal";
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
  /** AI paneli yalnızca rozete tıklanınca açılır; pin seçimi kapatır. */
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [imeceOnly, setImeceOnly] = useState(false);
  const [tablesOnly, setTablesOnly] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [solidarityPoints, setSolidarityPoints] = useState(
    CURRENT_USER.solidarityPoints,
  );
  const [nesBreakdown, setNesBreakdown] = useState(CURRENT_USER.scoreBreakdown);
  const [nesMetrics, setNesMetrics] = useState(CURRENT_USER.verifiedMetrics);
  const [nesScore, setNesScore] = useState(CURRENT_USER.engineeringScore);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [confirmingSession, setConfirmingSession] = useState(false);
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
    const equipment = allEquipment(workspaces);
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
      equipment: equipment.length,
      availableEquipment: equipment.filter((item) => item.isAvailable).length,
    };
  }, [workspaces]);

  const dimmedPinIds = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr");
    const layerOn = tablesOnly || imeceOnly;
    return allPins
      .filter((pin) => {
        if (layerOn) {
          const tableHit = tablesOnly && hasLiveTable(pin);
          const imeceHit = imeceOnly && hasOpenImece(pin);
          if (!tableHit && !imeceHit) return true;
        }
        if (!term) return false;
        return !pinSearchText(pin).toLocaleLowerCase("tr").includes(term);
      })
      .map((pin) => pin.id);
  }, [query, allPins, imeceOnly, tablesOnly]);

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
      setAiPanelOpen(false);
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
      setAiPanelOpen(false);
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

  const startLiveSession = useCallback(
    (workspace: WorkspacePin) => {
      if (!workspace.table) return;
      const peers = workspace.table.participants.filter(
        (participant) => participant.handle !== CURRENT_USER.handle,
      );
      setLiveSession({
        workspaceId: workspace.id,
        venueName: workspace.name,
        topic: workspace.table.topic,
        startedAt: Date.now(),
        peers:
          peers.length > 0
            ? peers.map((peer) => ({ name: peer.name, handle: peer.handle }))
            : [{ name: "Masa ekibi", handle: workspace.id }],
      });
      setConfirmingSession(false);
      setAiPanelOpen(false);
    },
    [],
  );

  const handleJoinTable = useCallback(
    (workspace: WorkspacePin) => {
      if (!workspace.table) return;
      const alreadySeated = workspace.table.participants.some(
        (participant) => participant.handle === CURRENT_USER.handle,
      );
      if (!alreadySeated) {
        const me = {
          ...currentUserAsParticipant("tp-me-guest"),
          engineeringScore: nesScore,
          scoreBreakdown: nesBreakdown,
          verifiedMetrics: nesMetrics,
        };
        setWorkspaces((current) =>
          current.map((item) => {
            if (item.id !== workspace.id || !item.table) return item;
            const open = item.table.request?.openSeats ?? 0;
            return {
              ...item,
              table: {
                ...item.table,
                participants: [...item.table.participants, me],
                request: item.table.request
                  ? {
                      ...item.table.request,
                      openSeats: Math.max(0, open - 1),
                    }
                  : undefined,
              },
            };
          }),
        );
      }
      startLiveSession(workspace);
      pushToast(
        `Masaya oturdun · BLE yakınlık doğrulanıyor · ${workspace.name}`,
        "success",
      );
    },
    [pushToast, startLiveSession, nesScore, nesBreakdown, nesMetrics],
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
            ...currentUserAsParticipant("tp-me", true),
            engineeringScore: nesScore,
            scoreBreakdown: nesBreakdown,
            verifiedMetrics: nesMetrics,
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
      setAiPanelOpen(false);
      setSelectedPinId(venue.id);
      setFocus({ position: venue.position, key: Date.now(), zoom: 17 });
      startLiveSession({ ...venue, table });
      pushToast(
        `Masan haritada · ${venue.name} · ${endsAt}'a kadar açık`,
        "success",
      );
    },
    [workspaces, pushToast, startLiveSession, nesScore, nesBreakdown, nesMetrics],
  );

  const handleCloseMyTable = useCallback(
    (workspace: WorkspacePin) => {
      setWorkspaces((current) =>
        current.map((item) =>
          item.id === workspace.id ? { ...item, table: undefined } : item,
        ),
      );
      if (liveSession?.workspaceId === workspace.id) {
        setLiveSession(null);
        setConfirmingSession(false);
      }
      pushToast(`Masan kapatıldı · ${workspace.name}`);
    },
    [pushToast, liveSession],
  );

  const handleConfirmSession = useCallback(() => {
    if (!liveSession) {
      setConfirmingSession(false);
      return;
    }
    const elapsed = Date.now() - (liveSession.startedAt || Date.now());
    try {
      const credited = creditSession(nesBreakdown, nesMetrics, elapsed);
      const nextScore = credited?.score || 0;
      setNesBreakdown(credited?.breakdown);
      setNesMetrics(credited?.metrics);
      setNesScore(nextScore);
      const gained =
        (credited?.metrics?.sprints || 0) - (nesMetrics?.sprints || 0);
      pushToast(
        `Oturum kaydı işlendi · NES ${nextScore}/100 · +${gained} doğrulanmış sprint`,
        "success",
      );
    } catch {
      pushToast("Oturum kaydı işlenemedi. Masa paneli kapatıldı.");
    } finally {
      setConfirmingSession(false);
      setLiveSession(null);
    }
  }, [liveSession, nesBreakdown, nesMetrics, pushToast]);

  const handleInviteParticipant = useCallback(
    (participant: TableParticipant) => {
      pushToast(
        `${participant.name} birlikte masaya davet edildi`,
        "success",
      );
    },
    [pushToast],
  );

  const handleConnectParticipant = useCallback(
    (participant: TableParticipant) => {
      pushToast(`Bağlantı isteği gönderildi · ${participant.name}`, "success");
    },
    [pushToast],
  );

  const handleRequestImece = useCallback(
    (workspace: WorkspacePin, item: EquipmentItem) => {
      setSolidarityPoints((points) => points + 1);
      pushToast(
        `NSosyal mesajı ve masa daveti gönderildi · ${item.name} · ${workspace.name}`,
        "success",
      );
    },
    [pushToast],
  );

  const handleCreateEquipment = useCallback(
    (draft: NewEquipmentDraft) => {
      const venue = workspaces.find((item) => item.id === draft.venueId);
      if (!venue) return;

      const item: EquipmentItem = {
        id: `eq-mine-${Date.now()}`,
        name: draft.name,
        category: draft.category,
        provider: CURRENT_USER.name,
        note:
          draft.note ||
          "Dayanışmaya açık; kendi sarf malzemenle gelmen yeterli.",
        isAvailable: true,
      };

      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === venue.id
            ? { ...workspace, equipment: [...(workspace.equipment ?? []), item] }
            : workspace,
        ),
      );
      setEquipmentModalOpen(false);
      setAiPanelOpen(false);
      setImeceOnly(true);
      setSelectedPinId(venue.id);
      setFocus({ position: venue.position, key: Date.now(), zoom: 17 });
      setSolidarityPoints((points) => points + 2);
      pushToast(
        `İmeceye açıldı · ${item.name} · ekosistem teşekkürü + dayanışma puanı`,
        "success",
      );
    },
    [workspaces, pushToast],
  );

  const closeRoute = useCallback(() => {
    setRoute(null);
    setIsNavigating(false);
    updateProgress(0);
  }, [updateProgress]);

  const openTableFlow = useCallback(() => {
    if (myTableVenue) {
      setAiPanelOpen(false);
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

      {/* Sol katman paneli */}
      <div className="pointer-events-auto absolute top-3 left-3 z-[605] w-[min(72vw,300px)] overflow-hidden rounded-2xl border border-ns-border tm-glass sm:w-[300px]">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <Compass size={16} strokeWidth={1.75} className="text-ns-blue" />
          <span className="text-[13px] font-semibold text-slate-50">
            Çalışma Haritası
          </span>
          <span className="ml-auto text-[11px] font-medium text-ns-muted">
            {summary.venues} mekan
          </span>
        </div>

        <div className="space-y-2 px-3.5 pb-3">
          <LayerToggle
            active={tablesOnly}
            emoji="🪑"
            title={`Canlı Çalışma Masaları (${summary.liveTables})`}
            hint={`${summary.developers} geliştirici · ${summary.openSeats} boş sandalye`}
            onClick={() => setTablesOnly((value) => !value)}
          />
          <LayerToggle
            active={imeceOnly}
            emoji="🤝"
            title={`Açık İmece Cihazları (${summary.equipment})`}
            hint={`${summary.availableEquipment} müsait · ${solidarityPoints} dayanışma puanı`}
            onClick={() => setImeceOnly((value) => !value)}
          />
        </div>

        <div className="flex items-center gap-2.5 border-t border-ns-border px-3.5 py-2.5">
          <Search size={14} strokeWidth={1.75} className="text-ns-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="3D Yazıcı, osiloskop, konu veya mekan"
            className="w-full bg-transparent py-1 text-[13px] text-slate-100 outline-none placeholder:text-ns-dim"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid size-7 place-items-center rounded-full text-ns-muted transition-colors hover:bg-ns-hover hover:text-slate-100"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        {fuzzyCount > 0 ? (
          <p className="flex items-start gap-1.5 border-t border-ns-border px-3.5 py-2.5 text-[11px] leading-snug text-ns-muted">
            <Lock size={12} strokeWidth={1.75} className="mt-px shrink-0" />
            <span>
              Kişisel konumlar haritaya işlenmez.{" "}
              <span className="font-medium text-slate-200">
                {fuzzyCount} kişi
              </span>{" "}
              odak alanı olarak görünüyor.
            </span>
          </p>
        ) : null}
      </div>

      {!drawerOpen ? (
        <AiMatchCard
          matches={matches}
          currentUser={CURRENT_USER}
          connectedIds={connectedIds}
          expanded={aiPanelOpen}
          onExpandedChange={setAiPanelOpen}
          onSelect={handleSelectPin}
          onRoute={handleCreateRoute}
          onConnect={handleConnect}
        />
      ) : null}

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

      {liveSession ? (
        <LiveSessionPanel
          session={liveSession}
          confirming={confirmingSession}
          shifted={drawerOpen}
          onRequestVerify={() => setConfirmingSession(true)}
          onCancelConfirm={() => setConfirmingSession(false)}
          onConfirm={handleConfirmSession}
          onDismiss={() => {
            setLiveSession(null);
            setConfirmingSession(false);
          }}
        />
      ) : null}

      {/* Çalışma masası ve imece */}
      <div
        className={cn(
          "pointer-events-auto absolute right-3 bottom-4 z-[615] flex flex-col items-end gap-3 transition-transform duration-300",
          drawerOpen && "sm:-translate-x-[384px]",
        )}
      >
        <button
          type="button"
          onClick={() => {
            setAiPanelOpen(false);
            setEquipmentModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-full border border-ns-border bg-ns-card/95 px-4 py-3 text-[13px] font-semibold text-slate-100 backdrop-blur-md transition-colors hover:border-ns-blue/40 hover:bg-ns-hover"
        >
          <Handshake size={16} strokeWidth={1.75} className="text-ns-blue" />
          İmeceye Cihaz Ekle
        </button>
        <button
          type="button"
          onClick={openTableFlow}
          className="flex items-center gap-2 rounded-full bg-ns-blue px-5 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
        >
          {myTableVenue ? (
            <Armchair size={16} strokeWidth={1.75} />
          ) : (
            <Plus size={16} strokeWidth={1.75} />
          )}
          {myTableVenue ? "Masamı Göster" : "Çalışma Masası Aç"}
        </button>
      </div>

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
          onInviteParticipant={handleInviteParticipant}
          onConnectParticipant={handleConnectParticipant}
          onOpenTableHere={(venue) => setTableModal({ venueId: venue.id })}
          onCloseMyTable={handleCloseMyTable}
          onRequestImece={handleRequestImece}
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

      {equipmentModalOpen ? (
        <OpenEquipmentModal
          venues={workspaces.filter(canHostEquipment)}
          currentUser={CURRENT_USER}
          onClose={() => setEquipmentModalOpen(false)}
          onCreate={handleCreateEquipment}
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

function LayerToggle({
  active,
  emoji,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  emoji: string;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-ns-blue/40 bg-ns-blue/12"
          : "border-ns-border bg-ns-panel hover:bg-ns-hover",
      )}
    >
      <span className="text-[15px]">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[12.5px] font-semibold",
            active ? "text-slate-50" : "text-slate-200",
          )}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] text-ns-muted">{hint}</span>
      </span>
    </button>
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
