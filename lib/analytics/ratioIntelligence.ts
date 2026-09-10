/**
 * Grade / player / variation price-ratio intelligence.
 * Uses local marks + sold-comp titles when present. Missing grades and thin
 * tape stay labeled — heuristic only, not live PSA or Market Movers parity.
 */
import type { CardInventory, MarketComp } from '../../types';
import { extractGradeCompMedian, PSA9_MULTIPLIER, PSA10_MULTIPLIER } from './gradingRoiLite';
import { preferredValueForCard, isThinCompSet } from '../pricing/compConsensus';

export const RATIO_INTELLIGENCE_DISCLOSURE =
  'Grade / player / variation price ratios from local marks plus sold-comp titles when present. Missing grades and thin tape stay labeled — heuristic only, not live PSA or Sports Card Investor / Market Movers parity.';

export const THIN_RATIO_COMPS = 2;

export type RatioSource = 'comps' | 'heuristic' | 'mixed';
export type VariationKind = 'base' | 'parallel' | 'auto' | 'numbered';
export type MissingGrade = 'raw' | 'psa9' | 'psa10';

export interface GradeRatioRow {
  cardId: string;
  player: string;
  year: number;
  set: string;
  rawMark: number | null;
  psa9: number | null;
  psa10: number | null;
  psa10Over9: number | null;
  psa9OverRaw: number | null;
  psa10OverRaw: number | null;
  source: RatioSource;
  thinTape: boolean;
  missingGrades: MissingGrade[];
  rationale: string;
}

export interface PlayerRatioCard {
  cardId: string;
  label: string;
  mark: number;
}

export interface PlayerRatioRow {
  player: string;
  cards: PlayerRatioCard[];
  highOverLow: number | null;
  medianMark: number;
  thinTape: boolean;
  rationale: string;
}

export interface VariationRatioRow {
  familyKey: string;
  player: string;
  year: number;
  set: string;
  baseMark: number | null;
  variationKind: VariationKind;
  variationMark: number;
  variationCardId: string;
  variationLabel: string;
  ratioVsBase: number | null;
  thinTape: boolean;
  rationale: string;
}

export interface RatioIntelligenceReport {
  grades: GradeRatioRow[];
  players: PlayerRatioRow[];
  variations: VariationRatioRow[];
  thinCount: number;
  heuristicCount: number;
  disclosure: string;
}

