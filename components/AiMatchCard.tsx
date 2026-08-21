"use client";

import {
  Check,
  ChevronDown,
  Link2,
  Lock,
  Navigation,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { pinAccent, pinSubtitle } from "@/lib/mockData";
import { isConnectedPerson, revealsExactLocation } from "@/lib/privacy";
import type { AiMatch, CurrentUser, MapPin, PersonPin } from "@/lib/types";

interface AiMatchCardProps {
  matches: AiMatch[];
  currentUser: CurrentUser;
  connectedIds: string[];
  onSelect: (pin: MapPin) => void;
  onRoute: (pin: MapPin) => void;
  onConnect: (person: PersonPin) => void;
  shifted: boolean;
}

export default function AiMatchCard({
  matches,
  currentUser,
  connectedIds,
  onSelect,
  onRoute,
  onConnect,
  shifted,
}: AiMatchCardProps) {
  const [open, setOpen] = useState(true);
  const tableCount = matches.filter((match) => match.pin.kind === "workspace")
    .length;
  const peopleCount = matches.length - tableCount;

  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-3 right-3 z-[610] w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-ns-border tm-glass transition-transform duration-300",
        shifted && "sm:-translate-x-[384px]",
      )}
    >
      <div className="flex items-start gap-2.5 px-3.5 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ns-blue/12 text-ns-blue">
          <Sparkles size={16} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-50">
            Sana uygun masalar
          </p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-ns-muted">
            <span className="text-ns-blue-soft">{currentUser.skills[0]}</span>{" "}
            alanına uygun{" "}
            {[
              tableCount > 0 ? `${tableCount} masa` : null,
              peopleCount > 0 ? `${peopleCount} kişi` : null,
            ]
              .filter(Boolean)
              .join(" ve ")}{" "}
            bulundu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          title={open ? "Küçült" : "Genişlet"}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
        >
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className={cn("transition-transform", !open && "-rotate-90")}
          />
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100vh-190px)] overflow-y-auto border-t border-ns-border">
          {matches.length === 0 ? (
            <p className="px-3.5 py-4 text-[12px] text-ns-dim">
              Şu an yetkinliklerinle kesişen açık masa yok.
            </p>
          ) : null}

          {matches.map((match) => {
            const pin = match.pin;
            const approximate = !revealsExactLocation(pin, connectedIds);
            const connected =
              pin.kind === "person" && isConnectedPerson(pin, connectedIds);

            return (
              <div
                key={pin.id}
                className="border-b border-ns-border/70 px-3.5 py-2.5 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onSelect(pin)}
                  className="flex w-full items-start gap-2.5 text-left"
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-xl border text-[11px] font-semibold text-slate-100"
                    style={{
                      borderColor: `${pinAccent(pin)}55`,
                      background: `${pinAccent(pin)}1f`,
                    }}
                  >
                    {pin.kind === "person" ? pin.initials : pin.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-slate-100">
                        {pin.kind === "workspace" && pin.table
                          ? pin.table.title
                          : pin.name}
                      </span>
                      {approximate ? (
                        <Lock
                          size={11}
                          strokeWidth={1.75}
                          className="shrink-0 text-ns-dim"
                        />
                      ) : null}
                      <span className="ml-auto shrink-0 text-[10.5px] font-semibold text-ns-blue-soft">
                        %{match.score}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-ns-dim">
                      {pin.kind === "workspace" ? pin.name : pinSubtitle(pin)}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ns-muted">
                      {match.reason}
                    </span>
                  </span>
                </button>

                <div className="mt-1.5 flex flex-wrap gap-1">
                  {match.sharedSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-ns-blue/12 px-1.5 py-0.5 text-[10px] font-medium text-ns-blue-soft"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-2 flex gap-1.5">
                  {pin.kind === "person" ? (
                    <button
                      type="button"
                      onClick={() => onConnect(pin)}
                      disabled={connected}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                        connected
                          ? "cursor-default bg-ns-blue/12 text-ns-blue-soft"
                          : "bg-ns-blue text-white hover:bg-[#1a8cd8]",
                      )}
                    >
                      {connected ? (
                        <Check size={13} strokeWidth={2} />
                      ) : (
                        <Link2 size={13} strokeWidth={1.75} />
                      )}
                      {connected ? "Bağlantıda" : "Bağlantı Kur"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(pin)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ns-blue px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
                    >
                      <Users size={13} strokeWidth={1.75} />
                      Masayı Gör
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRoute(pin)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ns-border px-3 py-1.5 text-[12px] font-medium text-slate-200 transition-colors hover:bg-ns-hover"
                  >
                    <Navigation size={13} strokeWidth={1.75} />
                    Yol Tarifi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
