/**
 * Book versus the equal-weighted local index.
 * The book is the value-weighted change of held cards with a usable sparkline.
 * The index is the equal-weighted change of those same cards.
 * Not a live Sports Card Investor or Market Movers index.
 */
import type { CardInventory, Sport } from '../../types';
import { getCardSparkline } from './priceHistory';
import { eraBucket, isSealedLike, type PulseEra } from './marketPulse';
import { MOVER_MIN_POINTS, MOVER_STABLE_BAND_PCT } from './portfolioMovers';

export const INDEX_BEAT_DISCLOSURE =
  'The book is the value-weighted change of held cards with a usable local sparkline. The index is the equal-weighted change of those same cards. A gap within 2 points matches. Not a live Sports Card Investor or Market Movers index.';

export const INDEX_BEAT_NOTE =
  'A sold card, thin tape, and a sparkline that does not start above zero stay off. One usable card cannot beat an index of itself. A slice that is the whole set stays off the widest line. Not a live tape.';

export type IndexBeatCall = 'beat' | 'match' | 'lag' | 'off';
export type IndexBeatSliceKind = 'sport' | 'era' | 'format';

export interface IndexBeatCard {
  id: string;
  player: string;
  sport: Sport;
  era: PulseEra;
  sealed: boolean;
  from: number;
  to: number;
  changePct: number;
}

export interface IndexBeatSlice {
  id: string;
  kind: IndexBeatSliceKind;
  label: string;
  cards: number;
  startUsd: number;
  bookPct: number;
  indexPct: number;
  gapPct: number;
  call: Exclude<IndexBeatCall, 'off'>;
}

export interface IndexBeatAlert {
  copy: string;
  player: string;
  cardId: string;
  href: string;
}

export interface IndexBeat {
  scoped: boolean;
  call: IndexBeatCall;
  held: number;
  cards: number;
  off: number;
  startUsd: number;
  bookPct: number | null;
  indexPct: number | null;
  gapPct: number | null;
  slices: IndexBeatSlice[];
  widest: IndexBeatSlice | null;
  drag: IndexBeatCard | null;
  copy: string;
  alert: IndexBeatAlert | null;
  disclosure: string;
}

/** The same usable tape the index beat scores. Sold cards, thin tape, and a sparkline that does not start above zero stay off. */
export interface IndexTape {
  scoped: boolean;
  held: number;
  off: number;
  cards: IndexBeatCard[];
  startUsd: number;
  bookPct: number | null;
  indexPct: number | null;
  gapPct: number | null;
  call: IndexBeatCall;
  drag: IndexBeatCard | null;
}

interface Weighed {
  startUsd: number;
  bookPct: number;
  indexPct: number;
  gapPct: number;
  call: Exclude<IndexBeatCall, 'off'>;
}

const ERA_LABEL: Record<PulseEra, string> = {
  vintage: 'Vintage',
  junk: 'Junk wax',
  modern: 'Modern',
};

