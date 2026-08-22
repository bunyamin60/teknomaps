"use client";

import { Flame, Hash, Newspaper, Radio, Search, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TopTabId } from "@/lib/types";

const TOP_TABS: Array<{ id: TopTabId; label: string; icon: LucideIcon }> = [
  { id: "trends", label: "Trendler", icon: Flame },
  { id: "tags", label: "Etiketler", icon: Hash },
  { id: "news", label: "Haberler", icon: Newspaper },
  { id: "teknomaps-live", label: "TeknoMaps Canlı", icon: Radio },
];

interface TopBarProps {
  activeTab: TopTabId;
  onChangeTab: (tab: TopTabId) => void;
  compact?: boolean;
  title?: string;
}

export default function TopBar({
  activeTab,
  onChangeTab,
  compact = false,
  title,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ns-border tm-glass">
      {!compact ? (
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
          <h1 className="text-[19px] font-bold tracking-tight text-white">
            {title ?? "Anasayfa"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-ns-border bg-ns-panel px-3 py-1.5 md:flex">
              <Search size={15} className="text-ns-muted" />
              <input
                placeholder="NSosyal'de ara"
                className="w-40 bg-transparent text-sm text-slate-200 outline-none placeholder:text-ns-muted"
              />
            </div>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full text-slate-300 transition-colors hover:bg-ns-hover"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-stretch overflow-x-auto tm-scroll-hidden">
        {TOP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLive = tab.id === "teknomaps-live";
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={cn(
                "group relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold transition-colors sm:text-sm",
                isActive ? "text-white" : "text-ns-muted hover:bg-ns-hover hover:text-slate-200",
              )}
            >
              <Icon
                size={14}
                strokeWidth={1.75}
                className={cn(isLive && "text-ns-blue", isLive && "live-dot")}
              />
              {tab.label}
              {isLive ? (
                <span className="ml-0.5 hidden rounded-full bg-ns-blue/12 px-2 py-0.5 text-[10px] font-bold text-ns-blue-soft sm:block">
                  CANLI
                </span>
              ) : null}
              {isActive ? (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-t-full bg-ns-blue" />
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}
