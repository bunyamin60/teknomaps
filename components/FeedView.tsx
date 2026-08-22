"use client";

import {
  BadgeCheck,
  Bell,
  Bookmark,
  Calendar,
  Compass,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  Pin,
  Repeat2,
  Rocket,
  Share2,
  Smile,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { FEED_POSTS, HASHTAGS, NEWS } from "@/lib/feedData";
import { CURRENT_USER, PEOPLE, WORKSPACES } from "@/lib/mockData";
import type { NavTabId, TopTabId } from "@/lib/types";

interface FeedViewProps {
  navTab: NavTabId;
  topTab: TopTabId;
  onOpenMaps: () => void;
}

export default function FeedView({ navTab, topTab, onOpenMaps }: FeedViewProps) {
  return (
    <div className="mx-auto w-full max-w-[640px] pb-24">
      <TeknoMapsPromo onOpenMaps={onOpenMaps} />

      {navTab === "feed" ? <Composer /> : <SectionHeader navTab={navTab} />}

      {topTab === "tags" ? <HashtagPanel /> : null}
      {topTab === "news" ? <NewsPanel /> : null}

      <div className="divide-y divide-ns-border">
        {FEED_POSTS.map((post) => (
          <article
            key={post.id}
            className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
          >
            <span
              className="grid size-10 shrink-0 place-items-center self-start rounded-full text-xs font-bold text-white"
              style={{
                background: post.accent,
              }}
            >
              {post.initials}
            </span>

            <div className="min-w-0 flex-1">
              {post.pinned ? (
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ns-muted">
                  <Pin size={11} /> Sabitlenmiş gönderi
                </p>
              ) : null}

              <div className="flex items-center gap-1.5 text-[15px]">
                <span className="truncate font-bold text-white">{post.author}</span>
                {post.verified ? (
                  <BadgeCheck size={15} className="shrink-0 text-ns-blue" />
                ) : null}
                <span className="truncate text-ns-muted">{post.handle}</span>
                <span className="text-ns-muted">·</span>
                <span className="shrink-0 text-ns-muted">{post.time}</span>
              </div>

              <p className="mt-1 text-[15px] leading-relaxed text-slate-200">
                {post.body}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-ns-border bg-ns-panel px-2 py-0.5 text-[11px] font-medium text-ns-blue"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between pr-6 text-ns-muted">
                <PostAction icon={MessageSquare} value={post.stats.replies} hover="hover:text-ns-blue" />
                <PostAction icon={Repeat2} value={post.stats.reposts} hover="hover:text-ns-blue-soft" />
                <PostAction icon={Heart} value={post.stats.likes} hover="hover:text-rose-400" />
                <PostAction icon={Bookmark} hover="hover:text-ns-blue" />
                <PostAction icon={Share2} hover="hover:text-ns-blue" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PostAction({
  icon: Icon,
  value,
  hover,
}: {
  icon: typeof Heart;
  value?: number;
  hover: string;
}) {
  return (
    <button
      type="button"
      className={cn("flex items-center gap-1.5 text-[13px] transition-colors", hover)}
    >
      <span className="grid size-7 place-items-center rounded-full transition-colors hover:bg-white/5">
        <Icon size={16} />
      </span>
      {value !== undefined ? value.toLocaleString("tr-TR") : null}
    </button>
  );
}

function TeknoMapsPromo({ onOpenMaps }: { onOpenMaps: () => void }) {
  const liveTables = WORKSPACES.filter((workspace) => workspace.table).length;
  const onlinePeople = PEOPLE.filter((person) => person.online).length;

  return (
    <section className="m-4 overflow-hidden rounded-2xl border border-ns-border bg-ns-card p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ns-blue text-white">
          <Rocket size={22} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-slate-50">
            TeknoMaps ile alandaki ekibini bul
            <span className="rounded-full bg-ns-blue/12 px-2 py-0.5 text-[10px] font-bold text-ns-blue-soft">
              CANLI
            </span>
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ns-muted">
            {liveTables} canlı çalışma masası, {onlinePeople} geliştirici çevrimiçi.
            Uzmanlık alanın{" "}
            <span className="font-semibold text-slate-200">
              {CURRENT_USER.skills.slice(0, 2).join(", ")}
            </span>{" "}
            ile eşleşen kafeler, kütüphaneler ve atölyelere rota çizelim.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenMaps}
              className="flex items-center gap-1.5 rounded-full bg-ns-blue px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1a8cd8]"
            >
              <MapPin size={15} strokeWidth={1.75} />
              Haritayı Aç
            </button>
            <button
              type="button"
              onClick={onOpenMaps}
              className="flex items-center gap-1.5 rounded-full border border-ns-border px-5 py-2.5 text-[13px] font-semibold text-slate-200 transition-colors hover:bg-ns-hover"
            >
              <TrendingUp size={15} strokeWidth={1.75} />
              Eşleşmelerimi gör
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Composer() {
  return (
    <div className="flex gap-3 border-b border-ns-border px-4 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ns-blue text-xs font-bold text-white">
        {CURRENT_USER.initials}
      </span>
      <div className="min-w-0 flex-1">
        <input
          placeholder="Alanda neler oluyor?"
          className="w-full bg-transparent py-2 text-[17px] text-slate-100 outline-none placeholder:text-ns-muted"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-ns-blue">
            {[ImageIcon, Smile, Calendar, MapPin].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="grid size-8 place-items-center rounded-full transition-colors hover:bg-ns-blue/10"
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full bg-ns-blue/40 px-5 py-2 text-sm font-bold text-white/70"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

const SECTION_META: Record<
  Exclude<NavTabId, "feed" | "teknomaps">,
  { title: string; description: string; icon: typeof Compass }
> = {
  explore: {
    title: "Keşfet",
    description:
      "TEKNOFEST alanındaki en çok konuşulan takımlar, etiketler ve canlı yayınlar.",
    icon: Compass,
  },
  notifications: {
    title: "Bildirimler",
    description: "12 yeni etkileşim · 3 bağlantı isteği · 2 rota daveti.",
    icon: Bell,
  },
  messages: {
    title: "Mesajlar",
    description:
      "Albatros İHA Takımı, Mert Kaan Alp ve Burak Şen ile sohbetleriniz devam ediyor.",
    icon: Mail,
  },
  profile: {
    title: CURRENT_USER.name,
    description: `${CURRENT_USER.title} · NES ${CURRENT_USER.engineeringScore}/100 · ${CURRENT_USER.skills.join(" · ")}`,
    icon: User,
  },
};

function SectionHeader({ navTab }: { navTab: NavTabId }) {
  const meta = SECTION_META[navTab as keyof typeof SECTION_META];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 border-b border-ns-border px-4 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-ns-border bg-ns-panel text-ns-blue">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="text-[17px] font-bold text-white">{meta.title}</h2>
        <p className="mt-0.5 text-[13px] text-ns-muted">{meta.description}</p>
      </div>
    </div>
  );
}

function HashtagPanel() {
  return (
    <div className="border-b border-ns-border px-4 py-3">
      <h3 className="mb-2 text-[13px] font-bold tracking-wide text-ns-muted uppercase">
        Alandaki yükselen etiketler
      </h3>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {HASHTAGS.map((item) => (
          <button
            key={item.tag}
            type="button"
            className="flex items-center justify-between rounded-xl border border-ns-border bg-ns-panel px-3 py-2 text-left transition-colors hover:bg-ns-hover"
          >
            <span>
              <span className="block text-[14px] font-semibold text-ns-blue">
                {item.tag}
              </span>
              <span className="text-[11px] text-ns-muted">{item.posts}</span>
            </span>
            <span className="text-[11px] font-bold text-ns-blue-soft">
              {item.growth}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NewsPanel() {
  return (
    <div className="border-b border-ns-border px-4 py-3">
      <h3 className="mb-2 text-[13px] font-bold tracking-wide text-ns-muted uppercase">
        Festival haberleri
      </h3>
      <div className="space-y-1.5">
        {NEWS.map((item) => (
          <button
            key={item.title}
            type="button"
            className="block w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2 text-left transition-colors hover:bg-ns-hover"
          >
            <span className="block text-[14px] font-semibold text-slate-100">
              {item.title}
            </span>
            <span className="text-[11px] text-ns-muted">{item.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
