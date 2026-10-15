/**
 * Connects the local book to the show floor: started-set holes, where a
 * sell card sits, and a typed ask versus the local median. Demo or stale
 * tape. Not a Beckett registry and not a live show feed.
 */
import type { CardInventory, League, Sport, TargetWatchlist } from '../../types';
import { buildPortfolioSetGaps } from '../collection/portfolioSetGaps';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const AT_BAND_PCT = 5;
const HIGH_PRIORITY_USD = 25;

export interface GapHunt {
  setId: string;
  setLabel: string;
  sport: Sport;
  number: string;
  player: string;
  estimateUsd: number;
  focused: boolean;
}

export type HoleTarget = Omit<TargetWatchlist, 'id' | 'createdAt' | 'status'>;

export type AskCall = 'under' | 'at' | 'over' | 'no mark';

export interface FloorNote {
  result: string;
  askUsd: number;
  offerUsd: number;
  savedAt?: string;
}

export interface FloorWeek {
  bought: number;
  passed: number;
  open: number;
  typedSpendUsd: number;
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

function hasHashNumber(detail: string, number: string): boolean {
  const escaped = number.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escaped) return false;
  return new RegExp(`#\\s*${escaped}(?![A-Za-z0-9])`, 'i').test(detail);
}

export function holeClaimed(
  row: { player?: string; detail: string },
  hole: { player?: string; number: string; setLabel: string },
): boolean {
  if (norm(row.player) !== norm(hole.player)) return false;
  if (hasHashNumber(row.detail, hole.number)) return true;
  const label = norm(hole.setLabel);
  return label.length > 0 && norm(row.detail).includes(label);
}

export function gapHunts(input: {
  show: { sports: readonly Sport[]; focusPlayers?: readonly string[] };
  inventory: readonly CardInventory[];
  claimed?: readonly { player: string; detail: string }[];
  checklists?: Parameters<typeof buildPortfolioSetGaps>[1];
  limit?: number;
}): GapHunt[] {
  const sports = new Set(input.show.sports);
  const focus = new Set((input.show.focusPlayers ?? []).map((name) => norm(name)));
  const claimed = input.claimed ?? [];
  const hunts: GapHunt[] = [];
  for (const gap of buildPortfolioSetGaps(input.inventory, input.checklists)) {
    if (!sports.has(gap.sport)) continue;
    for (const card of gap.missing) {
      const hole = { player: card.player, number: card.number, setLabel: gap.label };
      if (claimed.some((row) => holeClaimed(row, hole))) continue;
      hunts.push({
        setId: gap.id,
        setLabel: gap.label,
        sport: gap.sport,
        number: card.number,
        player: card.player,
        estimateUsd: card.estimateUsd,
        focused: focus.has(norm(card.player)),
      });
    }
  }
  hunts.sort((a, b) => a.estimateUsd - b.estimateUsd || a.player.localeCompare(b.player) || a.number.localeCompare(b.number));
  const limit = input.limit ?? 8;
  return limit > 0 ? hunts.slice(0, limit) : [];
}

function leagueFor(sport: Sport): League {
  if (sport === 'Baseball') return 'MLB';
  if (sport === 'Basketball') return 'NBA';
  if (sport === 'Football') return 'NFL';
  return 'Other';
}

export function holeTarget(hole: GapHunt): HoleTarget {
  return {
    player: hole.player,
    cardDescription: `${hole.setLabel} #${hole.number}`,
    priority: hole.estimateUsd >= HIGH_PRIORITY_USD ? 'High' : 'Medium',
    targetPrice: hole.estimateUsd,
    sport: hole.sport,
    league: leagueFor(hole.sport),
    notes: 'Demo checklist hole. Not a live listing.',
  };
}

export function holeAlreadyWatched(
  targets: readonly { status?: string; player: string; cardDescription: string }[],
  hole: { player: string; number: string; setLabel: string },
): boolean {
  return targets.some((target) => target.status === 'active' && holeClaimed(
    { player: target.player, detail: target.cardDescription },
    hole,
  ));
}

export function askVersusMedian(askUsd: number, medianUsd: number | null): { call: AskCall; gapPct: number | null } {
  if (!Number.isFinite(askUsd) || askUsd < 0) return { call: 'no mark', gapPct: null };
  if (medianUsd == null || !Number.isFinite(medianUsd) || medianUsd <= 0) return { call: 'no mark', gapPct: null };
  const gapPct = Math.round(((askUsd - medianUsd) / medianUsd) * 1000) / 10;
  if (Math.abs(gapPct) <= AT_BAND_PCT) return { call: 'at', gapPct };
  return { call: askUsd < medianUsd ? 'under' : 'over', gapPct };
}

export function askCallCopy(input: {
  call: AskCall;
  gapPct: number | null;
  basis: 'comps' | 'demo' | 'none';
  medianUsd: number | null;
}): string {
  if (input.call === 'no mark' || input.basis === 'none' || input.medianUsd == null) {
    return 'No median on this card. Not a live tape.';
  }
  const basis = input.basis === 'comps' ? 'sold comps' : 'demo sales';
  const median = `$${Math.round(input.medianUsd).toLocaleString('en-US')}`;
  if (input.call === 'at') return `Ask is within 5% of the ${basis} median (${median}). Not a live tape.`;
  const gap = Math.abs(input.gapPct ?? 0);
  return `Ask is ${input.call} the ${basis} median (${median}) by ${gap}%. Not a live tape.`;
}

export function pullCopy(place: string | undefined): string {
  if (place === 'binder') return 'Pull from Binder';
  if (place === 'box') return 'Pull from Box';
  if (place === 'slab') return 'Pull from Slab case';
  return 'No saved place';
}

export function floorWeek(notes: readonly FloorNote[], now = Date.now()): FloorWeek {
  let bought = 0;
  let passed = 0;
  let open = 0;
  let spend = 0;
  for (const note of notes) {
    const saved = Date.parse(note.savedAt ?? '');
    if (!Number.isFinite(saved) || saved > now || saved < now - WEEK_MS) continue;
    if (note.result === 'bought') {
      bought += 1;
      const paid = note.offerUsd > 0 ? note.offerUsd : note.askUsd;
      if (Number.isFinite(paid) && paid > 0) spend += paid;
    } else if (note.result === 'passed') {
      passed += 1;
    } else if (note.result === 'open') {
      open += 1;
    }
  }
  return { bought, passed, open, typedSpendUsd: roundUsd(spend) };
}
