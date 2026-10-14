/**
 * Raw-to-slab submit decision from disclosed demo fees, turnaround, and population.
 * Not a PSA or BGS quote. Live PSA stays owner-held.
 */
import type { CardInventory } from '../../types';

export const GRADING_SUBMIT_DISCLOSURE =
  'Demo fees, turnaround, and population. Not a PSA or BGS quote. Live PSA stays owner-held.';

export const SUBMIT_NET_BAR_USD = 15;

export interface GradeLane {
  id: 'psa-economy' | 'psa-regular' | 'bgs-standard';
  company: 'PSA' | 'BGS';
  label: string;
  feeUsd: number;
  days: number;
  grade: string;
  multiplier: number;
  pop: number;
}

export const GRADE_LANES: readonly GradeLane[] = [
  { id: 'psa-economy', company: 'PSA', label: 'Economy', feeUsd: 25, days: 45, grade: '10', multiplier: 3.2, pop: 1200 },
  { id: 'psa-regular', company: 'PSA', label: 'Regular', feeUsd: 75, days: 15, grade: '10', multiplier: 3.2, pop: 1200 },
  { id: 'bgs-standard', company: 'BGS', label: 'Standard', feeUsd: 40, days: 25, grade: '9.5', multiplier: 2.6, pop: 640 },
];

export interface LaneQuote {
  id: GradeLane['id'];
  label: string;
  company: GradeLane['company'];
  feeUsd: number;
  days: number;
  grade: string;
  pop: number;
  gradedUsd: number;
  netUsd: number;
  roiPct: number;
}

export interface GradeDecision {
  rawUsd: number;
  quotes: LaneQuote[];
  submit: boolean;
  laneId: GradeLane['id'] | null;
  summary: string;
}

export interface GradeRow extends GradeDecision {
  cardId: string;
  player: string;
}

function quoteLane(rawUsd: number, lane: GradeLane): LaneQuote {
  const gradedUsd = Math.round(rawUsd * lane.multiplier);
  const netUsd = gradedUsd - rawUsd - lane.feeUsd;
  const cost = rawUsd + lane.feeUsd;
  return {
    id: lane.id,
    label: `${lane.company} ${lane.label}`,
    company: lane.company,
    feeUsd: lane.feeUsd,
    days: lane.days,
    grade: lane.grade,
    pop: lane.pop,
    gradedUsd,
    netUsd,
    roiPct: cost > 0 ? Math.round((netUsd / cost) * 100) : 0,
  };
}

export function decideGradingSubmit(rawUsd: number): GradeDecision | null {
  if (!(rawUsd > 0) || rawUsd > 1_000_000) return null;
  const quotes = GRADE_LANES.map((lane) => quoteLane(rawUsd, lane)).sort((a, b) => {
    if (b.netUsd !== a.netUsd) return b.netUsd - a.netUsd;
    return a.days - b.days;
  });
  const best = quotes[0];
  const submit = best.netUsd >= SUBMIT_NET_BAR_USD;
  const summary = submit
    ? `Submit ${best.label}. Demo net $${best.netUsd} in ${best.days} days. Demo pop ${best.pop} at ${best.company} ${best.grade}.`
    : `Hold raw. Best demo net is $${best.netUsd}, under the $${SUBMIT_NET_BAR_USD} bar.`;
  return { rawUsd, quotes, submit, laneId: submit ? best.id : null, summary };
}

export function listGradeSubmits(cards: CardInventory[], limit = 3): GradeRow[] {
  return cards
    .filter((card) => card.status !== 'sold' && !card.isGraded)
    .map((card) => ({ card, rawUsd: card.currentValue ?? card.purchasePrice ?? 0 }))
    .filter((row) => row.rawUsd > 0)
    .sort((a, b) => b.rawUsd - a.rawUsd)
    .slice(0, limit)
    .flatMap((row) => {
      const decision = decideGradingSubmit(row.rawUsd);
      return decision ? [{ ...decision, cardId: row.card.id, player: row.card.player }] : [];
    });
}
