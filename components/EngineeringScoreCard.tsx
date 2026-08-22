"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  NES_MAX,
  NES_PILLARS,
  normalizeBreakdown,
  normalizeMetrics,
  pillarFill,
  type NesPillarKey,
} from "@/lib/nes";
import type { ScoreBreakdown, VerifiedMetrics } from "@/lib/types";

interface EngineeringScoreCardProps {
  score: number;
  breakdown?: ScoreBreakdown | null;
  metrics?: VerifiedMetrics | null;
  compact?: boolean;
}

export default function EngineeringScoreCard({
  score,
  breakdown,
  metrics,
  compact = false,
}: EngineeringScoreCardProps) {
  const [openKey, setOpenKey] = useState<NesPillarKey | null>(null);
  const safeBreakdown = useMemo(() => normalizeBreakdown(breakdown), [breakdown]);
  const safeMetrics = useMemo(() => normalizeMetrics(metrics), [metrics]);
  const safeScore = Number.isFinite(score) ? score : 0;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - Math.min(100, safeScore) / 100);

  return (
    <section className="rounded-2xl border border-ns-border bg-ns-card p-4">
      <p className="text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
        Doğrulanmış Mühendislik Karnesi (NES)
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative grid size-[56px] shrink-0 place-items-center">
          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90" aria-hidden>
            <circle cx="28" cy="28" r="18" fill="none" stroke="#1E293B" strokeWidth="3.5" />
            <circle
              cx="28"
              cy="28"
              r="18"
              fill="none"
              stroke="#1D9BF0"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute text-center leading-tight">
            <span className="block text-[13px] font-bold text-slate-50">{safeScore}</span>
            {!compact ? (
              <span className="block text-[8px] font-medium text-ns-dim">/ 100</span>
            ) : null}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#7DCEA0]">
            <span className="size-1.5 rounded-full bg-[#7DCEA0]" />
            <ShieldCheck size={13} strokeWidth={1.75} />
            Kurumsal & Çıktı Doğrulamalı Profil
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-ns-muted">
            Bu karne resmi jüri kayıtları, GitHub kod çıktıları ve donanım
            imecesiyle doğrulanmıştır.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {NES_PILLARS.map((pillar) => {
          const data = safeBreakdown[pillar.key];
          const max = data?.max || NES_MAX[pillar.key] || 0;
          const value = data?.score || 0;
          const records = data?.records || [];
          const expanded = openKey === pillar.key;
          return (
            <li key={pillar.key} className="rounded-xl border border-ns-border bg-[#0F141C]">
              <button
                type="button"
                onClick={() =>
                  setOpenKey((current) => (current === pillar.key ? null : pillar.key))
                }
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
              >
                <span className="text-[14px]">{pillar.glyph}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-semibold text-slate-100">
                      {pillar.title}
                    </span>
                    <span className="shrink-0 text-[11.5px] font-semibold text-[#38BDF8]">
                      {value}/{max}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#1E293B]">
                    <span
                      className="block h-full rounded-full bg-ns-blue transition-[width] duration-300"
                      style={{ width: `${pillarFill(data)}%` }}
                    />
                  </span>
                </span>
                <ChevronDown
                  size={15}
                  strokeWidth={1.75}
                  className={cn(
                    "shrink-0 text-ns-dim transition-transform duration-300",
                    expanded && "rotate-180 text-[#38BDF8]",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap gap-1.5 border-t border-ns-border px-3 py-2.5">
                    {records.length > 0 ? (
                      records.map((record) => (
                        <span
                          key={record}
                          className="rounded-full border border-ns-border bg-ns-panel px-2.5 py-1 text-[10.5px] leading-snug text-ns-muted"
                        >
                          {record}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-ns-dim">
                        Henüz doğrulanmış kayıt yok.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ul className="mt-3 space-y-1.5">
        <Metric
          glyph="🎯"
          value={`${safeMetrics.sprints ?? 0} Doğrulanmış Sprint`}
          label="PR / çıktı bağlantılı çalışma"
        />
        <Metric
          glyph="🤝"
          value={`${safeMetrics.imeceCount ?? 0} Donanım İmecesi`}
          label="Cihaz ve şematik paylaşımı"
        />
        <Metric
          glyph="🏛️"
          value={`${safeMetrics.orgCount ?? 0} Doğrulanmış Kurum`}
          label={
            safeMetrics.verifiedInstitutions?.join(", ") ||
            "T3 Vakfı, TEKNOFEST, GitHub"
          }
        />
      </ul>
    </section>
  );
}

function Metric({
  glyph,
  value,
  label,
}: {
  glyph: string;
  value: string;
  label: string;
}) {
  return (
    <li className="flex items-start gap-2 rounded-xl border border-ns-border bg-[#0F141C] px-3 py-2.5">
      <span className="mt-px text-[13px]">{glyph}</span>
      <span>
        <span className="block text-[12.5px] font-semibold text-slate-50">{value}</span>
        <span className="block text-[11px] leading-snug text-ns-muted">{label}</span>
      </span>
    </li>
  );
}
