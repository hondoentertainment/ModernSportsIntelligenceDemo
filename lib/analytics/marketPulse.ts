/**
 * Multi-segment Market Pulse — sport / era / sealed-vs-singles.
 * Seeded hobby-health composite plus local NAV share and snapshot movers.
 * Not live Sports Card Investor Market Pulse parity.
 */
import type { CardInventory, Sport } from '../../types';
import {
  bandForHobbyScore,
  computeHobbyHealthIndex,
  HOBBY_HEALTH_DISCLOSURE,
  type HobbyHealthBand,
  type HobbyHealthIndex,
} from '../utils/hobbyHealthIndex';
import { getCardSparkline } from './priceHistory';
import { preferredValueForCard } from '../pricing/compConsensus';

export const MARKET_PULSE_DISCLOSURE =
  `${HOBBY_HEALTH_DISCLOSURE} Multi-segment Pulse (sport / era / sealed-vs-singles) mixes that seeded composite with local NAV share and snapshot movers — not live SCI Market Pulse tape.`;

export type PulseSegmentKind = 'sport' | 'era' | 'format';
export type PulseEra = 'vintage' | 'junk' | 'modern';
export type PulseFormat = 'sealed' | 'singles';

export interface PulseSegment {
  id: string;
  kind: PulseSegmentKind;
  label: string;
  score: number;
  band: HobbyHealthBand;
  navSharePct: number;
  moverPct: number | null;
  cardCount: number;
  thin: boolean;
}

export interface MarketPulseReport {
  headline: HobbyHealthIndex;
  segments: PulseSegment[];
  disclosure: string;
}

const SPORT_LABEL: Record<Sport, string> = {
  Baseball: 'MLB / baseball',
  Basketball: 'NBA / basketball',
  Football: 'NFL / football',
  Hockey: 'NHL / hockey',
  Soccer: 'Soccer',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function seededUnit(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

export function eraBucket(year: number): PulseEra {
  if (year < 1980) return 'vintage';
  if (year < 2006) return 'junk';
  return 'modern';
}

export function isSealedLike(card: Pick<CardInventory, 'set' | 'notes' | 'manufacturer'>): boolean {
  return /wax|hobby box|jumbo|sealed|blaster|mega box|case break/i.test(
    `${card.set} ${card.notes ?? ''} ${card.manufacturer}`,
  );
}

function cardNav(card: CardInventory): number {
  return preferredValueForCard(card) || card.currentValue || card.purchasePrice || 0;
}

function moverPctForCards(cards: CardInventory[]): number | null {
  const pcts: number[] = [];
  for (const card of cards) {
    const spark = getCardSparkline(card);
    if (spark.source === 'thin' || spark.values.length < 2) continue;
    const first = spark.values[0];
    const last = spark.values[spark.values.length - 1];
    if (!(first > 0)) continue;
    pcts.push(((last - first) / first) * 100);
  }
  if (pcts.length === 0) return null;
  const avg = pcts.reduce((sum, value) => sum + value, 0) / pcts.length;
  return Math.round(avg * 10) / 10;
}

function segmentScore(
  headline: number,
  navSharePct: number,
  moverPct: number | null,
  seed: number,
  offset: number,
): number {
  const seeded = seededUnit(seed, offset) * 8 - 4;
  const shareNudge = (navSharePct - 20) * 0.15;
  const moverNudge = moverPct == null ? 0 : clamp(moverPct, -12, 12) * 0.35;
  return Math.round(clamp(headline + seeded + shareNudge + moverNudge, 0, 100));
}

function toSegment(
  id: string,
  kind: PulseSegmentKind,
  label: string,
  cards: CardInventory[],
  nav: number,
  headline: number,
  seed: number,
  offset: number,
): PulseSegment {
  const sliceNav = cards.reduce((sum, card) => sum + cardNav(card), 0);
  const navSharePct = nav > 0 ? Math.round((sliceNav / nav) * 1000) / 10 : 0;
  const moverPct = moverPctForCards(cards);
  const score = segmentScore(headline, navSharePct, moverPct, seed, offset);
  return {
    id,
    kind,
    label,
    score,
    band: bandForHobbyScore(score),
    navSharePct,
    moverPct,
    cardCount: cards.length,
    thin: cards.length === 0 || moverPct == null,
  };
}

export function computeMarketPulse(options?: {
  inventory?: CardInventory[];
  seed?: number;
  portfolioNav?: number;
  asOf?: string;
}): MarketPulseReport {
  const inventory = (options?.inventory ?? []).filter((card) => card.status !== 'sold');
  const nav = inventory.reduce((sum, card) => sum + cardNav(card), 0);
  const headline = computeHobbyHealthIndex({
    seed: options?.seed,
    portfolioNav: options?.portfolioNav ?? nav,
    asOf: options?.asOf,
  });
  const seed = options?.seed ?? 20260906;

  const bySport = new Map<Sport, CardInventory[]>();
  const byEra: Record<PulseEra, CardInventory[]> = { vintage: [], junk: [], modern: [] };
  const byFormat: Record<PulseFormat, CardInventory[]> = { sealed: [], singles: [] };

  for (const card of inventory) {
    const sportList = bySport.get(card.sport) ?? [];
    sportList.push(card);
    bySport.set(card.sport, sportList);
    byEra[eraBucket(card.year)].push(card);
    if (isSealedLike(card)) byFormat.sealed.push(card);
    else byFormat.singles.push(card);
  }

  const sports: PulseSegment[] = (Object.keys(SPORT_LABEL) as Sport[]).map((sport, index) =>
    toSegment(
      `sport-${sport.toLowerCase()}`,
      'sport',
      SPORT_LABEL[sport],
      bySport.get(sport) ?? [],
      nav,
      headline.score,
      seed,
      10 + index,
    ),
  );

  const eras: PulseSegment[] = (
    [
      ['vintage', 'Vintage (pre-1980)'],
      ['junk', 'Junk / late wax (1980–2005)'],
      ['modern', 'Modern (2006+)'],
    ] as const
  ).map(([id, label], index) =>
    toSegment(`era-${id}`, 'era', label, byEra[id], nav, headline.score, seed, 20 + index),
  );

  const formats: PulseSegment[] = (
    [
      ['sealed', 'Sealed wax / boxes'],
      ['singles', 'Singles'],
    ] as const
  ).map(([id, label], index) =>
    toSegment(`format-${id}`, 'format', label, byFormat[id], nav, headline.score, seed, 30 + index),
  );

  return {
    headline,
    segments: [...sports, ...eras, ...formats],
    disclosure: MARKET_PULSE_DISCLOSURE,
  };
}
