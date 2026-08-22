"use client";

import { ArrowLeft, Link2, MessageCircle, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TableParticipant } from "@/lib/types";
import EngineeringScoreCard from "./EngineeringScoreCard";

interface PersonProfilePanelProps {
  person: TableParticipant;
  isSelf?: boolean;
  connected?: boolean;
  onBack?: () => void;
  onConnect: () => void;
  onMessage: () => void;
  onInvite: () => void;
}

export default function PersonProfilePanel({
  person,
  isSelf = false,
  connected = false,
  onBack,
  onConnect,
  onMessage,
  onInvite,
}: PersonProfilePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col animate-[var(--animate-panel-fade)]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full border border-ns-border bg-[#0F141C] px-3 py-1.5 text-[12px] font-semibold text-slate-100 transition-colors hover:bg-ns-hover"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Masaya Geri Dön
        </button>
      ) : null}

      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-ns-border bg-[#0F141C] text-[13px] font-bold text-[#38BDF8]">
          {person.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
            Detaylı NSosyal Mühendislik Profili
          </p>
          <h2 className="mt-0.5 truncate text-[16px] font-semibold text-slate-50">
            {person.name}
          </h2>
          <p className="truncate text-[12px] text-ns-muted">
            {person.handle}
            {person.title ? ` · ${person.title}` : ""}
          </p>
          {person.skills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {person.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-ns-blue/12 px-1.5 py-0.5 text-[10.5px] font-medium text-[#38BDF8]"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-ns-blue/30 bg-ns-blue/12 px-2 py-1 text-[11px] font-semibold text-[#38BDF8]">
          ⚡ {person.engineeringScore ?? 0} NES
        </span>
      </div>

      <EngineeringScoreCard
        score={person.engineeringScore}
        breakdown={person.scoreBreakdown}
        metrics={person.verifiedMetrics}
      />

      {!isSelf ? (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConnect}
              disabled={connected}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold transition-colors",
                connected
                  ? "cursor-default bg-ns-blue/12 text-[#38BDF8]"
                  : "bg-slate-100 text-[#0F141C] hover:bg-white",
              )}
            >
              {connected ? <Link2 size={14} strokeWidth={1.75} /> : <UserPlus size={14} strokeWidth={1.75} />}
              {connected ? "Bağlantıdasınız" : "Bağlantı Kur"}
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ns-border py-2.5 text-[13px] font-semibold text-slate-100 transition-colors hover:bg-ns-hover"
            >
              <MessageCircle size={14} strokeWidth={1.75} />
              Mesaj
            </button>
          </div>
          <button
            type="button"
            onClick={onInvite}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ns-blue py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            <Users size={15} strokeWidth={1.75} />
            Birlikte Masaya Davet Et
          </button>
        </div>
      ) : null}
    </div>
  );
}
