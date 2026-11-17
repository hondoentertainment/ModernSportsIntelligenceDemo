/**
 * Dollar weight behind the index beat.
 * The dollars are that desk's index gap times the sparkline start.
 * The card is its share of that start against an equal share, and the part of
 * the lead or the lag that extra weight carried.
 * Not a live Sports Card Investor or Market Movers index.
 */
import type { CardInventory } from '../../types';
import { readIndexTape, type IndexBeatCall, type IndexBeatCard } from './indexBeat';

export const WEIGHT_GAP_DISCLOSURE =
  'The dollars are the index gap times the sparkline start on this desk. The card is its share of that start against an equal share. A percent is that card\'s share of the net gap. When other cards offset the pull, the line names those dollars. Not a live Sports Card Investor or Market Movers index.';

export const WEIGHT_GAP_NOTE =
  'A sold card, thin tape, and a sparkline that does not start above zero stay off. One usable card stays off. A percent is a share of the net gap. An offset is named in dollars. A match stays off the alert. A tie does not name one card as more than half. Not a live tape.';

export interface WeightGapCarry {
  id: string;
  player: string;
  sharePct: number;
  equalPct: number;
  partPct: number;
}

export interface WeightGapAlert {
  copy: string;
  player: string;
  cardId: string;
  href: string;
}

export interface WeightGap {
  scoped: boolean;
  call: IndexBeatCall;
  held: number;
  cards: number;
  off: number;
  startUsd: number;
  gapPct: number | null;
  gapUsd: number | null;
  carry: WeightGapCarry | null;
  tied: WeightGapCarry[];
  offsetUsd: number;
  copy: string;
  alert: WeightGapAlert | null;
  disclosure: string;
}

interface Weighted extends IndexBeatCard {
  share: number;
  contribution: number;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function percent(value: number): string {
  return `${round1(value).toFixed(1)}%`;
}

function points(gapPct: number): string {
  const abs = Math.abs(gapPct).toFixed(1);
  return `${abs} ${abs === '1.0' ? 'point' : 'points'}`;
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

function quiet(scoped: boolean, held: number, off: number, copy: string): WeightGap {
  return {
    scoped,
    call: 'off',
    held,
    cards: held - off,
    off,
    startUsd: 0,
    gapPct: null,
    gapUsd: null,
    carry: null,
    tied: [],
    offsetUsd: 0,
    copy,
    alert: null,
    disclosure: WEIGHT_GAP_DISCLOSURE,
  };
}

function offCopy(scoped: boolean, held: number, usable: number): string {
  if (held === 0) {
    return scoped
      ? 'Weight gap: no favorite is on this desk.'
      : 'Weight gap: no held card is on this desk.';
  }
  if (usable === 1) {
    const who = scoped ? 'favorite' : 'card';
    const left = held - usable;
    const tail = left > 0 ? ` ${left} ${left === 1 ? 'card stays' : 'cards stay'} off.` : '';
    return `Weight gap: one ${who} cannot show a weight gap against itself.${tail}`;
  }
  const noun = scoped
    ? (held === 1 ? 'favorite' : 'favorites')
    : (held === 1 ? 'held card' : 'held cards');
  const verb = held === 1 ? 'stays' : 'stay';
  return `Weight gap: ${held} ${noun} ${verb} off this desk, so it does not price a weight gap.`;
}

function weightCards(cards: readonly IndexBeatCard[]): Weighted[] {
  const start = cards.reduce((sum, card) => sum + card.from, 0);
  const equal = 1 / cards.length;
  return cards.map((card) => {
    const share = start > 0 ? card.from / start : equal;
    return { ...card, share, contribution: (share - equal) * card.changePct };
  });
}

function toCarry(card: Weighted, equalPct: number, partPct: number): WeightGapCarry {
  return {
    id: card.id,
    player: card.player,
    sharePct: round1(card.share * 100),
    equalPct,
    partPct,
  };
}

function carriersFor(
  cards: readonly IndexBeatCard[],
  gapPct: number,
  startUsd: number,
  gapUsd: number,
): { carriers: WeightGapCarry[]; offsetUsd: number; pullUsd: number } {
  const empty = { carriers: [], offsetUsd: 0, pullUsd: 0 };
  if (gapPct === 0) return empty;
  const weighted = weightCards(cards);
  const side = weighted.filter((card) => (gapPct > 0 ? card.contribution > 0 : card.contribution < 0));
  if (side.length === 0) return empty;
  const ranked = [...side].sort((a, b) => {
    const gap = Math.abs(b.contribution) - Math.abs(a.contribution);
    if (!nearlyEqual(Math.abs(a.contribution), Math.abs(b.contribution)) && gap !== 0) return gap;
    if (b.from !== a.from) return b.from - a.from;
    const name = a.player.localeCompare(b.player);
    if (name !== 0) return name;
    return a.id.localeCompare(b.id);
  });
  const top = ranked[0];
  const equalPct = round1(100 / cards.length);
  const tied = ranked.filter((card) => nearlyEqual(Math.abs(card.contribution), Math.abs(top.contribution)));
  const sideTotal = side.reduce((sum, card) => sum + Math.abs(card.contribution), 0);
  const partPct = round1((Math.abs(top.contribution) / Math.abs(gapPct)) * 100);
  const pullUsd = cents((startUsd * Math.abs(top.contribution)) / 100);
  const sideUsd = cents((startUsd * sideTotal) / 100);
  const offsetUsd = Math.max(0, cents(sideUsd - Math.abs(gapUsd)));
  return {
    carriers: [...tied]
      .sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id))
      .map((card) => toCarry(card, equalPct, partPct)),
    offsetUsd,
    pullUsd,
  };
}

