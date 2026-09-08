import type { CardInventory, League } from '../../types';
import { generateTradeProposals } from './tradeProposalService';

export const CONCENTRATION_THRESHOLD_PCT = 35;

export const CONCENTRATION_DISCLOSURE =
  'Heuristic share of local NAV by player and league. Advisory only — not a risk model, live tape, or a trade order.';

export interface ConcentrationSlice {
  key: string;
  label: string;
  kind: 'player' | 'league';
  value: number;
  sharePct: number;
  overConcentrated: boolean;
}

export interface ConcentrationHint {
  id: string;
  title: string;
  detail: string;
  href: string;
  hrefLabel: string;
}

export interface PortfolioConcentrationReport {
  nav: number;
  players: ConcentrationSlice[];
  leagues: ConcentrationSlice[];
  overConcentrated: ConcentrationSlice[];
  hints: ConcentrationHint[];
  disclosure: string;
}

function cardValue(card: CardInventory): number {
  return card.currentValue || card.purchasePrice || 0;
}

function activeCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((c) => c.status !== 'sold' && cardValue(c) > 0);
}

function sharePct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function toSlice(
  key: string,
  label: string,
  kind: ConcentrationSlice['kind'],
  value: number,
  nav: number,
): ConcentrationSlice {
  const pct = sharePct(value, nav);
  return {
    key,
    label,
    kind,
    value,
    sharePct: Math.round(pct * 10) / 10,
    overConcentrated: pct >= CONCENTRATION_THRESHOLD_PCT,
  };
}

/**
 * Local-inventory NAV concentration by player and league.
 * Threshold matches advisory trade-proposal math (35% of NAV).
 */
export function analyzePortfolioConcentration(inventory: CardInventory[]): PortfolioConcentrationReport {
  const cards = activeCards(inventory);
  const nav = cards.reduce((sum, c) => sum + cardValue(c), 0);

  const byPlayer = new Map<string, { label: string; value: number }>();
  const byLeague = new Map<League, number>();
  for (const card of cards) {
    const pKey = card.player.trim().toLowerCase();
    const existing = byPlayer.get(pKey);
    byPlayer.set(pKey, {
      label: existing?.label || card.player,
      value: (existing?.value ?? 0) + cardValue(card),
    });
    byLeague.set(card.league, (byLeague.get(card.league) ?? 0) + cardValue(card));
  }

  const players = [...byPlayer.entries()]
    .map(([key, row]) => toSlice(key, row.label, 'player', row.value, nav))
    .sort((a, b) => b.value - a.value);

  const leagues = [...byLeague.entries()]
    .map(([league, value]) => toSlice(league, league, 'league', value, nav))
    .sort((a, b) => b.value - a.value);

  const overConcentrated = [...players, ...leagues].filter((row) => row.overConcentrated);
  const proposals = generateTradeProposals(inventory);
  const hints: ConcentrationHint[] = overConcentrated.slice(0, 4).map((row) => {
    const match = proposals.find((p) => p.concentrationFrom.toLowerCase() === row.label.toLowerCase());
    if (match) {
      return {
        id: `hint-trade-${row.kind}-${row.key}`,
        title: `Rebalance ${row.label} (${row.sharePct.toFixed(0)}% NAV)`,
        detail: match.rationale,
        href: '/collection',
        hrefLabel: 'Open trade proposals',
      };
    }
    return {
      id: `hint-autopilot-${row.kind}-${row.key}`,
      title: `Review ${row.label} concentration`,
      detail: `${row.label} is ${row.sharePct.toFixed(0)}% of local NAV. Preview an advisory Auto-Pilot cycle with collars — no live execution.`,
      href: '/war-room',
      hrefLabel: 'Open Auto-Pilot',
    };
  });

  return {
    nav,
    players,
    leagues,
    overConcentrated,
    hints,
    disclosure: CONCENTRATION_DISCLOSURE,
  };
}
