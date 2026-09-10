/**
 * Side-by-side compare desk for 2–3 holdings: marks, comps used, ratios,
 * ST/LT horizon, and concentration impact.
 */
import type { CardInventory } from '../../types';
import { preferredValuationForCard, compsUsedForPreferred } from '../pricing/compConsensus';
import { buildPricingTruthForCard } from '../pricing/pricingTruth';
import { analyzePortfolioConcentration } from './portfolioConcentration';
import { daysHeld, holdingTreatment, type HorizonTreatment } from './holdingHorizon';
import { gradeRatioForCard, type GradeRatioRow } from './ratioIntelligence';

export const CARD_COMPARE_DESK_DISCLOSURE =
  'Compare desk uses local preferred marks, listed sold comps, grade-ratio heuristics, holding horizon, and NAV share. Advisory only — not a live tape or tax advice.';

export const COMPARE_DESK_MIN = 2;
export const COMPARE_DESK_MAX = 3;

export interface CompareDeskColumn {
  cardId: string;
  player: string;
  year: number;
  set: string;
  mark: number;
  markLabel: string;
  compsUsed: number;
  thinTape: boolean;
  stale: boolean;
  lowLiquidity: boolean;
  compsDisclosure: string;
  gradeRatio: GradeRatioRow | null;
  daysHeld: number;
  treatment: HorizonTreatment;
  concentrationSharePct: number;
  roiPct: number | null;
}

export interface CardCompareDesk {
  columns: CompareDeskColumn[];
  incomplete: boolean;
  emptyReason: string | null;
  disclosure: string;
}

function usableMark(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

export function selectCompareCards(inventory: CardInventory[], ids: Array<string | null | undefined>): CardInventory[] {
  const seen = new Set<string>();
  const cards: CardInventory[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    const card = inventory.find((row) => row.id === id);
    if (!card) continue;
    seen.add(id);
    cards.push(card);
    if (cards.length >= COMPARE_DESK_MAX) break;
  }
  return cards;
}

export function buildCardCompareDesk(
  cards: CardInventory[],
  universe: CardInventory[] = cards,
  asOf: Date = new Date(),
): CardCompareDesk {
  const picked = cards.slice(0, COMPARE_DESK_MAX);
  if (picked.length < COMPARE_DESK_MIN) {
    return {
      columns: [],
      incomplete: true,
      emptyReason: 'Select two or three holdings to open the compare desk.',
      disclosure: CARD_COMPARE_DESK_DISCLOSURE,
    };
  }

  const concentration = analyzePortfolioConcentration(universe.length > 0 ? universe : picked);

  const columns = picked.map((card) => {
    const preferred = preferredValuationForCard(card);
    const truth = buildPricingTruthForCard(card);
    const comps = compsUsedForPreferred(preferred, card.salesData);
    const mark = usableMark(preferred.value || card.currentValue || card.purchasePrice);
    const cost = usableMark(card.purchasePrice);
    const playerKey = card.player.trim().toLowerCase();
    const share = concentration.players.find((row) => row.key === playerKey)?.sharePct ?? 0;
    const roiPct = cost > 0 && mark > 0 ? Math.round(((mark - cost) / cost) * 1000) / 10 : null;

    return {
      cardId: card.id,
      player: card.player,
      year: card.year,
      set: card.set,
      mark,
      markLabel: preferred.label,
      compsUsed: comps.rows.length,
      thinTape: preferred.thinMarket || comps.method === 'thin-comp-fallback' || comps.rows.length < 3,
      stale: truth.flags.stale,
      lowLiquidity: truth.flags.lowLiquidity,
      compsDisclosure: comps.disclosure,
      gradeRatio: gradeRatioForCard(card),
      daysHeld: daysHeld(card.purchaseDate, asOf, card.saleDate),
      treatment: holdingTreatment(card.purchaseDate, asOf, card.saleDate),
      concentrationSharePct: share,
      roiPct,
    };
  });

  return {
    columns,
    incomplete: false,
    emptyReason: null,
    disclosure: CARD_COMPARE_DESK_DISCLOSURE,
  };
}
