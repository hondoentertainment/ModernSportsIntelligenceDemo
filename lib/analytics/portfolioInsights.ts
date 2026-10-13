/**
 * Portfolio book insights — cost basis, duplicate stacks, and mix
 * from the local collection. Preferred marks follow sold comps when a
 * consensus or thin/stale tape exists, otherwise the stored card value.
 * Not a live Sports Card Investor portfolio.
 */
import type { CardInventory } from '../../types';
import { preferredValuationForCard } from '../pricing/compConsensus';

export const PORTFOLIO_INSIGHTS_DISCLOSURE =
  'Local book only. Marks prefer stored sold comps when a consensus or thin/stale tape exists, otherwise the card’s stored value. Cost is purchase price plus stored grading, shipping, and insurance fees. Duplicate stacks match player, year, manufacturer, set, and card number — grade and condition can still differ. Not a live Sports Card Investor portfolio, not tax advice, and not a trade order.';

export const INSIGHT_LIMIT = 4;
export const PLAYER_WATCH_SHARE = 35;
export const PLAYER_NOTE_SHARE = 25;
export const DUPLICATE_WATCH_SHARE = 15;
export const NUMBERED_NOTE_SHARE = 40;
export const ERA_NOTE_SHARE = 70;

export type InsightTone = 'positive' | 'watch' | 'info';

export interface BookTotals {
  activeCount: number;
  consignmentCount: number;
  soldCount: number;
  soldUnpricedCount: number;
  purchaseCost: number;
  feeDrag: number;
  allInCost: number;
  mark: number;
  pricedMark: number;
  unrealized: number;
  unrealizedPct: number;
  realized: number;
  compBackedCount: number;
  unpricedCount: number;
}

export interface PerformerRow {
  cardId: string;
  player: string;
  label: string;
  cost: number;
  mark: number;
  gain: number;
  gainPct: number;
}

export interface MixSlice {
  key: string;
  label: string;
  count: number;
  value: number;
  sharePct: number;
}

export interface DuplicateStack {
  key: string;
  player: string;
  label: string;
  copies: number;
  extraCopies: number;
  extraMark: number;
  grades: string[];
}

export interface PortfolioInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

export interface PortfolioInsightsReport {
  totals: BookTotals;
  gainers: PerformerRow[];
  losers: PerformerRow[];
  slabMix: MixSlice[];
  eraMix: MixSlice[];
  printRunMix: MixSlice[];
  duplicates: DuplicateStack[];
  duplicateStackCount: number;
  duplicateExtraCopies: number;
  duplicateExtraMark: number;
  insights: PortfolioInsight[];
  emptyReason: string | null;
  disclosure: string;
}

interface HoldingMath {
  card: CardInventory;
  mark: number;
  purchase: number;
  fees: number;
  allIn: number;
  compBacked: boolean;
  gain: number;
}

