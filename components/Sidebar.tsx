"use client";

import {
  Bell,
  Compass,
  Feather,
  Home,
  LogIn,
  Mail,
  MoreHorizontal,
  Rocket,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { CURRENT_USER } from "@/lib/mockData";
import type { NavTabId } from "@/lib/types";

interface NavItem {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "feed", label: "Akış", icon: Home },
  { id: "explore", label: "Keşfet", icon: Compass },
  { id: "teknomaps", label: "TeknoMaps", icon: Rocket, highlight: true },
  { id: "notifications", label: "Bildirimler", icon: Bell, badge: 12 },
  { id: "messages", label: "Mesajlar", icon: Mail, badge: 3 },
  { id: "profile", label: "Profil", icon: User },
];

interface SidebarProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <aside className="flex h-full w-[76px] shrink-0 flex-col border-r border-ns-border bg-ns-shell px-2 py-4 xl:w-[272px] xl:px-4">
      <div className="mb-3 flex items-center gap-2.5 px-1.5 py-2 xl:px-2">
        <span className="grid size-10 place-items-center rounded-xl bg-ns-blue text-lg font-black text-white">
          N
        </span>
        <span className="hidden flex-col leading-none xl:flex">
          <span className="text-[17px] font-bold tracking-tight text-slate-50">
            NSosyal
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ns-blue-soft">
            Beta
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto tm-scroll-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-full px-3 py-3 text-left transition-colors",
                "hover:bg-ns-hover",
                isActive ? "text-white" : "text-slate-300",
                item.highlight && "mt-1",
              )}
            >
              <span className="relative grid size-7 shrink-0 place-items-center">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={cn(
                    "transition-colors",
                    item.highlight && "text-ns-blue",
                  )}
                />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1.5 grid min-w-[17px] place-items-center rounded-full bg-ns-blue px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>

              <span
                className={cn(
                  "hidden min-w-0 flex-1 items-center gap-2 text-[17px] xl:flex",
                  isActive ? "font-bold" : "font-normal",
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.highlight ? (
                  <span className="flex items-center gap-1 rounded-full bg-ns-blue/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ns-blue-soft">
                    <Sparkles size={9} strokeWidth={1.75} />
                    Yeni
                  </span>
                ) : null}
              </span>

              {isActive ? (
                <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-ns-blue xl:hidden" />
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          className="mt-1 flex items-center gap-3.5 rounded-full px-3 py-2.5 text-slate-300 transition-colors hover:bg-ns-hover"
        >
          <span className="grid size-7 place-items-center">
            <MoreHorizontal size={24} strokeWidth={1.9} />
          </span>
          <span className="hidden text-[17px] xl:block">Daha fazla</span>
        </button>

        <button
          type="button"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ns-blue py-3.5 font-bold text-white transition-colors hover:bg-[#1a8cd8] xl:px-4"
        >
          <Feather size={20} className="xl:hidden" />
          <span className="hidden xl:block">Gönderi Oluştur</span>
        </button>
      </nav>

      <div className="mt-3 space-y-2 border-t border-ns-border pt-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-ns-border py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-ns-hover"
        >
          <LogIn size={17} strokeWidth={1.75} />
          <span className="hidden xl:block">Giriş yap</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 py-3 text-sm font-bold text-[#0F141C] transition-colors hover:bg-white"
        >
          <UserPlus size={17} strokeWidth={1.75} />
          <span className="hidden xl:block">Kayıt ol</span>
        </button>

        <div className="mt-2 flex items-center gap-2.5 rounded-full p-2 transition-colors hover:bg-ns-hover xl:p-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ns-blue text-xs font-bold text-white">
            {CURRENT_USER.initials}
          </span>
          <span className="hidden min-w-0 flex-1 flex-col leading-tight xl:flex">
            <span className="truncate text-[13px] font-semibold text-white">
              {CURRENT_USER.name}
            </span>
            <span className="truncate text-[12px] text-ns-muted">
              {CURRENT_USER.handle}
            </span>
          </span>
          <MoreHorizontal size={16} className="hidden text-ns-muted xl:block" />
        </div>
      </div>
    </aside>
  );
}
