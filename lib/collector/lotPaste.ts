/**
 * A pasted lot list, one card per line. Each match shows that card's ladder.
 * The total offer is the sum of the fairs. Not one card's sale.
 * Not a dealer inventory and not a live tape.
 */
import { buyLadder, buyLadderCopy } from './offerLadder';
import { buyScoreCopy } from './ladderScore';
import { preferredGradeKey, type SaleRange } from './saleRange';

export const LOT_PASTE_NOTE =
  'Paste one card per line: player, an optional card line, and an optional price. Each match shows that card\'s ladder. The total offer is the sum of the fairs. Not a dealer inventory and not a live tape.';

export const LOT_PASTE_LIMIT = 8;

export interface ParsedLotLine {
  player: string;
  detail: string;
  askUsd: number | null;
  gradeKey: string | null;
}

export interface LotBookCard {
  id: string;
  player: string;
  detail: string;
  gradeKey: string | null;
  range: SaleRange;
}

export interface PricedLotLine {
  player: string;
  matched: boolean;
  copy: string;
  fairUsd: number | null;
  walkUsd: number | null;
}

export interface PricedLot {
  lines: PricedLotLine[];
  omitted: number;
  offerUsd: number | null;
  walkUsd: number | null;
  matched: number;
  off: number;
  copy: string;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function priceOf(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 1_000_000) return null;
  return cents(value);
}

function splitPlayer(body: string): { player: string; detail: string } {
  const parts = body.split(/\s*(?:,|\||\t)\s*|\s+[-–—]\s+/).map((part) => part.trim()).filter(Boolean);
  return { player: parts[0] ?? '', detail: parts.slice(1).join(' ') };
}

export function parseLotList(text: string): { lines: ParsedLotLine[]; omitted: number } {
  const parsed: ParsedLotLine[] = [];
  let extra = 0;
  for (const raw of text.split(/\r?\n/)) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const dollar = trimmed.match(/^(.*?)\$\s*(\d{1,7}(?:\.\d{1,2})?)\s*$/);
    const field = trimmed.match(/^(.*?)[,|\t]\s*(\d{1,7}(?:\.\d{1,2})?)\s*$/);
    const hit = dollar ?? field;
    const body = (hit ? hit[1] : trimmed).trim().replace(/[,|\t]\s*$/, '');
    const ask = hit ? priceOf(hit[2]) : null;
    const { player, detail } = splitPlayer(body);
    if (!player) continue;
    if (parsed.length >= LOT_PASTE_LIMIT) {
      extra += 1;
      continue;
    }
    parsed.push({
      player,
      detail,
      askUsd: ask,
      gradeKey: preferredGradeKey({ id: player, gradeText: `${player} ${detail}` }),
    });
  }
  return { lines: parsed, omitted: extra };
}

function matchCard(line: ParsedLotLine, book: readonly LotBookCard[]): LotBookCard | null {
  const player = norm(line.player);
  const hits = book.filter((card) => norm(card.player) === player);
  if (hits.length === 0) return null;
  if (line.gradeKey) {
    const graded = hits.filter((card) => card.gradeKey === line.gradeKey);
    if (graded.length === 0) return null;
    return [...graded].sort((a, b) => a.id.localeCompare(b.id))[0];
  }
  return [...hits].sort((a, b) => a.id.localeCompare(b.id))[0];
}

function lineCopy(line: ParsedLotLine, card: LotBookCard | null): PricedLotLine {
  if (!card) {
    const why = line.gradeKey
      ? ` No ${line.gradeKey} copy of ${line.player} is in the book.`
      : '';
    return {
      player: line.player,
      matched: false,
      fairUsd: null,
      walkUsd: null,
      copy: `${line.player} stays off the ladder.${why} Not a dealer quote.`,
    };
  }
  const ladder = buyLadder(card.range);
  const ladderCopy = buyLadderCopy(ladder);
  const score = line.askUsd != null ? buyScoreCopy(line.askUsd, ladder, 'This ask') : null;
  const bits = [line.player];
  if (ladderCopy) bits.push(ladderCopy);
  if (score) bits.push(score);
  if (!ladderCopy) bits.push('This card has no sale range, so it stays off the ladder.');
  return {
    player: line.player,
    matched: ladder != null,
    fairUsd: ladder ? ladder.fair : null,
    walkUsd: ladder ? ladder.walk : null,
    copy: `${bits.join(' ')} Not a dealer quote.`,
  };
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function priceLot(
  parsed: { lines: readonly ParsedLotLine[]; omitted: number },
  book: readonly LotBookCard[],
): PricedLot {
  if (parsed.lines.length === 0) {
    return {
      lines: [],
      omitted: parsed.omitted,
      offerUsd: null,
      walkUsd: null,
      matched: 0,
      off: 0,
      copy: 'Paste one card per line. Each match shows that card\'s ladder. The total offer is the sum of the fairs. Not a dealer inventory and not a live tape.',
    };
  }
  const lines = parsed.lines.map((line) => lineCopy(line, matchCard(line, book)));
  const priced = lines.filter((line) => line.fairUsd != null && line.walkUsd != null);
  const off = lines.length - priced.length;
  const omittedNote = parsed.omitted > 0
    ? ` ${countPhrase(parsed.omitted, 'more line stays', 'more lines stay')} off this lot.`
    : '';
  if (priced.length === 0) {
    return {
      lines,
      omitted: parsed.omitted,
      offerUsd: null,
      walkUsd: null,
      matched: 0,
      off,
      copy: `No pasted card matches a ladder on this book, so there is no total offer.${omittedNote} Not a dealer quote and not a live tape.`,
    };
  }
  const offer = cents(priced.reduce((sum, line) => sum + (line.fairUsd ?? 0), 0));
  const walk = cents(priced.reduce((sum, line) => sum + (line.walkUsd ?? 0), 0));
  const offNote = off > 0 ? ` ${countPhrase(off, 'line stays', 'lines stay')} off the ladder.` : '';
  return {
    lines,
    omitted: parsed.omitted,
    offerUsd: offer,
    walkUsd: walk,
    matched: priced.length,
    off,
    copy: `Total offer ${money(offer)}, the fair on ${countPhrase(priced.length, 'card', 'cards')}. The walk for the lot is ${money(walk)}.${offNote}${omittedNote} This total is the sum of those fairs, not one card's sale. Not a dealer quote and not a live tape.`,
  };
}