function usableMark(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function ratio(numerator: number | null, denominator: number | null): number | null {
  if (numerator == null || denominator == null || denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100) / 100;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function activeCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((card) => card.status !== 'sold');
}

function rawFromComps(sales: MarketComp[] | undefined): number | null {
  if (!sales || sales.length === 0) return null;
  const prices = sales
    .filter((row) => {
      const title = row.title ?? '';
      return /raw|ungraded|nm-mt|near mint/i.test(title) && !/psa\s*(9|10)\b/i.test(title);
    })
    .map((row) => {
      const total = typeof row.totalPrice === 'number' ? row.totalPrice : NaN;
      if (Number.isFinite(total) && total > 0) return total;
      return Number.isFinite(row.price) && row.price > 0 ? row.price : 0;
    })
    .filter((price) => price > 0);
  if (prices.length === 0) return null;
  return median(prices);
}

export function parseGradeNumber(grade?: string): number | null {
  if (!grade) return null;
  const match = String(grade).match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function variationKind(card: Pick<CardInventory, 'set' | 'manufacturer' | 'cardNumber' | 'notes' | 'condition' | 'isAutographed'>): VariationKind {
  const hay = `${card.set} ${card.manufacturer} ${card.cardNumber} ${card.notes ?? ''} ${card.condition}`;
  if (card.isAutographed || /auto|autograph/i.test(hay)) return 'auto';
  if (/#\/\d+|numbered|\/\d{1,4}\b/i.test(hay)) return 'numbered';
  if (/refractor|prizm|parallel|silver|gold|wave|shimmer|rainbow|speckle/i.test(hay)) return 'parallel';
  return 'base';
}

export function gradeRatioForCard(card: CardInventory): GradeRatioRow | null {
  if (card.status === 'sold') return null;

  const preferred = usableMark(preferredValueForCard(card) || card.currentValue || card.purchasePrice);
  const psa9Comp = extractGradeCompMedian(card.salesData, 9);
  const psa10Comp = extractGradeCompMedian(card.salesData, 10);
  const rawComp = rawFromComps(card.salesData);
  const gradeNum = parseGradeNumber(card.grade);
  const thinTape = isThinCompSet(card.salesData);

  let rawMark = rawComp;
  let psa9 = psa9Comp;
  let psa10 = psa10Comp;
  let usedHeuristic = false;
  let usedComps = psa9Comp != null || psa10Comp != null || rawComp != null;

  if (card.isGraded && gradeNum != null && preferred != null) {
    if (gradeNum >= 10 && psa10 == null) psa10 = preferred;
    else if (gradeNum >= 9 && gradeNum < 10 && psa9 == null) psa9 = preferred;
  }

  if (!card.isGraded && rawMark == null && preferred != null) {
    rawMark = preferred;
  }

  if (psa9 == null && rawMark != null) {
    psa9 = Math.round(rawMark * PSA9_MULTIPLIER * 100) / 100;
    usedHeuristic = true;
  }
  if (psa10 == null && rawMark != null) {
    psa10 = Math.round(rawMark * PSA10_MULTIPLIER * 100) / 100;
    usedHeuristic = true;
  }
  if (rawMark == null && psa9 != null && !usedHeuristic) {
    rawMark = Math.round((psa9 / PSA9_MULTIPLIER) * 100) / 100;
    usedHeuristic = true;
  }

  const missingGrades: MissingGrade[] = [];
  if (rawMark == null) missingGrades.push('raw');
  if (psa9 == null) missingGrades.push('psa9');
  if (psa10 == null) missingGrades.push('psa10');

  if (preferred == null && psa9 == null && psa10 == null && rawMark == null) return null;

  const source: RatioSource = usedHeuristic && usedComps ? 'mixed' : usedHeuristic ? 'heuristic' : usedComps ? 'comps' : 'heuristic';
  const psa10Over9 = ratio(psa10, psa9);
  const psa9OverRaw = ratio(psa9, rawMark);
  const psa10OverRaw = ratio(psa10, rawMark);

  const rationale = missingGrades.length
    ? `Missing ${missingGrades.join(', ')} marks — ratio incomplete. ${thinTape ? 'Thin sold-comp tape. ' : ''}${usedHeuristic ? `Heuristic ${PSA9_MULTIPLIER}x / ${PSA10_MULTIPLIER}x used where comps are absent.` : 'No heuristic fill applied.'}`
    : usedHeuristic
      ? `Heuristic ${PSA9_MULTIPLIER}x / ${PSA10_MULTIPLIER}x fill where sold-comp titles omit a grade.${thinTape ? ' Thin tape.' : ''}`
      : `Sold-comp titles underpin the grade ladder.${thinTape ? ' Thin tape — treat ratios as directional.' : ''}`;

  return {
    cardId: card.id,
    player: card.player,
    year: card.year,
    set: card.set,
    rawMark,
    psa9,
    psa10,
    psa10Over9,
    psa9OverRaw,
    psa10OverRaw,
    source,
    thinTape: thinTape || usedHeuristic || missingGrades.length > 0,
    missingGrades,
    rationale,
  };
}

export function analyzeGradeRatios(inventory: CardInventory[], limit = 8): GradeRatioRow[] {
  return activeCards(inventory)
    .map((card) => gradeRatioForCard(card))
    .filter((row): row is GradeRatioRow => row != null)
    .sort((a, b) => (b.psa10Over9 ?? 0) - (a.psa10Over9 ?? 0))
    .slice(0, limit);
}

export function analyzePlayerRatios(inventory: CardInventory[], limit = 6): PlayerRatioRow[] {
  const groups = new Map<string, CardInventory[]>();
  for (const card of activeCards(inventory)) {
    const key = card.player.trim().toLowerCase();
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(card);
    groups.set(key, list);
  }

  const rows: PlayerRatioRow[] = [];
  for (const cards of groups.values()) {
    if (cards.length < 2) continue;
    const priced = cards
      .map((card) => {
        const mark = usableMark(preferredValueForCard(card) || card.currentValue || card.purchasePrice);
        if (mark == null) return null;
        return {
          cardId: card.id,
          label: `${card.year} ${card.set}`.trim(),
          mark,
          thin: isThinCompSet(card.salesData),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
    if (priced.length < 2) continue;
    const marks = priced.map((row) => row.mark);
    const high = Math.max(...marks);
    const low = Math.min(...marks);
    rows.push({
      player: cards[0].player,
      cards: priced.map(({ cardId, label, mark }) => ({ cardId, label, mark })),
      highOverLow: ratio(high, low),
      medianMark: Math.round(median(marks) * 100) / 100,
      thinTape: priced.some((row) => row.thin) || priced.length < 3,
      rationale:
        priced.length < 3
          ? 'Only two priced siblings — player ratio is directional, not a deep book.'
          : `High/low mark across ${priced.length} holdings of ${cards[0].player}.`,
    });
  }

  return rows.sort((a, b) => (b.highOverLow ?? 0) - (a.highOverLow ?? 0)).slice(0, limit);
}

const VARIATION_SET_TOKENS =
  /\b(refractor|prizm|parallel|silver|gold|wave|shimmer|rainbow|speckle|auto|autograph|numbered)\b/gi;

export function variationFamilySet(set: string): string {
  return set
    .replace(VARIATION_SET_TOKENS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function familyKey(card: CardInventory): string {
  return [card.player.trim().toLowerCase(), String(card.year), variationFamilySet(card.set)].join('|');
}

export function analyzeVariationRatios(inventory: CardInventory[], limit = 6): VariationRatioRow[] {
  const groups = new Map<string, CardInventory[]>();
  for (const card of activeCards(inventory)) {
    const key = familyKey(card);
    const list = groups.get(key) ?? [];
    list.push(card);
    groups.set(key, list);
  }

  const rows: VariationRatioRow[] = [];
  for (const [key, cards] of groups) {
    if (cards.length < 2) continue;
    const priced = cards
      .map((card) => {
        const mark = usableMark(preferredValueForCard(card) || card.currentValue || card.purchasePrice);
        if (mark == null) return null;
        return { card, mark, kind: variationKind(card), thin: isThinCompSet(card.salesData) };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
    if (priced.length < 2) continue;

    const bases = priced.filter((row) => row.kind === 'base');
    const variants = priced.filter((row) => row.kind !== 'base');
    const baseMark = bases.length > 0 ? median(bases.map((row) => row.mark)) : null;
    const compareAgainst = variants.length > 0 ? variants : priced.filter((row) => row !== priced.reduce((min, row) => (row.mark < min.mark ? row : min)));

    for (const variant of compareAgainst) {
      if (baseMark != null && variant.kind === 'base') continue;
      const vsBase = baseMark != null ? ratio(variant.mark, baseMark) : ratio(variant.mark, Math.min(...priced.map((row) => row.mark)));
      rows.push({
        familyKey: key,
        player: variant.card.player,
        year: variant.card.year,
        set: variant.card.set,
        baseMark,
        variationKind: variant.kind,
        variationMark: variant.mark,
        variationCardId: variant.card.id,
        variationLabel: `${variant.card.year} ${variant.card.set} ${variant.kind}`,
        ratioVsBase: vsBase,
        thinTape: variant.thin || baseMark == null,
        rationale:
          baseMark == null
            ? 'No base-variation sibling with a mark — comparing to the cheapest card in the family.'
            : `${variant.kind} vs base mark on the same player/year/set.`,
      });
    }
  }

  return rows.sort((a, b) => (b.ratioVsBase ?? 0) - (a.ratioVsBase ?? 0)).slice(0, limit);
}

export function buildRatioIntelligenceReport(inventory: CardInventory[]): RatioIntelligenceReport {
  const grades = analyzeGradeRatios(inventory);
  const players = analyzePlayerRatios(inventory);
  const variations = analyzeVariationRatios(inventory);
  return {
    grades,
    players,
    variations,
    thinCount: [...grades, ...players, ...variations].filter((row) => row.thinTape).length,
    heuristicCount: grades.filter((row) => row.source !== 'comps').length,
    disclosure: RATIO_INTELLIGENCE_DISCLOSURE,
  };
}
