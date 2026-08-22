"use client";

import { Handshake, Lock, MapPin as MapPinIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { distanceM, formatDistance } from "@/lib/geo";
import {
  EQUIPMENT_CATEGORY_LABELS,
  canHostEquipment,
  venueLabel,
} from "@/lib/mockData";
import type {
  CurrentUser,
  EquipmentCategory,
  NewEquipmentDraft,
  WorkspacePin,
} from "@/lib/types";

const CATEGORIES: EquipmentCategory[] = [
  "3D_PRINT",
  "TEST_MEASURE",
  "SOLDERING",
  "ENERGY",
];

interface OpenEquipmentModalProps {
  venues: WorkspacePin[];
  currentUser: CurrentUser;
  onClose: () => void;
  onCreate: (draft: NewEquipmentDraft) => void;
}

export default function OpenEquipmentModal({
  venues,
  currentUser,
  onClose,
  onCreate,
}: OpenEquipmentModalProps) {
  const sorted = useMemo(
    () =>
      [...venues]
        .filter(canHostEquipment)
        .sort(
          (a, b) =>
            distanceM(currentUser.position, a.position) -
            distanceM(currentUser.position, b.position),
        ),
    [venues, currentUser.position],
  );

  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("3D_PRINT");
  const [venueId, setVenueId] = useState(() => sorted[0]?.id ?? "");
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const selected = sorted.find((venue) => venue.id === venueId);
  const canSubmit = Boolean(venueId) && name.trim().length > 2;

  const submit = () => {
    if (!canSubmit) return;
    onCreate({
      name: name.trim(),
      category,
      venueId,
      note: note.trim(),
    });
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
            <Handshake size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-slate-50">
              İmeceye Cihaz Ekle
            </h2>
            <p className="mt-0.5 text-[12px] leading-snug text-ns-muted">
              Cihazın kamusal bir atölye veya stand üzerinden görünür. Para,
              kiralama veya ücret yok; yalnızca dayanışma.
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
          <Field label="Cihaz adı">
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Creality K1 Max 3D Yazıcı"
              className="w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-ns-dim focus:border-ns-blue/60"
            />
          </Field>

          <Field label="Kategori">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as EquipmentCategory)
              }
              className="w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors focus:border-ns-blue/60"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {EQUIPMENT_CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cihazın bulunduğu mekan / stand" icon={MapPinIcon}>
            <select
              value={venueId}
              onChange={(event) => setVenueId(event.target.value)}
              className="w-full rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors focus:border-ns-blue/60"
            >
              {sorted.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.district} ·{" "}
                  {formatDistance(
                    distanceM(currentUser.position, venue.position),
                  )}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="mt-1.5 text-[11.5px] text-ns-dim">
                {venueLabel(selected)} · {selected.note}
              </p>
            ) : null}
          </Field>

          <Field label="Paylaşım notu">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Hafta içi 14:00-18:00 arası müsait"
              className="w-full resize-none rounded-xl border border-ns-border bg-ns-panel px-3 py-2.5 text-[13px] leading-relaxed text-slate-100 outline-none transition-colors placeholder:text-ns-dim focus:border-ns-blue/60"
            />
          </Field>

          <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ns-dim">
            <Lock size={12} strokeWidth={1.75} className="mt-px shrink-0" />
            İmece paylaşımı açık olduğu sürece haritada 🤝 rozeti görünür.
            Karşılığında ekosistem teşekkürü ve dayanışma puanı birikir.
          </p>
        </div>

        <footer className="border-t border-ns-border px-4 py-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={
              canSubmit
                ? "flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
                : "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ns-hover py-3 text-[13.5px] font-semibold text-ns-dim"
            }
          >
            <Handshake size={16} strokeWidth={1.75} />
            Dayanışmaya Aç (Ücretsiz)
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof MapPinIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ns-dim uppercase">
        {Icon ? <Icon size={12} strokeWidth={1.75} /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
