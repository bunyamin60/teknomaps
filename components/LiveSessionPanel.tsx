"use client";

import { Check, Handshake, Radio, Timer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatElapsed } from "@/lib/nes";
import type { LiveSession } from "@/lib/types";

interface LiveSessionPanelProps {
  session: LiveSession;
  confirming: boolean;
  shifted: boolean;
  onRequestVerify: () => void;
  onCancelConfirm: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function LiveSessionPanel({
  session,
  confirming,
  shifted,
  onRequestVerify,
  onCancelConfirm,
  onConfirm,
  onDismiss,
}: LiveSessionPanelProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = formatElapsed(now - session.startedAt);
  const peerNames = session.peers.map((peer) => peer.name).join(", ");

  return (
    <>
      <div
        className={cn(
          "pointer-events-auto absolute bottom-[7.5rem] left-3 z-[618] w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-ns-border tm-glass transition-transform duration-300",
          shifted && "sm:translate-x-0",
        )}
      >
        <div className="flex items-start gap-2.5 px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ns-blue/12 text-ns-blue">
            <Timer size={16} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-50">
              Canlı Masa Oturumu • {session.venueName}
            </p>
            <p className="mt-0.5 truncate text-[11.5px] text-ns-muted">
              {session.topic}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            title="Oturumu gizle"
            className="grid size-8 shrink-0 place-items-center rounded-full text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <p className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-ns-border bg-[#0F141C] px-3 py-2.5 text-[12px] text-slate-200">
          <Radio
            size={13}
            strokeWidth={1.75}
            className="live-dot shrink-0 text-[#7DCEA0]"
          />
          BLE Yakınlık & Çapraz Sinyal Doğrulandı
        </p>

        <p className="px-4 font-mono text-[22px] font-semibold tracking-wide text-slate-50">
          {elapsed}
        </p>
        <p className="px-4 pb-3 text-[11.5px] text-ns-dim">
          Doğrulanmış mühendislik saati işleniyor
        </p>

        <div className="border-t border-ns-border px-4 py-3">
          <button
            type="button"
            onClick={onRequestVerify}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            <Handshake size={15} strokeWidth={1.75} />
            Oturumu Bitir ve Doğrula
          </button>
        </div>
      </div>

      {confirming ? (
        <div className="pointer-events-auto absolute inset-0 z-[720] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Kapat"
            onClick={onCancelConfirm}
            className="absolute inset-0 cursor-default bg-[#0B0F16]/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-ns-border bg-ns-card animate-[var(--animate-fade-up)]">
            <header className="flex items-start gap-3 border-b border-ns-border px-4 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ns-blue/12 text-ns-blue">
                <Handshake size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-semibold text-slate-50">
                  Oturum Kaydı
                </h2>
                <p className="mt-0.5 text-[12px] leading-snug text-ns-muted">
                  Süre, masa konusu ve çıktı bağlantısı karneye doğrulanmış
                  mühendislik saati olarak işlenir.
                </p>
              </div>
              <button
                type="button"
                onClick={onCancelConfirm}
                className="grid size-8 shrink-0 place-items-center rounded-full text-ns-dim transition-colors hover:bg-white/5 hover:text-slate-100"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </header>

            <div className="space-y-2.5 px-4 py-4">
              <p className="rounded-xl border border-ns-border bg-ns-panel px-3 py-3 text-[13px] leading-relaxed text-slate-200">
                {peerNames} ile{" "}
                <span className="font-semibold text-slate-50">
                  {session.topic}
                </span>{" "}
                üzerinde çalışıldı. Süre: {elapsed}.
              </p>
              <ul className="space-y-1.5">
                {session.peers.map((peer) => (
                  <li
                    key={peer.handle}
                    className="flex items-center gap-2 rounded-xl border border-ns-border bg-[#0F141C] px-3 py-2.5 text-[12.5px] text-slate-200"
                  >
                    <Check
                      size={14}
                      strokeWidth={2}
                      className="text-[#7DCEA0]"
                    />
                    {peer.name} masa kaydında
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-ns-border px-4 py-3">
              <button
                type="button"
                onClick={onConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ns-blue py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
              >
                <Check size={16} strokeWidth={2} />
                Kaydı İşle
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