function names(cards: readonly WeightGapCarry[]): string {
  if (cards.length === 1) return cards[0].player;
  if (cards.length === 2) return `${cards[0].player} and ${cards[1].player}`;
  if (cards.length === 3) return `${cards[0].player}, ${cards[1].player}, and ${cards[2].player}`;
  return `${cards.length} cards`;
}

function carrySentence(
  cards: readonly WeightGapCarry[],
  gapPct: number,
  offsetUsd: number,
  pullUsd: number,
): string {
  const side = gapPct > 0 ? 'lead' : 'lag';
  const share = cards.length === 1
    ? `${cards[0].player} is ${percent(cards[0].sharePct)} of that start. The equal share is ${percent(cards[0].equalPct)}. `
    : '';
  if (offsetUsd > 0) {
    const who = cards.length === 1 ? 'That extra weight' : `${names(cards)} each`;
    return `${share}${who} pulled ${money(pullUsd)}, and other cards offset ${money(offsetUsd)}.`;
  }
  const part = percent(cards[0].partPct);
  if (cards.length === 1) {
    return `${share}That extra weight carried ${part} of this net ${side}.`;
  }
  const verb = cards.length === 2 || cards.length === 3 ? 'each carried' : 'tied and each carried';
  return `${names(cards)} ${verb} ${part} of this net ${side}.`;
}

function scoredCopy(
  scoped: boolean,
  gapPct: number,
  gapUsd: number,
  startUsd: number,
  call: Exclude<IndexBeatCall, 'off'>,
  off: number,
  carriers: readonly WeightGapCarry[],
  dragId: string | null,
  offsetUsd: number,
  pullUsd: number,
): string {
  const who = scoped ? 'These favorites are' : 'The book is';
  const where = gapPct > 0 ? 'ahead of' : 'behind';
  let line = gapPct === 0
    ? `Weight gap: ${scoped ? 'These favorites moved' : 'The book moved'} with the equal-weighted index on the ${money(startUsd)} start.`
    : `Weight gap: ${who} ${money(Math.abs(gapUsd))} ${where} the equal-weighted index on the ${money(startUsd)} start.`;
  if (gapPct !== 0 && call === 'match') {
    line += ` Those ${points(gapPct)} are inside the 2-point band, so the dollars matched.`;
  } else if (gapPct !== 0) {
    line += ` That gap is ${points(gapPct)}.`;
  }
  if (off > 0) line += ` ${off} ${off === 1 ? 'card stays' : 'cards stay'} off.`;
  if (carriers.length > 0) line += ` ${carrySentence(carriers, gapPct, offsetUsd, pullUsd)}`;
  else if (gapPct !== 0) line += ' No card\'s extra weight explains that gap.';
  const different = carriers.length > 0
    && dragId != null
    && call === 'lag'
    && carriers.every((card) => card.id !== dragId);
  if (different) line += ' The percent drag is a different card.';
  return `${line} Not a live Sports Card Investor or Market Movers index.`;
}

function alertFor(
  scoped: boolean,
  carriers: readonly WeightGapCarry[],
  call: IndexBeatCall,
  offsetUsd: number,
): WeightGapAlert | null {
  const carry = carriers.length === 1 ? carriers[0] : null;
  if (call !== 'lag' || carry == null || !(carry.partPct > 50)) return null;
  const who = scoped ? 'These favorites' : 'The book';
  const detail = offsetUsd > 0
    ? `${carry.player} pulled more than that net lag. Other cards offset ${money(offsetUsd)}.`
    : `${carry.player} carried ${percent(carry.partPct)} of that net lag.`;
  return {
    copy: `Weight gap: ${who} lagged, and ${detail} Not a live tape.`,
    player: carry.player,
    cardId: carry.id,
    href: `/audit-dossier?cardId=${encodeURIComponent(carry.id)}`,
  };
}

export function weightGap(inventory: readonly CardInventory[], ids?: readonly string[]): WeightGap {
  const tape = readIndexTape(inventory, ids);
  if (tape.call === 'off' || tape.gapPct == null) {
    return quiet(tape.scoped, tape.held, tape.off, offCopy(tape.scoped, tape.held, tape.cards.length));
  }
  const startUsd = cents(tape.cards.reduce((sum, card) => sum + card.from, 0));
  const gapUsd = cents((startUsd * tape.gapPct) / 100);
  const weighed = carriersFor(tape.cards, tape.gapPct, startUsd, gapUsd);
  const carriers = weighed.carriers;
  return {
    scoped: tape.scoped,
    call: tape.call,
    held: tape.held,
    cards: tape.cards.length,
    off: tape.off,
    startUsd,
    gapPct: tape.gapPct,
    gapUsd,
    carry: carriers.length === 1 ? carriers[0] : null,
    tied: carriers.length > 1 ? carriers : [],
    offsetUsd: weighed.offsetUsd,
    copy: scoredCopy(
      tape.scoped,
      tape.gapPct,
      gapUsd,
      startUsd,
      tape.call,
      tape.off,
      carriers,
      tape.drag?.id ?? null,
      weighed.offsetUsd,
      weighed.pullUsd,
    ),
    alert: alertFor(tape.scoped, carriers, tape.call, weighed.offsetUsd),
    disclosure: WEIGHT_GAP_DISCLOSURE,
  };
}
