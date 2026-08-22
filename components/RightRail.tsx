"use client";

import { Radio, Search, Sparkles, TrendingUp } from "lucide-react";
import { SUGGESTED, TRENDS } from "@/lib/feedData";
import { CURRENT_USER, PEOPLE, WORKSPACES, pinAccent } from "@/lib/mockData";
import EngineeringScoreCard from "./EngineeringScoreCard";

interface RightRailProps {
  onOpenMaps: () => void;
}

export default function RightRail({ onOpenMaps }: RightRailProps) {
  const liveTables = WORKSPACES.filter((workspace) => workspace.table);
  const onlinePeople = PEOPLE.filter((person) => person.online).length;
  const ranked = [...PEOPLE].sort(
    (a, b) => b.engineeringScore - a.engineeringScore,
  );

  return (
    <aside className="hidden h-full w-[330px] shrink-0 overflow-y-auto border-l border-ns-border px-4 py-3 xl:block">
      <div className="mb-3 flex items-center gap-2 rounded-full border border-ns-border bg-ns-panel px-3.5 py-2.5">
        <Search size={16} className="text-ns-muted" />
        <input
          placeholder="Takım, kişi veya etiket ara"
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-ns-muted"
        />
      </div>

      <EngineeringScoreCard
        score={CURRENT_USER.engineeringScore}
        breakdown={CURRENT_USER.scoreBreakdown}
        metrics={CURRENT_USER.verifiedMetrics}
      />

      <section className="mt-3 mb-3 overflow-hidden rounded-2xl border border-ns-border bg-ns-card">
        <div className="border-b border-ns-border px-4 py-3">
          <h3 className="text-[15px] font-bold text-slate-50">
            NES Sıralaması
          </h3>
          <p className="mt-0.5 text-[11.5px] text-ns-dim">
            Doğrulanmış mühendislik skoru · gönüllü imece
          </p>
        </div>
        <div className="divide-y divide-ns-border">
          {ranked.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={onOpenMaps}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ns-hover"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ns-border bg-ns-panel text-[11px] font-bold text-ns-blue-soft">
                {person.engineeringScore}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-slate-100">
                  {person.name}
                </span>
                <span className="block truncate text-[11px] text-ns-dim">
                  {person.verifiedMetrics.sprints} sprint ·{" "}
                  {person.verifiedMetrics.imeceCount} imece
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-3 overflow-hidden rounded-2xl border border-ns-blue/25 bg-ns-card">
        <div className="flex items-center justify-between border-b border-ns-border px-4 py-2.5">
          <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-white">
            <Radio size={15} strokeWidth={1.75} className="live-dot text-ns-blue" />
            TeknoMaps Canlı
          </h3>
          <span className="text-[11px] font-semibold text-ns-muted">
            {onlinePeople} çevrimiçi
          </span>
        </div>
        <div className="divide-y divide-ns-border">
          {liveTables.map((workspace) => {
            const accent = pinAccent(workspace);
            return (
              <button
                key={workspace.id}
                type="button"
                onClick={onOpenMaps}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ns-hover"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-sm"
                  style={{
                    background: `${accent}22`,
                    border: `1px solid ${accent}55`,
                  }}
                >
                  {workspace.glyph}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-slate-100">
                    {workspace.table?.title ?? workspace.name}
                  </span>
                  <span className="block truncate text-[11px] text-ns-muted">
                    {workspace.name} · {workspace.district}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onOpenMaps}
          className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-ns-blue transition-colors hover:bg-ns-hover"
        >
          Haritada tümünü gör
        </button>
      </section>

      <section className="mb-3 overflow-hidden rounded-2xl bg-ns-card">
        <h3 className="flex items-center gap-1.5 px-4 py-3 text-[17px] font-bold text-white">
          <TrendingUp size={17} className="text-ns-blue" />
          Gündemdekiler
        </h3>
        <div className="divide-y divide-ns-border/60">
          {TRENDS.map((trend, index) => (
            <button
              key={trend.topic}
              type="button"
              className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-ns-hover"
            >
              <span className="block text-[11px] text-ns-muted">
                {index + 1} · Türkiye&apos;de gündemde
              </span>
              <span className="block text-[14px] font-bold text-slate-100">
                {trend.topic}
              </span>
              <span className="block text-[11px] text-ns-muted">{trend.meta}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-ns-card pb-2">
        <h3 className="flex items-center gap-1.5 px-4 py-3 text-[17px] font-bold text-white">
          <Sparkles size={17} className="text-ns-blue" />
          Senin için öneriler
        </h3>
        {SUGGESTED.map((person) => (
          <div
            key={person.handle}
            className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-ns-hover"
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
              style={{ background: person.accent }}
            >
              {person.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-100">
                {person.name}
              </span>
              <span className="block truncate text-[12px] text-ns-muted">
                {person.handle}
              </span>
            </span>
            <button
              type="button"
              className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-bold text-[#0F141C] transition-colors hover:bg-white"
            >
              Takip et
            </button>
          </div>
        ))}
      </section>

      <p className="px-2 py-4 text-[11px] leading-relaxed text-ns-muted">
        TeknoMaps · TEKNOFEST NSosyal İnovasyon Yarışması prototipi. Harita
        verileri gösterim amaçlı üretilmiştir.
      </p>
    </aside>
  );
}
