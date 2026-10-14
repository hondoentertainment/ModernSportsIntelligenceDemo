/**
 * Set completion for checklists the collection has already started.
 * The checklist is a short demo, not a Beckett registry.
 */
import type { CardInventory, Sport } from '../../types';
import { store } from '../dal/syncStore';

export const SET_GOAL_KEY = 'msi_portfolio_set_goals_v1';

export const SET_GAP_DISCLOSURE =
  'Demo checklist for sets already in this book. Not a Beckett registry. Not live Market Movers or Sports Card Investor parity.';

export interface ChecklistCard {
  number: string;
  player: string;
  estimateUsd: number;
}

export interface DemoChecklist {
  id: string;
  year: number;
  manufacturer: string;
  set: string;
  sport: Sport;
  cards: ChecklistCard[];
}

export const DEMO_SET_CHECKLISTS: DemoChecklist[] = [
  {
    id: '2024-topps-s1',
    year: 2024,
    manufacturer: 'Topps',
    set: 'Series 1',
    sport: 'Baseball',
    cards: [
      { number: '1', player: 'Aaron Judge', estimateUsd: 4 },
      { number: '15', player: 'Juan Soto', estimateUsd: 4 },
      { number: '120', player: 'Pete Alonso', estimateUsd: 12 },
      { number: '250', player: 'Paul Skenes', estimateUsd: 18 },
    ],
  },
  {
    id: '2023-prizm',
    year: 2023,
    manufacturer: 'Panini',
    set: 'Prizm',
    sport: 'Basketball',
    cards: [
      { number: '1', player: 'Victor Wembanyama', estimateUsd: 40 },
      { number: '89', player: 'Jayson Tatum', estimateUsd: 6 },
    ],
  },
];

export interface SetGap {
  id: string;
  label: string;
  sport: Sport;
  owned: number;
  total: number;
  percent: number;
  missing: ChecklistCard[];
  costToCompleteUsd: number;
}

export interface SetGoal {
  setId: string;
  targetPercent: number;
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function numberKey(value: string): string {
  return value.trim().replace(/^#/, '').toLowerCase();
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatGapUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function formatGapPercent(value: number): string {
  const rounded = roundPercent(value);
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function buildPortfolioSetGaps(
  inventory: readonly CardInventory[],
  checklists: readonly DemoChecklist[] = DEMO_SET_CHECKLISTS,
): SetGap[] {
  const held = inventory.filter((card) => card.status !== 'sold');
  const gaps: SetGap[] = [];
  for (const list of checklists) {
    const ownedNumbers = new Set<string>();
    for (const card of held) {
      if (card.year !== list.year || card.sport !== list.sport) continue;
      if (norm(card.manufacturer) !== norm(list.manufacturer) || norm(card.set) !== norm(list.set)) continue;
      const key = numberKey(card.cardNumber ?? '');
      if (key) ownedNumbers.add(key);
    }
    if (ownedNumbers.size === 0) continue;
    const missing = list.cards.filter((card) => !ownedNumbers.has(numberKey(card.number)));
    const owned = list.cards.length - missing.length;
    const percent = list.cards.length === 0 ? 0 : roundPercent((owned / list.cards.length) * 100);
    gaps.push({
      id: list.id,
      label: `${list.year} ${list.manufacturer} ${list.set}`,
      sport: list.sport,
      owned,
      total: list.cards.length,
      percent,
      missing,
      costToCompleteUsd: roundUsd(missing.reduce((sum, card) => sum + card.estimateUsd, 0)),
    });
  }
  gaps.sort((a, b) => b.percent - a.percent || a.label.localeCompare(b.label));
  return gaps;
}

function clampTarget(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(1, Math.round(value)));
}

export function readSetGoals(): SetGoal[] {
  const raw = store.get<unknown>(SET_GOAL_KEY, []);
  if (!Array.isArray(raw)) return [];
  const goals: SetGoal[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const goal = row as SetGoal;
    if (typeof goal.setId !== 'string' || goal.setId.trim() === '') continue;
    if (typeof goal.targetPercent !== 'number') continue;
    goals.push({ setId: goal.setId.trim(), targetPercent: clampTarget(goal.targetPercent) });
  }
  return goals;
}

export function saveSetGoal(setId: string, targetPercent = 100): SetGoal[] {
  const id = setId.trim();
  const current = readSetGoals();
  if (!id) return current;
  const next = [...current.filter((goal) => goal.setId !== id), { setId: id, targetPercent: clampTarget(targetPercent) }];
  store.set(SET_GOAL_KEY, next);
  return next;
}

export function clearSetGoal(setId: string): SetGoal[] {
  const next = readSetGoals().filter((goal) => goal.setId !== setId);
  store.set(SET_GOAL_KEY, next);
  return next;
}

export function goalRemaining(percent: number, targetPercent: number): number {
  return roundPercent(Math.max(0, targetPercent - percent));
}
