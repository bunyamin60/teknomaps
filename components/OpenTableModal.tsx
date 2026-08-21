"use client";

import { Clock, Lock, MapPin as MapPinIcon, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { distanceM, formatDistance } from "@/lib/geo";
import { venueLabel } from "@/lib/mockData";
import type { CurrentUser, NewTableDraft, WorkspacePin } from "@/lib/types";

interface OpenTableModalProps {
  /** Masa açılabilecek, şu an boş olan mekanlar. */
  venues: WorkspacePin[];
  currentUser: CurrentUser;
  initialVenueId?: string | null;
  onClose: () => void;
  onCreate: (draft: NewTableDraft) => void;
}

export default function OpenTableModal({
  venues,
  currentUser,
  initialVenueId,
  onClose,
  onCreate,
}: OpenTableModalProps) {
  const sorted = useMemo(
    () =>
      [...venues].sort(
        (a, b) =>
          distanceM(currentUser.position, a.position) -
          distanceM(currentUser.position, b.position),
      ),
    [venues, currentUser.position],
  );

  const [venueId, setVenueId] = useState(
    () => initialVenueId ?? sorted[0]?.id ?? "",
  );
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const selected = sorted.find((venue) => venue.id === venueId);
  const canSubmit = Boolean(venueId) && topic.trim().length > 2;

  const submit = () => {
    if (!canSubmit) return;
    onCreate({ venueId, topic: topic.trim(), note: note.trim() });
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-[700] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#0B0F16]/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-ns-border bg-ns-card animate-[var(--animate-fade-up)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
        <header className="flex items-start gap-3 border-b border-ns-border px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ns-blue/12 text-ns-blue">
            <Plus size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-slate-50">
              Çalışma Masası Aç
            </h2>
            <p className="mt-0.5 text-[12px] leading-snug text-ns-muted">
              Masan seçtiğin mekanın konumu üzerinden görünür, kişisel konumun
              paylaşılmaz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Kapat"
            className="grid size-8 shrink-0 place-items-center rounded-full text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        <div className="space-y-3.5 px-4 py-4">
          <Field label="Mekan" icon={MapPinIcon}>
            <select
              value={venueId}
              onChange={(event) => setVenueId(event.target.value)}
              className="w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors focus:border-ns-blue/60"
            >
              {sorted.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.district} ·{" "}
                  {formatDistance(distanceM(currentUser.position, venue.position))}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="mt-1.5 text-[11.5px] text-ns-dim">
                {venueLabel(selected)} · {selected.note}
              </p>
            ) : null}
          </Field>

          <Field label="Geliştirilen proje / konu">
            <input
              autoFocus
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Gömülü Sistem & Otonom Sürüş"
              className="w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-ns-dim focus:border-ns-blue/60"
            />
          </Field>

          <Field label="İhtiyaç / çağrı" optional>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Frontend ve UI konusunda sohbet edecek birini arıyoruz"
              className="w-full resize-none rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] leading-relaxed text-slate-100 outline-none transition-colors placeholder:text-ns-dim focus:border-ns-blue/60"
            />
          </Field>

          <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ns-dim">
            <Lock size={12} strokeWidth={1.75} className="mt-px shrink-0" />
            Masa 3 saat sonra haritadan otomatik kalkar. Dilediğin an kendin de
            kapatabilirsin.
          </p>
        </div>

        <footer className="border-t border-ns-border px-4 py-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={
              canSubmit
                ? "flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
                : "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ns-hover py-2.5 text-[13.5px] font-semibold text-ns-dim"
            }
          >
            <Clock size={16} strokeWidth={1.75} />
            Masayı Haritada Başlat (3 Saat)
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  icon: Icon,
  children,
}: {
  label: string;
  optional?: boolean;
  icon?: typeof MapPinIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
        {Icon ? <Icon size={12} strokeWidth={1.75} /> : null}
        {label}
        {optional ? (
          <span className="font-medium normal-case">(opsiyonel)</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
