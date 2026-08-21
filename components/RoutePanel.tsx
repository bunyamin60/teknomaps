"use client";

import {
  ArrowUp,
  Bus,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  Footprints,
  Lock,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDistance, formatEta } from "@/lib/geo";
import type { RoutePlan, StepIcon } from "@/lib/types";

const STEP_ICONS: Record<StepIcon, LucideIcon> = {
  start: Navigation,
  straight: ArrowUp,
  left: CornerUpLeft,
  right: CornerUpRight,
  transit: Bus,
  arrive: Flag,
};

interface RoutePanelProps {
  route: RoutePlan;
  progress: number;
  activeIndex: number;
  isNavigating: boolean;
  onToggleNavigation: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export default function RoutePanel({
  route,
  progress,
  activeIndex,
  isNavigating,
  onToggleNavigation,
  onRestart,
  onClose,
}: RoutePanelProps) {
  const remainingMinutes = Math.max(
    0,
    Math.ceil(route.etaMinutes * (1 - progress)),
  );
  const arrived = progress >= 0.999;

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-[610] w-[min(92vw,382px)] animate-[var(--animate-fade-up)] overflow-hidden rounded-2xl border border-ns-border tm-glass">
      <div className="flex items-start gap-2.5 border-b border-ns-border px-3.5 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ns-blue/12 text-ns-blue">
          {route.transit ? (
            <Bus size={16} strokeWidth={1.75} />
          ) : (
            <Navigation size={16} strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-50">
            {route.transit
              ? "Toplu Taşıma Tarifi"
              : route.precise
                ? "Adım Adım Yol Tarifi"
                : "Bölgesel Yol Tarifi"}
          </p>
          <p className="truncate text-[12px] text-ns-dim">
            Hedef: <span className="text-slate-200">{route.targetName}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Rotayı kapat"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
        >
          <X size={15} strokeWidth={1.75} />
        </button>
      </div>

      {!route.precise ? (
        <p className="mx-3.5 mt-2.5 flex items-start gap-1.5 rounded-lg border border-ns-border bg-ns-panel px-2.5 py-1.5 text-[11.5px] leading-snug text-ns-muted">
          <Lock
            size={12}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0 text-ns-dim"
          />
          Rota kişinin genel çalışma alanına kadar çizildi. Tam konum için
          NSosyal üzerinden bağlantı kur.
        </p>
      ) : null}

      <div className="flex items-center gap-2 px-3.5 pt-2.5">
        <Chip
          icon={route.transit ? Bus : Footprints}
          label={formatDistance(route.totalDistanceM)}
        />
        <Chip icon={Timer} label={formatEta(route.etaMinutes)} />
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
            arrived
              ? "bg-ns-blue/15 text-ns-blue-soft"
              : "bg-ns-hover text-ns-muted",
          )}
        >
          {arrived ? "VARDIN" : `~${remainingMinutes} dk kaldı`}
        </span>
      </div>

      <div className="mt-2.5 px-3.5">
        <div className="h-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-ns-blue transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <ol className="mt-2 max-h-[36vh] space-y-0.5 overflow-y-auto px-2 pb-2">
        {route.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon];
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border px-2 py-2 transition-colors",
                isActive
                  ? "border-ns-blue/35 bg-ns-blue/8"
                  : "border-transparent",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg border text-[12px]",
                  isActive
                    ? "border-ns-blue bg-ns-blue text-white"
                    : isDone
                      ? "border-ns-border bg-ns-panel text-ns-blue-soft"
                      : "border-ns-border bg-ns-panel text-ns-dim",
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[12.5px] leading-snug",
                    isActive
                      ? "font-semibold text-slate-50"
                      : isDone
                        ? "text-ns-dim line-through decoration-ns-dim/50"
                        : "text-slate-300",
                  )}
                >
                  {step.instruction}
                </p>
                {step.distanceM > 0 ? (
                  <p className="mt-0.5 text-[10.5px] font-medium text-ns-dim">
                    {formatDistance(step.distanceM)}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex gap-1.5 border-t border-ns-border px-3.5 py-2.5">
        <button
          type="button"
          onClick={onToggleNavigation}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ns-blue px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
        >
          {isNavigating ? (
            <Pause size={14} strokeWidth={1.75} />
          ) : (
            <Play size={14} strokeWidth={1.75} />
          )}
          {isNavigating
            ? "Duraklat"
            : arrived
              ? "Tekrar Başlat"
              : "Navigasyonu Başlat"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          title="Başa al"
          className="grid size-9 place-items-center rounded-full border border-ns-border text-slate-300 transition-colors hover:bg-ns-hover hover:text-slate-50"
        >
          <RotateCcw size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-ns-border bg-ns-panel px-2 py-0.5 text-[11px] font-medium text-slate-200">
      <Icon size={11} strokeWidth={1.75} className="text-ns-blue" />
      {label}
    </span>
  );
}