function round1(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

function changePct(from: number, to: number): number {
  return round1(((to - from) / from) * 100);
}

function callFromGap(gapPct: number): Exclude<IndexBeatCall, 'off'> {
  if (gapPct > MOVER_STABLE_BAND_PCT) return 'beat';
  if (gapPct < -MOVER_STABLE_BAND_PCT) return 'lag';
  return 'match';
}

function weigh(cards: readonly IndexBeatCard[]): Weighed {
  const start = cards.reduce((sum, card) => sum + card.from, 0);
  const end = cards.reduce((sum, card) => sum + card.to, 0);
  const bookPct = changePct(start, end);
  const indexPct = round1(cards.reduce((sum, card) => sum + card.changePct, 0) / cards.length);
  const gapPct = round1(bookPct - indexPct);
  return { startUsd: round1(start), bookPct, indexPct, gapPct, call: callFromGap(gapPct) };
}

function usableCard(card: CardInventory): IndexBeatCard | null {
  if (card.status === 'sold') return null;
  const spark = getCardSparkline(card);
  if (spark.source === 'thin' || spark.values.length < MOVER_MIN_POINTS) return null;
  const from = spark.values[0];
  const to = spark.values[spark.values.length - 1];
  if (!(from > 0) || !Number.isFinite(from) || !Number.isFinite(to) || to < 0) return null;
  const player = card.player.trim() || 'Held card';
  return {
    id: card.id,
    player,
    sport: card.sport,
    era: eraBucket(card.year),
    sealed: isSealedLike(card),
    from,
    to,
    changePct: changePct(from, to),
  };
}

function points(gapPct: number): string {
  const abs = Math.abs(gapPct).toFixed(1);
  return `${abs} ${abs === '1.0' ? 'point' : 'points'}`;
}

function signed(pct: number): string {
  if (pct > 0) return `up ${pct.toFixed(1)}%`;
  if (pct < 0) return `down ${Math.abs(pct).toFixed(1)}%`;
  return 'flat';
}

function subject(scoped: boolean): string {
  return scoped ? 'these favorites' : 'the book';
}

function offCopy(scoped: boolean, held: number, usable: number): string {
  if (held === 0) {
    return scoped
      ? 'Index beat: no favorite is on this desk.'
      : 'Index beat: no held card is on this desk.';
  }
  if (usable === 1) {
    const who = scoped ? 'favorite' : 'card';
    const left = held - usable;
    const tail = left > 0
      ? ` ${left} ${left === 1 ? 'card stays' : 'cards stay'} off.`
      : '';
    return `Index beat: one ${who} cannot beat an index of itself.${tail}`;
  }
  const noun = scoped
    ? (held === 1 ? 'favorite' : 'favorites')
    : (held === 1 ? 'held card' : 'held cards');
  const verb = held === 1 ? 'stays' : 'stay';
  return `Index beat: ${held} ${noun} ${verb} off this desk, so it does not say ${subject(scoped)} beat the index.`;
}

function sliceFrom(
  id: string,
  kind: IndexBeatSliceKind,
  label: string,
  cards: readonly IndexBeatCard[],
): IndexBeatSlice | null {
  if (cards.length < 2) return null;
  const weighed = weigh(cards);
  return { id, kind, label, cards: cards.length, ...weighed };
}

function buildSlices(cards: readonly IndexBeatCard[]): IndexBeatSlice[] {
  const groups = new Map<string, { kind: IndexBeatSliceKind; label: string; cards: IndexBeatCard[] }>();
  const ensure = (id: string, kind: IndexBeatSliceKind, label: string) => {
    const group = groups.get(id) ?? { kind, label, cards: [] };
    groups.set(id, group);
    return group;
  };
  for (const card of cards) {
    ensure(`sport-${card.sport}`, 'sport', card.sport).cards.push(card);
    ensure(`era-${card.era}`, 'era', ERA_LABEL[card.era]).cards.push(card);
    const format = card.sealed ? 'sealed' : 'singles';
    ensure(`format-${format}`, 'format', card.sealed ? 'Sealed' : 'Singles').cards.push(card);
  }
  const slices: IndexBeatSlice[] = [];
  for (const [id, group] of groups) {
    if (group.cards.length === cards.length) continue;
    const slice = sliceFrom(id, group.kind, group.label, group.cards);
    if (slice) slices.push(slice);
  }
  slices.sort((a, b) => {
    const gap = Math.abs(b.gapPct) - Math.abs(a.gapPct);
    if (gap !== 0) return gap;
    if (b.startUsd !== a.startUsd) return b.startUsd - a.startUsd;
    return a.label.localeCompare(b.label);
  });
  return slices;
}

function dragCard(cards: readonly IndexBeatCard[]): IndexBeatCard {
  return [...cards].sort((a, b) => {
    if (a.changePct !== b.changePct) return a.changePct - b.changePct;
    if (b.from !== a.from) return b.from - a.from;
    const name = a.player.localeCompare(b.player);
    if (name !== 0) return name;
    return a.id.localeCompare(b.id);
  })[0];
}

function scoredCopy(scoped: boolean, cards: readonly IndexBeatCard[], weighed: Weighed, widest: IndexBeatSlice | null, off: number): string {
  const who = subject(scoped);
  const count = `${cards.length} ${scoped ? 'favorites' : 'held cards'}`;
  let line = `Index beat: ${count}. ${who[0].toUpperCase()}${who.slice(1)} ${scoped ? 'are' : 'is'} ${signed(weighed.bookPct)} and the equal-weighted index is ${signed(weighed.indexPct)}. `;
  if (weighed.call === 'beat') {
    line += `The dollars beat that index by ${points(weighed.gapPct)}.`;
  } else if (weighed.call === 'lag') {
    line += `The dollars lagged that index by ${points(weighed.gapPct)}.`;
  } else {
    line += 'That gap is within 2 points, so the dollars matched the index.';
  }
  if (widest && widest.call !== 'match') {
    const verb = widest.call === 'beat' ? 'beat' : 'lagged';
    line += ` ${widest.label} ${verb} its own index by ${points(widest.gapPct)}.`;
  }
  if (off > 0) line += ` ${off} ${off === 1 ? 'card stays' : 'cards stay'} off.`;
  return `${line} Not a live Sports Card Investor or Market Movers index.`;
}

function alertFor(scoped: boolean, weighed: Weighed, drag: IndexBeatCard): IndexBeatAlert | null {
  if (weighed.call !== 'lag') return null;
  const who = scoped ? 'These favorites' : 'The book';
  return {
    copy: `Index beat: ${who} lagged the local index by ${points(weighed.gapPct)}. ${drag.player} dragged it. Not a live tape.`,
    player: drag.player,
    cardId: drag.id,
    href: `/audit-dossier?cardId=${encodeURIComponent(drag.id)}`,
  };
}

function quiet(scoped: boolean, held: number, off: number, copy: string): IndexBeat {
  return {
    scoped,
    call: 'off',
    held,
    cards: held - off,
    off,
    startUsd: 0,
    bookPct: null,
    indexPct: null,
    gapPct: null,
    slices: [],
    widest: null,
    drag: null,
    copy,
    alert: null,
    disclosure: INDEX_BEAT_DISCLOSURE,
  };
}

export function readIndexTape(inventory: readonly CardInventory[], ids?: readonly string[]): IndexTape {
  const scoped = ids != null;
  const allowed = scoped ? new Set(ids) : null;
  const heldCards = inventory.filter((card) => card.status !== 'sold' && (allowed == null || allowed.has(card.id)));
  const cards = heldCards
    .map((card) => usableCard(card))
    .filter((card): card is IndexBeatCard => card != null);
  const off = heldCards.length - cards.length;
  if (cards.length < 2) {
    return {
      scoped,
      held: heldCards.length,
      off,
      cards,
      startUsd: 0,
      bookPct: null,
      indexPct: null,
      gapPct: null,
      call: 'off',
      drag: null,
    };
  }
  const weighed = weigh(cards);
  return {
    scoped,
    held: heldCards.length,
    off,
    cards,
    startUsd: weighed.startUsd,
    bookPct: weighed.bookPct,
    indexPct: weighed.indexPct,
    gapPct: weighed.gapPct,
    call: weighed.call,
    drag: dragCard(cards),
  };
}

export function indexBeat(inventory: readonly CardInventory[], ids?: readonly string[]): IndexBeat {
  const tape = readIndexTape(inventory, ids);
  if (tape.call === 'off' || tape.gapPct == null || tape.bookPct == null || tape.indexPct == null) {
    return quiet(tape.scoped, tape.held, tape.off, offCopy(tape.scoped, tape.held, tape.cards.length));
  }
  const weighed: Weighed = {
    startUsd: tape.startUsd,
    bookPct: tape.bookPct,
    indexPct: tape.indexPct,
    gapPct: tape.gapPct,
    call: tape.call,
  };
  const slices = buildSlices(tape.cards);
  const widest = slices[0] ?? null;
  const drag = tape.drag ?? dragCard(tape.cards);
  return {
    scoped: tape.scoped,
    call: weighed.call,
    held: tape.held,
    cards: tape.cards.length,
    off: tape.off,
    startUsd: weighed.startUsd,
    bookPct: weighed.bookPct,
    indexPct: weighed.indexPct,
    gapPct: weighed.gapPct,
    slices,
    widest,
    drag,
    copy: scoredCopy(tape.scoped, tape.cards, weighed, widest, tape.off),
    alert: alertFor(tape.scoped, weighed, drag),
    disclosure: INDEX_BEAT_DISCLOSURE,
  };
}
