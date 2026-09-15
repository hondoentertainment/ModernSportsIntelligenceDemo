/**
 * Freshness SLA policy — aging bands for valuation stamps and sold-comp tape.
 *
 * Demo-safe classifiers only. Does not claim live eBay / Market Movers tape
 * SLA until #77 keys are on. Thresholds stay aligned with pricingTruth /
 * valuationFreshness (7d stamp, 90d tape).
 */
import type { CardInventory } from '../../types';
import {
  FRESH_COMP_WINDOW_MS,
  preferredValuationForCard,
  type PreferredValuation,
} from './compConsensus';
import {
  VALUATION_STALE_AFTER_DAYS,
  valuationAgeDays,
} from '../utils/valuationFreshness';

export const FRESHNESS_SLA_DISCLOSURE =
  'Freshness SLA scaffold: stamp aging (fresh ≤2d, aging 3–6d, stale ≥7d) and sold-comp tape (fresh ≤30d, aging 31–89d, stale ≥90d). Live-tape SLA still needs #77 eBay keys — this is policy math on local / demo marks.';

export type FreshnessSlaBand = 'fresh' | 'aging' | 'stale' | 'unknown';
export type FreshnessSlaChannel = 'stamp' | 'tape' | 'combined';

export const FRESHNESS_SLA_POLICY = {
  stampFreshMaxDays: 2,
  stampAgingMaxDays: 6,
  stampStaleAfterDays: VALUATION_STALE_AFTER_DAYS,
  tapeFreshMaxDays: 30,
  tapeAgingMaxDays: 89,
  tapeStaleAfterDays: FRESH_COMP_WINDOW_MS / (24 * 60 * 60 * 1000),
} as const;

export interface FreshnessSlaVerdict {
  band: FreshnessSlaBand;
  channel: FreshnessSlaChannel;
  stampBand: FreshnessSlaBand;
  tapeBand: FreshnessSlaBand;
  stampDays: number | null;
  tapeDays: number | null;
  label: string;
  meetsSla: boolean;
}

export interface FreshnessSlaSummary {
  total: number;
  fresh: number;
  aging: number;
  stale: number;
  unknown: number;
  slaPct: number;
  worstBand: FreshnessSlaBand;
  disclosure: string;
}

const BAND_RANK: Record<FreshnessSlaBand, number> = {
  unknown: 0,
  fresh: 1,
  aging: 2,
  stale: 3,
};

function parseStampDays(iso: string | undefined, nowMs: number): number | null {
  if (!iso) return null;
  return valuationAgeDays(iso, nowMs);
}

