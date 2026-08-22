import type { ScoreBreakdown, ScorePillar, VerifiedMetrics } from "./types";

export type NesPillarKey = keyof ScoreBreakdown;

export const NES_MAX = {
  competition: 60,
  hardware: 25,
  code: 15,
} as const;

export const NES_PILLARS: Array<{
  key: NesPillarKey;
  glyph: string;
  title: string;
}> = [
  { key: "competition", glyph: "🏆", title: "Resmî Yarışma & Jüri Puanı" },
  { key: "hardware", glyph: "🛠️", title: "Açık Donanım & Garaj İmecesi" },
  { key: "code", glyph: "💻", title: "Doğrulanmış Kod & PR Çıktısı" },
];

export const DEFAULT_INSTITUTIONS = ["T3 Vakfı", "TEKNOFEST", "GitHub"];

type LoosePillar = Partial<ScorePillar> | null | undefined;

/** Eski mock / HMR state'inden gelen gevşek skor nesnesi. */
export type LooseBreakdown = Partial<ScoreBreakdown> & {
  output?: ScorePillar;
  competitionWeight?: number;
  codeActivity?: number;
  collaboration?: number;
} | null | undefined;

export type LooseMetrics = Partial<VerifiedMetrics> & {
  verifiedHours?: number;
  imeceAssists?: number;
  uniqueCollaborators?: number;
} | null | undefined;

export function emptyPillar(max: number): ScorePillar {
  return { score: 0, max, records: [] };
}

export function normalizePillar(
  pillar: LoosePillar,
  fallbackMax: number,
): ScorePillar {
  const max = fallbackMax || 0;
  return {
    score: pillar?.score || 0,
    max: max || pillar?.max || 0,
    records: Array.isArray(pillar?.records) ? pillar.records : [],
  };
}

function fromLegacy(score: number | undefined, max: number): ScorePillar | undefined {
  if (typeof score !== "number") return undefined;
  return { score, max, records: [] };
}

export function normalizeBreakdown(breakdown: LooseBreakdown): ScoreBreakdown {
  const competition =
    breakdown?.competition ??
    fromLegacy(breakdown?.competitionWeight, NES_MAX.competition);
  const code =
    breakdown?.code ??
    breakdown?.output ??
    fromLegacy(breakdown?.codeActivity, NES_MAX.code);
  const hardware =
    breakdown?.hardware ??
    fromLegacy(breakdown?.collaboration, NES_MAX.hardware);

  return {
    competition: normalizePillar(competition, NES_MAX.competition),
    code: normalizePillar(code, NES_MAX.code),
    hardware: normalizePillar(hardware, NES_MAX.hardware),
  };
}

export function normalizeMetrics(metrics: LooseMetrics): VerifiedMetrics {
  const institutions = metrics?.verifiedInstitutions?.filter(Boolean) ?? [];
  const sprints = metrics?.sprints ?? metrics?.verifiedHours ?? 0;
  const imeceCount = metrics?.imeceCount ?? metrics?.imeceAssists ?? 0;
  const orgCount =
    metrics?.orgCount ??
    (institutions.length > 0 ? institutions.length : 0);
  return {
    sprints,
    imeceCount,
    orgCount,
    verifiedInstitutions:
      institutions.length > 0
        ? institutions
        : DEFAULT_INSTITUTIONS.slice(0, Math.max(orgCount, 0)),
  };
}

export function totalNes(breakdown: LooseBreakdown): number {
  const safe = normalizeBreakdown(breakdown);
  return Math.min(
    100,
    (safe.competition.score || 0) +
      (safe.code.score || 0) +
      (safe.hardware.score || 0),
  );
}

export function pillarFill(pillar: LoosePillar): number {
  const max = pillar?.max || 0;
  if (max <= 0) return 0;
  return Math.min(100, Math.round(((pillar?.score || 0) / max) * 100));
}

/** Kronometre: milisaniyeyi 01:24:10 biçimine çevirir. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function hoursFromElapsed(ms: number): number {
  return Math.max(1, Math.round(ms / 3_600_000));
}

/** Masa oturumu sprint sayısını ve donanım imecesi ayağını güvenli büyütür. */
export function creditSession(
  breakdown: LooseBreakdown,
  metrics: LooseMetrics,
  elapsedMs: number,
): { breakdown: ScoreBreakdown; metrics: VerifiedMetrics; score: number } {
  const safeBreakdown = normalizeBreakdown(breakdown);
  const safeMetrics = normalizeMetrics(metrics);
  const hardware = safeBreakdown?.hardware ?? emptyPillar(NES_MAX.hardware);
  const hardwareMax = hardware?.max || NES_MAX.hardware || 0;
  const hardwareScore = (hardware?.score || 0) + 1;
  const sprintGain = hoursFromElapsed(elapsedMs);

  const nextBreakdown: ScoreBreakdown = {
    competition: safeBreakdown?.competition ?? emptyPillar(NES_MAX.competition),
    hardware: {
      score: hardwareMax > 0 ? Math.min(hardwareMax, hardwareScore) : hardwareScore,
      max: hardwareMax,
      records: [...(hardware?.records || []), "Doğrulanmış masa oturumu kaydı"].slice(
        -6,
      ),
    },
    code: safeBreakdown?.code ?? emptyPillar(NES_MAX.code),
  };

  const nextMetrics: VerifiedMetrics = {
    ...safeMetrics,
    sprints: (safeMetrics.sprints || 0) + sprintGain,
  };

  return {
    breakdown: nextBreakdown,
    metrics: nextMetrics,
    score: totalNes(nextBreakdown),
  };
}
