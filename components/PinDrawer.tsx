"use client";

import {
  Armchair,
  Check,
  Clock,
  ExternalLink,
  Info,
  Laptop,
  Link2,
  Lock,
  MapPin as MapPinIcon,
  MessageCircle,
  Navigation,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { distanceM, formatDistance } from "@/lib/geo";
import { venueLabel } from "@/lib/mockData";
import { displayPosition, isConnectedPerson } from "@/lib/privacy";
import type {
  CurrentUser,
  MapPin,
  PersonPin,
  TableParticipant,
  WorkspacePin,
} from "@/lib/types";

interface PinDrawerProps {
  pin: MapPin;
  currentUser: CurrentUser;
  connectedIds: string[];
  hasRoute: boolean;
  onClose: () => void;
  onCreateRoute: (pin: MapPin) => void;
  onConnect: (person: PersonPin) => void;
  onJoinTable: (pin: WorkspacePin) => void;
  onGreetParticipant: (participant: TableParticipant) => void;
  onOpenTableHere: (pin: WorkspacePin) => void;
  onCloseMyTable: (pin: WorkspacePin) => void;
}

const normalize = (value: string) => value.toLocaleLowerCase("tr");

export default function PinDrawer({
  pin,
  currentUser,
  connectedIds,
  hasRoute,
  onClose,
  onCreateRoute,
  onConnect,
  onJoinTable,
  onGreetParticipant,
  onOpenTableHere,
  onCloseMyTable,
}: PinDrawerProps) {
  const mySkills = new Set(currentUser.skills.map(normalize));
  const meters = distanceM(
    currentUser.position,
    displayPosition(pin, connectedIds),
  );
  const connected = pin.kind === "person" && isConnectedPerson(pin, connectedIds);
  const approximate = pin.kind === "person" && !connected;
  const table = pin.kind === "workspace" ? pin.table : undefined;

  return (
    <section
      key={pin.id}
      className="pointer-events-auto absolute inset-y-0 right-0 z-[620] flex w-full flex-col border-l border-ns-border bg-ns-card/97 animate-[var(--animate-slide-in)] backdrop-blur-xl sm:w-[384px]"
    >
      <header className="flex items-start gap-3 border-b border-ns-border px-4 py-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-ns-border bg-ns-panel text-[15px] font-semibold text-slate-100">
          {pin.kind === "person" ? pin.initials : pin.glyph}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] leading-snug font-semibold text-slate-50">
            {pin.kind === "person"
              ? pin.name
              : table
                ? `${pin.name} — ${table.title}`
                : pin.name}
          </h2>
          <p className="mt-0.5 truncate text-[12.5px] text-ns-muted">
            {pin.kind === "person"
              ? `${pin.handle} · ${pin.title}`
              : `${venueLabel(pin)} · ${pin.district}`}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge
              icon={MapPinIcon}
              label={`${approximate ? "~" : ""}${formatDistance(meters)}`}
            />
            {table ? (
              <Badge icon={Clock} label={`${table.endsAt}'a kadar`} />
            ) : null}
            {table?.request?.openSeats ? (
              <Badge
                icon={Armchair}
                label={`${table.request.openSeats} boş sandalye`}
                tone="accent"
              />
            ) : null}
            {pin.kind === "person" && pin.online ? (
              <Badge icon={Sparkles} label="Çevrimiçi" tone="accent" />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Kapat"
          className="grid size-8 shrink-0 place-items-center rounded-full text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
        >
          <X size={17} strokeWidth={1.75} />
        </button>
      </header>

      <div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-3.5">
        {pin.kind === "person" ? (
          <PrivacyNote person={pin} connected={connected} />
        ) : null}

        {pin.kind === "person" ? (
          <Block title="Şu an üzerinde çalışıyor" icon={Laptop}>
            <p className="text-[13.5px] font-medium text-slate-200">
              {pin.workingOn}
            </p>
          </Block>
        ) : null}

        {table ? (
          <>
            <Block title="Masa konusu" icon={Sparkles}>
              <p className="text-[13.5px] font-medium text-slate-200">
                {table.topic}
              </p>
            </Block>

            <div>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
                <Users size={12} strokeWidth={1.75} />
                Masadakiler
              </h3>
              <ul className="space-y-1.5">
                {table.participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex items-start gap-2.5 rounded-xl border border-ns-border bg-ns-panel px-2.5 py-2"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ns-border bg-ns-hover text-[11px] font-semibold text-slate-200">
                      {participant.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-slate-100">
                          {participant.name}
                        </span>
                        {participant.isHost ? (
                          <span className="shrink-0 rounded-full bg-ns-blue/12 px-1.5 py-0.5 text-[9.5px] font-semibold text-ns-blue-soft">
                            masa sahibi
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11.5px] text-ns-dim">
                        {participant.handle}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {participant.skills.map((skill) => (
                          <span
                            key={skill}
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                              mySkills.has(normalize(skill))
                                ? "bg-ns-blue/12 text-ns-blue-soft"
                                : "bg-ns-hover text-ns-muted",
                            )}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onGreetParticipant(participant)}
                      title="Selam gönder"
                      className="grid size-8 shrink-0 place-items-center rounded-full text-ns-dim transition-colors hover:bg-ns-hover hover:text-slate-100"
                    >
                      <MessageCircle size={15} strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {table.request ? (
              <div className="rounded-xl border border-ns-blue/25 bg-ns-blue/8 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ns-blue-soft uppercase">
                  <Armchair size={12} strokeWidth={1.75} />
                  Masa notu
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-200">
                  {table.request.note}
                </p>
                {table.request.skills.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {table.request.skills.map((skill) => (
                      <span
                        key={skill}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                          mySkills.has(normalize(skill))
                            ? "bg-ns-blue/15 text-ns-blue-soft"
                            : "bg-ns-hover text-ns-muted",
                        )}
                      >
                        {skill}
                        {mySkills.has(normalize(skill)) ? " · sende var" : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}

        {pin.kind === "workspace" && !table ? (
          <div className="rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5">
            <p className="text-[13px] leading-relaxed text-slate-300">
              Bu mekanda şu an açık bir masa yok.
              {pin.hostsTables
                ? " İlk masayı sen açabilirsin; 3 saat boyunca haritada görünür."
                : ""}
            </p>
          </div>
        ) : null}

        {pin.kind === "workspace" ? (
          <Block title="Mekan hakkında" icon={Info}>
            <p className="text-[13.5px] leading-relaxed text-slate-300">
              {pin.note}
            </p>
          </Block>
        ) : null}

        {pin.kind === "person" ? (
          <Block title="Uzmanlık alanları" icon={Sparkles}>
            <div className="flex flex-wrap gap-1.5">
              {pin.skills.map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    "rounded-lg px-2 py-1 text-[11.5px] font-medium",
                    mySkills.has(normalize(skill))
                      ? "bg-ns-blue/12 text-ns-blue-soft"
                      : "bg-ns-hover text-ns-muted",
                  )}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Block>
        ) : null}

        {pin.kind === "person" ? (
          <a
            href="#nsosyal-profile"
            className="flex items-center justify-between rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 transition-colors hover:bg-ns-hover"
          >
            <span className="text-[13px] font-medium text-slate-200">
              NSosyal profilini aç
            </span>
            <span className="flex items-center gap-1 text-[12px] text-ns-blue">
              {pin.handle}
              <ExternalLink size={12} strokeWidth={1.75} />
            </span>
          </a>
        ) : null}
      </div>

      <footer className="space-y-2 border-t border-ns-border px-4 py-3">
        {table ? (
          table.isMine ? (
            <button
              type="button"
              onClick={() => onCloseMyTable(pin as WorkspacePin)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-ns-border py-2.5 text-[13px] font-semibold text-slate-200 transition-colors hover:bg-ns-hover"
            >
              <X size={15} strokeWidth={1.75} />
              Masamı Kapat
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onJoinTable(pin as WorkspacePin)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
            >
              <Users size={16} strokeWidth={1.75} />
              Masaya Katıl / Selam Gönder
            </button>
          )
        ) : null}

        {pin.kind === "workspace" && !table && pin.hostsTables ? (
          <button
            type="button"
            onClick={() => onOpenTableHere(pin)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            <Plus size={16} strokeWidth={1.75} />
            Burada Masa Aç
          </button>
        ) : null}

        {pin.kind === "person" ? (
          <>
            <button
              type="button"
              onClick={() => onCreateRoute(pin)}
              disabled={!connected}
              title={connected ? undefined : "Bağlantı kurulduğunda aktifleşir"}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-semibold transition-colors",
                connected
                  ? "bg-ns-blue text-white hover:bg-[#1a8cd8]"
                  : "cursor-not-allowed border border-dashed border-ns-border text-ns-dim",
              )}
            >
              {connected ? (
                <Navigation size={16} strokeWidth={1.75} />
              ) : (
                <Lock size={15} strokeWidth={1.75} />
              )}
              {hasRoute ? "Hassas Yol Tarifini Yenile" : "Hassas Yol Tarifi Al"}
            </button>
            <div className="flex gap-2">
              {!connected ? (
                <button
                  type="button"
                  onClick={() => onCreateRoute(pin)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ns-border py-2.5 text-[13px] font-medium text-slate-200 transition-colors hover:bg-ns-hover"
                >
                  <Navigation size={15} strokeWidth={1.75} />
                  Odak Alanına Rota
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onConnect(pin)}
                disabled={connected}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold transition-colors",
                  connected
                    ? "cursor-default bg-ns-blue/12 text-ns-blue-soft"
                    : "bg-slate-100 text-[#0F141C] hover:bg-white",
                )}
              >
                {connected ? (
                  <Check size={15} strokeWidth={2} />
                ) : (
                  <Link2 size={15} strokeWidth={1.75} />
                )}
                {connected ? "Bağlantıdasınız" : "NSosyal ile Bağlan"}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onCreateRoute(pin)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ns-border py-2.5 text-[13px] font-medium text-slate-200 transition-colors hover:bg-ns-hover"
          >
            <Navigation size={15} strokeWidth={1.75} />
            {hasRoute ? "Yol Tarifini Yenile" : "Yol Tarifi Al"}
          </button>
        )}
      </footer>
    </section>
  );
}

function PrivacyNote({
  person,
  connected,
}: {
  person: PersonPin;
  connected: boolean;
}) {
  if (connected) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-ns-blue/25 bg-ns-blue/8 px-3 py-2.5">
        <ShieldCheck
          size={16}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-ns-blue-soft"
        />
        <p className="text-[12.5px] leading-snug text-slate-200">
          Bağlantı onaylı · tam konum paylaşımı açık. Hassas yol tarifi
          kullanılabilir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5">
      <Lock
        size={16}
        strokeWidth={1.75}
        className="mt-0.5 shrink-0 text-ns-muted"
      />
      <div>
        <p className="text-[12.5px] font-medium text-slate-200">
          Tam konum yalnızca NSosyal bağlantısı onaylandığında paylaşılır
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-ns-dim">
          Şimdilik yalnızca odak alanı görünüyor: {person.focusArea.label} · ~
          {person.focusArea.radius} m yarıçap.
        </p>
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  tone = "muted",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
        tone === "accent"
          ? "bg-ns-blue/12 text-ns-blue-soft"
          : "bg-ns-hover text-ns-muted",
      )}
    >
      <Icon size={10} strokeWidth={1.75} />
      {label}
    </span>
  );
}

function Block({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
        <Icon size={12} strokeWidth={1.75} />
        {title}
      </h3>
      {children}
    </div>
  );
}