function tapeAgeDaysFromStamp(soldAt: string, nowMs: number): number | null {
  const trimmed = soldAt.trim();
  if (!trimmed) return null;
  const withTime = trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00`;
  const ts = Date.parse(withTime);
  if (Number.isNaN(ts)) return null;
  const days = (nowMs - ts) / (24 * 60 * 60 * 1000);
  if (days < 0 && days >= -0.5) return 0;
  return days;
}

function parseTapeDays(preferred: PreferredValuation, nowMs: number): number | null {
  if (preferred.method !== 'sold-comp-consensus' && preferred.method !== 'thin-comp-fallback') {
    return null;
  }
  if (preferred.newestSoldAt) {
    return tapeAgeDaysFromStamp(preferred.newestSoldAt, nowMs);
  }
  if (preferred.compCount > 0 && preferred.stale) {
    return FRESHNESS_SLA_POLICY.tapeStaleAfterDays;
  }
  return null;
}

export function classifyAgeBand(
  days: number | null,
  policy: { freshMax: number; agingMax: number },
): FreshnessSlaBand {
  if (days == null || !Number.isFinite(days) || days < 0) return 'unknown';
  if (days <= policy.freshMax) return 'fresh';
  if (days <= policy.agingMax) return 'aging';
  return 'stale';
}

export function classifyStampSla(days: number | null): FreshnessSlaBand {
  return classifyAgeBand(days, {
    freshMax: FRESHNESS_SLA_POLICY.stampFreshMaxDays,
    agingMax: FRESHNESS_SLA_POLICY.stampAgingMaxDays,
  });
}

export function classifyTapeSla(days: number | null): FreshnessSlaBand {
  return classifyAgeBand(days, {
    freshMax: FRESHNESS_SLA_POLICY.tapeFreshMaxDays,
    agingMax: FRESHNESS_SLA_POLICY.tapeAgingMaxDays,
  });
}

export function worseSlaBand(a: FreshnessSlaBand, b: FreshnessSlaBand): FreshnessSlaBand {
  return BAND_RANK[a] >= BAND_RANK[b] ? a : b;
}

export function slaBandLabel(band: FreshnessSlaBand): string {
  switch (band) {
    case 'fresh':
      return 'SLA fresh';
    case 'aging':
      return 'SLA aging';
    case 'stale':
      return 'SLA stale';
    default:
      return 'SLA unknown';
  }
}

export function resolveFreshnessSla(input: {
  preferred: PreferredValuation;
  timestamp?: string;
  lastValuationDate?: string;
  nowMs?: number;
}): FreshnessSlaVerdict {
  const nowMs = input.nowMs ?? Date.now();
  const stampDays = parseStampDays(input.timestamp || input.lastValuationDate, nowMs);
  const tapeDays = parseTapeDays(input.preferred, nowMs);
  const stampBand = classifyStampSla(stampDays);
  const tapeBand = classifyTapeSla(tapeDays);
  const known = [stampBand, tapeBand].filter((band) => band !== 'unknown') as FreshnessSlaBand[];
  const band = known.length === 0 ? 'unknown' : known.reduce((worst, next) => worseSlaBand(worst, next));
  let channel: FreshnessSlaChannel = 'combined';
  if (stampBand === 'unknown' && tapeBand !== 'unknown') channel = 'tape';
  else if (tapeBand === 'unknown' && stampBand !== 'unknown') channel = 'stamp';
  else if (stampBand === 'unknown' && tapeBand === 'unknown') channel = 'combined';

  return {
    band,
    channel,
    stampBand,
    tapeBand,
    stampDays,
    tapeDays,
    label: slaBandLabel(band),
    meetsSla: band === 'fresh',
  };
}

export function freshnessSlaForCard(
  card: Pick<
    CardInventory,
    | 'currentValue'
    | 'valuationSource'
    | 'valuationTimestamp'
    | 'lastValuationDate'
    | 'salesData'
  >,
  nowMs: number = Date.now(),
): FreshnessSlaVerdict {
  return resolveFreshnessSla({
    preferred: preferredValuationForCard(card, nowMs),
    timestamp: card.valuationTimestamp,
    lastValuationDate: card.lastValuationDate,
    nowMs,
  });
}

export function freshnessSlaFromPreferred(
  preferred: PreferredValuation,
  extras: { timestamp?: string | null; lastValuationDate?: string; nowMs?: number } = {},
): FreshnessSlaVerdict {
  return resolveFreshnessSla({
    preferred,
    timestamp: extras.timestamp ?? undefined,
    lastValuationDate: extras.lastValuationDate,
    nowMs: extras.nowMs,
  });
}

export function summarizeInventorySla(
  cards: Array<
    Pick<
      CardInventory,
      | 'status'
      | 'currentValue'
      | 'valuationSource'
      | 'valuationTimestamp'
      | 'lastValuationDate'
      | 'salesData'
    >
  >,
  nowMs: number = Date.now(),
): FreshnessSlaSummary {
  const active = cards.filter((card) => card.status !== 'sold');
  const counts = { fresh: 0, aging: 0, stale: 0, unknown: 0 };
  let worst: FreshnessSlaBand = 'unknown';
  for (const card of active) {
    const verdict = freshnessSlaForCard(card, nowMs);
    counts[verdict.band] += 1;
    worst = worseSlaBand(worst, verdict.band);
  }
  const total = active.length;
  const slaPct = total === 0 ? 0 : Math.round((counts.fresh / total) * 100);
  return {
    total,
    ...counts,
    slaPct,
    worstBand: total === 0 ? 'unknown' : worst,
    disclosure: FRESHNESS_SLA_DISCLOSURE,
  };
}