function money(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function sharePct(part: number, total: number): number {
  if (total <= 0) return 0;
  return round1((part / total) * 100);
}

function dollars(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

function signedDollars(value: number): string {
  if (value > 0) return `+${dollars(value)}`;
  if (value < 0) return dollars(value);
  return dollars(0);
}

function pctLabel(value: number): string {
  const rounded = round1(value);
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isSold(card: CardInventory): boolean {
  return card.status === 'sold';
}

function cardLabel(card: CardInventory): string {
  const number = card.cardNumber?.trim() ? `#${card.cardNumber.trim()}` : 'no number';
  return `${card.year} ${card.manufacturer} ${card.set} ${number}`.replace(/\s+/g, ' ').trim();
}

function gradeLabel(card: CardInventory): string {
  if (!card.isGraded) return 'Raw';
  const company = card.gradingCompany?.trim();
  const grade = card.grade?.trim();
  if (company && grade) return `${company} ${grade}`;
  if (company) return company;
  if (grade) return `Graded ${grade}`;
  return 'Graded';
}

function slabKey(card: CardInventory): { key: string; label: string } {
  if (!card.isGraded) return { key: 'raw', label: 'Raw' };
  const company = card.gradingCompany?.trim();
  if (company) return { key: company.toLowerCase(), label: company };
  return { key: 'graded', label: 'Graded' };
}

function eraBucket(year: number): { key: string; label: string } {
  if (!Number.isFinite(year) || year < 1900) return { key: 'unknown', label: 'Year not stored' };
  if (year < 1980) return { key: 'vintage', label: 'Vintage (pre-1980)' };
  if (year < 2000) return { key: 'junk', label: '1980–1999' };
  if (year < 2016) return { key: 'mid', label: '2000–2015' };
  return { key: 'modern', label: 'Modern (2016+)' };
}

function printRunBucket(setName: string): { key: string; label: string } {
  const match = setName.match(/\/\s*(\d+)\s*$/);
  const denominator = match ? Number(match[1]) : 0;
  if (!match || denominator <= 0) {
    return { key: 'open', label: 'Unnumbered' };
  }
  if (denominator <= 10) return { key: 'short', label: 'Numbered /10 or fewer' };
  if (denominator <= 99) return { key: 'low', label: 'Numbered /11–/99' };
  if (denominator <= 499) return { key: 'mid', label: 'Numbered /100–/499' };
  return { key: 'high', label: 'Numbered /500+' };
}

function holdingMath(card: CardInventory, nowMs: number): HoldingMath {
  const preferred = preferredValuationForCard(card, nowMs);
  const purchase = money(card.purchasePrice);
  const fees = money(card.gradingFees) + money(card.shippingFees) + money(card.insuranceFees);
  const allIn = Math.round((purchase + fees) * 100) / 100;
  const mark = money(preferred.value);
  return {
    card,
    mark,
    purchase,
    fees,
    allIn,
    compBacked: preferred.method === 'sold-comp-consensus' || preferred.method === 'thin-comp-fallback',
    gain: Math.round((mark - allIn) * 100) / 100,
  };
}

function performer(row: HoldingMath): PerformerRow {
  return {
    cardId: row.card.id,
    player: row.card.player,
    label: cardLabel(row.card),
    cost: row.allIn,
    mark: row.mark,
    gain: row.gain,
    gainPct: round1((row.gain / row.allIn) * 100),
  };
}

function comparePerformers(a: PerformerRow, b: PerformerRow): number {
  if (b.gain !== a.gain) return b.gain - a.gain;
  const name = a.player.localeCompare(b.player);
  if (name !== 0) return name;
  return a.cardId.localeCompare(b.cardId);
}

function addMix(
  map: Map<string, MixSlice>,
  key: string,
  label: string,
  value: number,
): void {
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    existing.value = Math.round((existing.value + value) * 100) / 100;
    return;
  }
  map.set(key, { key, label, count: 1, value, sharePct: 0 });
}

function finishMix(map: Map<string, MixSlice>, total: number): MixSlice[] {
  return [...map.values()]
    .map((slice) => ({ ...slice, sharePct: sharePct(slice.value, total) }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function identityKey(card: CardInventory): string {
  return [norm(card.player), String(card.year), norm(card.manufacturer), norm(card.set), norm(card.cardNumber)].join('|');
}

function buildDuplicates(rows: HoldingMath[], limit: number): {
  stacks: DuplicateStack[];
  stackCount: number;
  extraCopies: number;
  extraMark: number;
} {
  const groups = new Map<string, HoldingMath[]>();
  for (const row of rows) {
    const key = identityKey(row.card);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const stacks: DuplicateStack[] = [];
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const ordered = group
      .map((row) => ({ row, graded: row.card.isGraded ? 1 : 0 }))
      .sort((a, b) => {
        if (b.row.mark !== a.row.mark) return b.row.mark - a.row.mark;
        if (b.graded !== a.graded) return b.graded - a.graded;
        return a.row.card.id.localeCompare(b.row.card.id);
      })
      .map((entry) => entry.row);
    const extras = ordered.slice(1);
    const sample = ordered[0].card;
    stacks.push({
      key,
      player: sample.player,
      label: cardLabel(sample),
      copies: group.length,
      extraCopies: extras.length,
      extraMark: Math.round(extras.reduce((sum, row) => sum + row.mark, 0) * 100) / 100,
      grades: [...new Set(ordered.map((row) => gradeLabel(row.card)))],
    });
  }

  stacks.sort((a, b) => b.extraMark - a.extraMark || b.copies - a.copies || a.player.localeCompare(b.player));
  const extraCopies = stacks.reduce((sum, stack) => sum + stack.extraCopies, 0);
  const extraMark = Math.round(stacks.reduce((sum, stack) => sum + stack.extraMark, 0) * 100) / 100;
  return { stacks: stacks.slice(0, limit), stackCount: stacks.length, extraCopies, extraMark };
}

function buildInsights(input: {
  totals: BookTotals;
  topPlayer: { label: string; sharePct: number } | null;
  duplicateStackCount: number;
  duplicateExtraCopies: number;
  duplicateExtraMark: number;
  gradedShare: number;
  gradedCount: number;
  numberedShare: number;
  topEra: { label: string; sharePct: number } | null;
  activeCount: number;
}): PortfolioInsight[] {
  const { totals } = input;
  const queue: PortfolioInsight[] = [];

  if (totals.allInCost > 0) {
    const up = totals.unrealized > 0;
    const down = totals.unrealized < 0;
    queue.push({
      id: 'unrealized',
      tone: up ? 'positive' : down ? 'watch' : 'info',
      title: up ? 'Book is above all-in cost' : down ? 'Book is below all-in cost' : 'Book matches all-in cost',
      detail: `Unrealized vs all-in cost is ${signedDollars(totals.unrealized)} (${signedPct(totals.unrealizedPct)}) on ${dollars(totals.pricedMark)} of priced marks.`,
    });
  } else if (totals.mark > 0) {
    queue.push({
      id: 'no-cost',
      tone: 'info',
      title: 'No stored cost on this book',
      detail: 'Holdings have a mark and no purchase or fee cost, so unrealized P/L is not computed.',
    });
  }

  if (input.duplicateStackCount > 0) {
    const extraShare = sharePct(input.duplicateExtraMark, totals.mark);
    queue.push({
      id: 'duplicates',
      tone: extraShare >= DUPLICATE_WATCH_SHARE ? 'watch' : 'info',
      title: `${input.duplicateStackCount} duplicate stack${input.duplicateStackCount === 1 ? '' : 's'}`,
      detail: `${input.duplicateExtraCopies} extra cop${input.duplicateExtraCopies === 1 ? 'y ties' : 'ies tie'} up ${dollars(input.duplicateExtraMark)} (${pctLabel(extraShare)} of the mark). Same player, year, manufacturer, set, and number — grade can still differ.`,
    });
  }

  if (input.topPlayer && input.topPlayer.sharePct >= PLAYER_NOTE_SHARE) {
    queue.push({
      id: 'player',
      tone: input.topPlayer.sharePct >= PLAYER_WATCH_SHARE ? 'watch' : 'info',
      title: `${input.topPlayer.label} leads the book`,
      detail: `${input.topPlayer.label} is ${pctLabel(input.topPlayer.sharePct)} of the preferred mark.`,
    });
  }

  if (input.gradedShare > 0 && input.gradedShare < 100) {
    queue.push({
      id: 'graded',
      tone: 'info',
      title: 'Slabs and raw cards share the book',
      detail: `Graded slabs are ${pctLabel(input.gradedShare)} of the mark across ${input.gradedCount} card${input.gradedCount === 1 ? '' : 's'}.`,
    });
  }

  if (input.numberedShare >= NUMBERED_NOTE_SHARE) {
    queue.push({
      id: 'numbered',
      tone: 'info',
      title: 'Numbered parallels carry the mark',
      detail: `Sets whose name ends in a print run are ${pctLabel(input.numberedShare)} of the preferred mark.`,
    });
  }

  if (input.topEra && input.topEra.sharePct >= ERA_NOTE_SHARE && input.activeCount > 1) {
    queue.push({
      id: 'era',
      tone: 'info',
      title: `${input.topEra.label} dominates`,
      detail: `${input.topEra.label} is ${pctLabel(input.topEra.sharePct)} of the preferred mark.`,
    });
  }

  if (totals.unpricedCount > 0 && totals.allInCost > 0) {
    queue.push({
      id: 'missing-cost',
      tone: 'info',
      title: 'Some cards have no cost',
      detail: `${totals.unpricedCount} active card${totals.unpricedCount === 1 ? '' : 's'} have no purchase price or fees, so they stay out of the unrealized percentage.`,
    });
  }

  if (totals.soldCount > 0) {
    queue.push({
      id: 'realized',
      tone: totals.realized > 0 ? 'positive' : totals.realized < 0 ? 'watch' : 'info',
      title: 'Sold cards stay out of the mark',
      detail:
        totals.soldUnpricedCount > 0
          ? `${signedDollars(totals.realized)} realized on priced sales. ${totals.soldUnpricedCount} sold ${totals.soldUnpricedCount === 1 ? 'card has' : 'cards have'} no sale price, so nothing was invented for them.`
          : `${signedDollars(totals.realized)} realized against all-in cost on ${totals.soldCount} sold ${totals.soldCount === 1 ? 'card' : 'cards'}.`,
    });
  }

  return queue.slice(0, INSIGHT_LIMIT);
}

function signedPct(value: number): string {
  const label = pctLabel(value);
  if (value > 0) return `+${label}`;
  return label;
}

function emptyReport(): PortfolioInsightsReport {
  return {
    totals: {
      activeCount: 0,
      consignmentCount: 0,
      soldCount: 0,
      soldUnpricedCount: 0,
      purchaseCost: 0,
      feeDrag: 0,
      allInCost: 0,
      mark: 0,
      pricedMark: 0,
      unrealized: 0,
      unrealizedPct: 0,
      realized: 0,
      compBackedCount: 0,
      unpricedCount: 0,
    },
    gainers: [],
    losers: [],
    slabMix: [],
    eraMix: [],
    printRunMix: [],
    duplicates: [],
    duplicateStackCount: 0,
    duplicateExtraCopies: 0,
    duplicateExtraMark: 0,
    insights: [],
    emptyReason: 'No cards in the local book.',
    disclosure: PORTFOLIO_INSIGHTS_DISCLOSURE,
  };
}

export function buildPortfolioInsights(
  inventory: readonly CardInventory[],
  options?: { limit?: number; nowMs?: number },
): PortfolioInsightsReport {
  if (inventory.length === 0) return emptyReport();

  const limit = options?.limit ?? 3;
  const nowMs = options?.nowMs ?? Date.now();
  const math = inventory.map((card) => holdingMath(card, nowMs));
  const active = math.filter((row) => !isSold(row.card));
  const sold = math.filter((row) => isSold(row.card));

  let purchaseCost = 0;
  let feeDrag = 0;
  let allInCost = 0;
  let mark = 0;
  let pricedMark = 0;
  let compBackedCount = 0;
  let unpricedCount = 0;
  let consignmentCount = 0;
  const players = new Map<string, { label: string; value: number; count: number }>();
  const slabs = new Map<string, MixSlice>();
  const eras = new Map<string, MixSlice>();
  const printRuns = new Map<string, MixSlice>();
  let gradedValue = 0;
  let gradedCount = 0;
  let numberedValue = 0;

  for (const row of active) {
    if (row.card.status === 'consignment') consignmentCount += 1;
    purchaseCost += row.purchase;
    feeDrag += row.fees;
    allInCost += row.allIn;
    mark += row.mark;
    if (row.compBacked) compBackedCount += 1;
    if (row.allIn > 0) pricedMark += row.mark;
    else unpricedCount += 1;

    const playerKey = norm(row.card.player) || 'unknown';
    const player = players.get(playerKey);
    if (player) {
      player.value = Math.round((player.value + row.mark) * 100) / 100;
      player.count += 1;
    } else {
      players.set(playerKey, { label: row.card.player.trim() || 'Unknown', value: row.mark, count: 1 });
    }

    const slab = slabKey(row.card);
    addMix(slabs, slab.key, slab.label, row.mark);
    if (row.card.isGraded) {
      gradedValue += row.mark;
      gradedCount += 1;
    }
    const era = eraBucket(row.card.year);
    addMix(eras, era.key, era.label, row.mark);
    const run = printRunBucket(row.card.set ?? '');
    addMix(printRuns, run.key, run.label, row.mark);
    if (run.key !== 'open') numberedValue += row.mark;
  }

  purchaseCost = Math.round(purchaseCost * 100) / 100;
  feeDrag = Math.round(feeDrag * 100) / 100;
  allInCost = Math.round(allInCost * 100) / 100;
  mark = Math.round(mark * 100) / 100;
  pricedMark = Math.round(pricedMark * 100) / 100;
  const unrealized = Math.round((pricedMark - allInCost) * 100) / 100;
  const unrealizedPct = allInCost > 0 ? round1((unrealized / allInCost) * 100) : 0;

  let realized = 0;
  let soldUnpricedCount = 0;
  for (const row of sold) {
    const sale = money(row.card.salePrice);
    if (sale <= 0) {
      soldUnpricedCount += 1;
      continue;
    }
    realized += sale - row.allIn;
  }
  realized = Math.round(realized * 100) / 100;

  const priced = active.filter((row) => row.allIn > 0);
  const performers = priced.map(performer).sort(comparePerformers);
  const gainers = performers.filter((row) => row.gain > 0).slice(0, limit);
  const losers = [...performers].filter((row) => row.gain < 0).sort((a, b) => a.gain - b.gain || a.player.localeCompare(b.player) || a.cardId.localeCompare(b.cardId)).slice(0, limit);

  const duplicates = buildDuplicates(active, limit);
  const slabMix = finishMix(slabs, mark);
  const eraMix = finishMix(eras, mark);
  const printRunMix = finishMix(printRuns, mark);

  const topPlayerEntry = [...players.values()].sort(
    (a, b) => b.value - a.value || b.count - a.count || a.label.localeCompare(b.label),
  )[0];
  const topPlayer = topPlayerEntry
    ? { label: topPlayerEntry.label, sharePct: sharePct(topPlayerEntry.value, mark) }
    : null;
  const topEra = eraMix[0] ? { label: eraMix[0].label, sharePct: eraMix[0].sharePct } : null;

  const totals: BookTotals = {
    activeCount: active.length,
    consignmentCount,
    soldCount: sold.length,
    soldUnpricedCount,
    purchaseCost,
    feeDrag,
    allInCost,
    mark,
    pricedMark,
    unrealized,
    unrealizedPct,
    realized,
    compBackedCount,
    unpricedCount,
  };

  return {
    totals,
    gainers,
    losers,
    slabMix,
    eraMix,
    printRunMix,
    duplicates: duplicates.stacks,
    duplicateStackCount: duplicates.stackCount,
    duplicateExtraCopies: duplicates.extraCopies,
    duplicateExtraMark: duplicates.extraMark,
    insights: buildInsights({
      totals,
      topPlayer,
      duplicateStackCount: duplicates.stackCount,
      duplicateExtraCopies: duplicates.extraCopies,
      duplicateExtraMark: duplicates.extraMark,
      gradedShare: sharePct(gradedValue, mark),
      gradedCount,
      numberedShare: sharePct(numberedValue, mark),
      topEra,
      activeCount: active.length,
    }),
    emptyReason: null,
    disclosure: PORTFOLIO_INSIGHTS_DISCLOSURE,
  };
}
