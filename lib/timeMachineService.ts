import { CardInventory, Sport } from '../types';

// ---- Types ----

export interface PortfolioSnapshot {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  totalNAV: number;
  cardCount: number;
  sportAllocation: Record<string, number>; // sport -> percentage
  topHoldings: { cardId: string; player: string; value: number }[];
  totalCostBasis: number;
  unrealizedPL: number;
  realizedPL: number;
  avgCardValue: number;
}

export interface SnapshotComparison {
  snapshotA: PortfolioSnapshot;
  snapshotB: PortfolioSnapshot;
  cardsAdded: number;
  cardsRemoved: number;
  navChange: number;
  navChangePercent: number;
  allocationDrift: Record<string, number>; // sport -> change in percentage points
  bestPerformer: { player: string; gain: number } | null;
  worstPerformer: { player: string; loss: number } | null;
}

export interface DecisionJournalEntry {
  id: string;
  date: string; // ISO date string
  note: string;
  cardIds?: string[];
  createdAt: string;
}

export interface YearlyReview {
  year: number;
  startNAV: number;
  endNAV: number;
  totalReturnPercent: number;
  bestMonth: { month: string; returnPercent: number };
  worstMonth: { month: string; returnPercent: number };
  cardsAdded: number;
  cardsSold: number;
  topGainPosition: { player: string; gainPercent: number } | null;
  topLossPosition: { player: string; lossPercent: number } | null;
  sp500ReturnPercent: number;
}

export interface WhatIfAnalysis {
  soldCards: {
    cardId: string;
    player: string;
    soldPrice: number;
    soldDate: string;
    estimatedCurrentValue: number;
    missedGain: number;
  }[];
  totalMissedValue: number;
  totalSoldFor: number;
}

// ---- Constants ----

const SNAPSHOT_KEY = 'msi_portfolio_snapshots';
const JOURNAL_KEY = 'msi_decision_journal';

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- localStorage helpers ----

export function getSnapshots(): PortfolioSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PortfolioSnapshot[];
  } catch {
    return [];
  }
}

export function saveSnapshot(snapshot: PortfolioSnapshot): void {
  try {
    const snapshots = getSnapshots();
    // Replace if same date exists
    const existingIdx = snapshots.findIndex(s => s.date === snapshot.date);
    if (existingIdx >= 0) {
      snapshots[existingIdx] = snapshot;
    } else {
      snapshots.push(snapshot);
    }
    // Sort chronologically and keep last 60
    snapshots.sort((a, b) => a.date.localeCompare(b.date));
    const trimmed = snapshots.slice(-60);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — silently fail
  }
}

function saveSnapshots(snapshots: PortfolioSnapshot[]): void {
  try {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(sorted.slice(-60)));
  } catch {
    // quota exceeded
  }
}

// ---- Journal helpers ----

export function getJournalEntries(): DecisionJournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DecisionJournalEntry[];
  } catch {
    return [];
  }
}

export function addJournalEntry(date: string, note: string, cardIds?: string[]): DecisionJournalEntry {
  const entries = getJournalEntries();
  const entry: DecisionJournalEntry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date,
    note,
    cardIds,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries.slice(-200)));
  } catch {
    // quota exceeded
  }
  return entry;
}

// ---- Core Logic ----

export function captureSnapshot(cards: CardInventory[]): PortfolioSnapshot {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const soldCards = cards.filter(c => c.status === 'sold');

  const totalNAV = activeCards.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const totalCostBasis = activeCards.reduce((sum, c) => sum + c.purchasePrice, 0);
  const unrealizedPL = totalNAV - totalCostBasis;

  const realizedPL = soldCards.reduce((sum, c) => {
    const sale = c.salePrice ?? c.purchasePrice;
    return sum + (sale - c.purchasePrice);
  }, 0);

  // Sport allocation
  const sportValues: Record<string, number> = {};
  activeCards.forEach(c => {
    const val = c.currentValue ?? c.purchasePrice;
    sportValues[c.sport] = (sportValues[c.sport] || 0) + val;
  });
  const sportAllocation: Record<string, number> = {};
  if (totalNAV > 0) {
    Object.entries(sportValues).forEach(([sport, val]) => {
      sportAllocation[sport] = Math.round((val / totalNAV) * 10000) / 100;
    });
  }

  // Top 5 holdings
  const sorted = [...activeCards].sort(
    (a, b) => (b.currentValue ?? b.purchasePrice) - (a.currentValue ?? a.purchasePrice)
  );
  const topHoldings = sorted.slice(0, 5).map(c => ({
    cardId: c.id,
    player: c.player,
    value: c.currentValue ?? c.purchasePrice,
  }));

  const today = new Date().toISOString().slice(0, 10);

  const snapshot: PortfolioSnapshot = {
    id: `snap_${today}_${Math.random().toString(36).slice(2, 8)}`,
    date: today,
    totalNAV: Math.round(totalNAV * 100) / 100,
    cardCount: activeCards.length,
    sportAllocation,
    topHoldings,
    totalCostBasis: Math.round(totalCostBasis * 100) / 100,
    unrealizedPL: Math.round(unrealizedPL * 100) / 100,
    realizedPL: Math.round(realizedPL * 100) / 100,
    avgCardValue: activeCards.length > 0
      ? Math.round((totalNAV / activeCards.length) * 100) / 100
      : 0,
  };

  saveSnapshot(snapshot);
  return snapshot;
}

export function generateHistoricalSnapshots(cards: CardInventory[]): PortfolioSnapshot[] {
  const existing = getSnapshots();
  if (existing.length >= 6) return existing;

  // Get current NAV as baseline
  const activeCards = cards.filter(c => c.status !== 'sold');
  const currentNAV = activeCards.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const currentCostBasis = activeCards.reduce((sum, c) => sum + c.purchasePrice, 0);
  const currentCardCount = activeCards.length;

  // Sports in portfolio
  const sports: string[] = [...new Set(activeCards.map(c => c.sport))];
  if (sports.length === 0) sports.push('Baseball');

  const baseSeed = 4517; // deterministic seed
  const now = new Date();
  const snapshots: PortfolioSnapshot[] = [];

  for (let i = 11; i >= 0; i--) {
    const snapshotDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const dateStr = snapshotDate.toISOString().slice(0, 10);
    const monthOffset = 11 - i; // 0 = oldest, 11 = most recent

    // NAV varies ±5-15% from current, trending upward over time
    const trendFactor = 0.85 + (monthOffset / 11) * 0.15; // 0.85 -> 1.0
    const noise = seededRange(baseSeed, i * 7 + 1, -0.08, 0.08);
    const navMultiplier = trendFactor + noise;
    const nav = Math.round(currentNAV * navMultiplier * 100) / 100;

    // Card count varies slightly
    const countNoise = Math.round(seededRange(baseSeed, i * 7 + 2, -3, 3));
    const cardCount = Math.max(1, currentCardCount + countNoise - (11 - monthOffset));

    // Sport allocation with slight drift
    const sportAllocation: Record<string, number> = {};
    let allocTotal = 0;
    sports.forEach((sport, si) => {
      const baseAlloc = 100 / sports.length;
      const drift = seededRange(baseSeed, i * 7 + 3 + si, -10, 10);
      const alloc = Math.max(1, baseAlloc + drift);
      sportAllocation[sport] = alloc;
      allocTotal += alloc;
    });
    // Normalize to 100%
    Object.keys(sportAllocation).forEach(s => {
      sportAllocation[s] = Math.round((sportAllocation[s] / allocTotal) * 10000) / 100;
    });

    // Top holdings: use current top cards with simulated historical values
    const sortedCards = [...activeCards].sort(
      (a, b) => (b.currentValue ?? b.purchasePrice) - (a.currentValue ?? a.purchasePrice)
    );
    const topHoldings = sortedCards.slice(0, 5).map((c, ci) => ({
      cardId: c.id,
      player: c.player,
      value: Math.round(
        (c.currentValue ?? c.purchasePrice) * navMultiplier *
        seededRange(baseSeed, i * 7 + 10 + ci, 0.85, 1.15) * 100
      ) / 100,
    }));

    const costBasis = Math.round(currentCostBasis * (0.9 + (monthOffset / 11) * 0.1) * 100) / 100;
    const unrealizedPL = Math.round((nav - costBasis) * 100) / 100;

    // Simulated realized P/L growing over time
    const realizedPL = Math.round(
      seededRange(baseSeed, i * 7 + 6, -50, 200) * (monthOffset / 11) * 100
    ) / 100;

    snapshots.push({
      id: `snap_hist_${dateStr}`,
      date: dateStr,
      totalNAV: nav,
      cardCount,
      sportAllocation,
      topHoldings,
      totalCostBasis: costBasis,
      unrealizedPL,
      realizedPL,
      avgCardValue: cardCount > 0 ? Math.round((nav / cardCount) * 100) / 100 : 0,
    });
  }

  // Merge with any existing snapshots (avoid duplicates by date)
  const dateSet = new Set(existing.map(s => s.date));
  const merged = [...existing];
  snapshots.forEach(s => {
    if (!dateSet.has(s.date)) {
      merged.push(s);
      dateSet.add(s.date);
    }
  });
  merged.sort((a, b) => a.date.localeCompare(b.date));
  saveSnapshots(merged);
  return merged;
}

export function getSnapshotForDate(date: string): PortfolioSnapshot | null {
  const snapshots = getSnapshots();
  if (snapshots.length === 0) return null;

  const target = new Date(date).getTime();
  let closest: PortfolioSnapshot | null = null;
  let closestDiff = Infinity;

  for (const s of snapshots) {
    const diff = Math.abs(new Date(s.date).getTime() - target);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = s;
    }
  }

  return closest;
}

export function compareSnapshots(dateA: string, dateB: string): SnapshotComparison | null {
  const snapshotA = getSnapshotForDate(dateA);
  const snapshotB = getSnapshotForDate(dateB);

  if (!snapshotA || !snapshotB) return null;

  const navChange = snapshotB.totalNAV - snapshotA.totalNAV;
  const navChangePercent = snapshotA.totalNAV > 0
    ? (navChange / snapshotA.totalNAV) * 100
    : 0;

  const cardsAdded = Math.max(0, snapshotB.cardCount - snapshotA.cardCount);
  const cardsRemoved = Math.max(0, snapshotA.cardCount - snapshotB.cardCount);

  // Allocation drift
  const allSports = new Set<string>([
    ...Object.keys(snapshotA.sportAllocation),
    ...Object.keys(snapshotB.sportAllocation),
  ]);
  const allocationDrift: Record<string, number> = {};
  allSports.forEach(sport => {
    const a = snapshotA.sportAllocation[sport] ?? 0;
    const b = snapshotB.sportAllocation[sport] ?? 0;
    allocationDrift[sport] = Math.round((b - a) * 100) / 100;
  });

  // Best/worst performer from top holdings comparison
  let bestPerformer: { player: string; gain: number } | null = null;
  let worstPerformer: { player: string; loss: number } | null = null;

  const holdingsA = new Map(snapshotA.topHoldings.map(h => [h.cardId, h]));
  for (const holdingB of snapshotB.topHoldings) {
    const holdingA = holdingsA.get(holdingB.cardId);
    if (holdingA) {
      const gain = holdingB.value - holdingA.value;
      if (!bestPerformer || gain > bestPerformer.gain) {
        bestPerformer = { player: holdingB.player, gain: Math.round(gain * 100) / 100 };
      }
      if (!worstPerformer || gain < worstPerformer.loss) {
        worstPerformer = { player: holdingB.player, loss: Math.round(gain * 100) / 100 };
      }
    }
  }

  return {
    snapshotA,
    snapshotB,
    cardsAdded,
    cardsRemoved,
    navChange: Math.round(navChange * 100) / 100,
    navChangePercent: Math.round(navChangePercent * 100) / 100,
    allocationDrift,
    bestPerformer,
    worstPerformer,
  };
}

export function whatIfHeld(cards: CardInventory[], _currentDate?: string): WhatIfAnalysis {
  const soldCards = cards.filter(c => c.status === 'sold' && c.salePrice != null && c.saleDate != null);

  const analyzed = soldCards.map((c, idx) => {
    const saleDate = new Date(c.saleDate!);
    const now = new Date();
    const monthsHeld = Math.max(1, Math.round(
      (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));

    // Simulate appreciation: 0.5-2% per month based on purchase price, deterministic
    const seed = c.purchasePrice * 100 + idx;
    const monthlyRate = seededRange(seed, 42, 0.005, 0.02);
    const estimatedCurrentValue = Math.round(
      c.purchasePrice * Math.pow(1 + monthlyRate, monthsHeld) * 100
    ) / 100;

    const missedGain = Math.round((estimatedCurrentValue - (c.salePrice ?? 0)) * 100) / 100;

    return {
      cardId: c.id,
      player: c.player,
      soldPrice: c.salePrice!,
      soldDate: c.saleDate!,
      estimatedCurrentValue,
      missedGain,
    };
  });

  const totalMissedValue = Math.round(
    analyzed.reduce((sum, a) => sum + Math.max(0, a.missedGain), 0) * 100
  ) / 100;
  const totalSoldFor = Math.round(
    analyzed.reduce((sum, a) => sum + a.soldPrice, 0) * 100
  ) / 100;

  return {
    soldCards: analyzed,
    totalMissedValue,
    totalSoldFor,
  };
}

export function generateYearlyReview(year: number, cards: CardInventory[]): YearlyReview {
  const snapshots = getSnapshots();

  // Find snapshots for this year
  const yearSnapshots = snapshots.filter(s => s.date.startsWith(String(year)));

  // Start/end NAV
  const startSnap = yearSnapshots.length > 0 ? yearSnapshots[0] : null;
  const endSnap = yearSnapshots.length > 0 ? yearSnapshots[yearSnapshots.length - 1] : null;

  const startNAV = startSnap?.totalNAV ?? 0;
  const endNAV = endSnap?.totalNAV ??
    cards.filter(c => c.status !== 'sold').reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);

  const totalReturnPercent = startNAV > 0
    ? Math.round(((endNAV - startNAV) / startNAV) * 10000) / 100
    : 0;

  // Best/worst month
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let bestMonth = { month: 'N/A', returnPercent: -Infinity };
  let worstMonth = { month: 'N/A', returnPercent: Infinity };

  for (let i = 1; i < yearSnapshots.length; i++) {
    const prev = yearSnapshots[i - 1];
    const curr = yearSnapshots[i];
    const monthReturn = prev.totalNAV > 0
      ? ((curr.totalNAV - prev.totalNAV) / prev.totalNAV) * 100
      : 0;
    const monthIdx = new Date(curr.date).getMonth();
    const monthLabel = monthLabels[monthIdx] ?? 'N/A';

    if (monthReturn > bestMonth.returnPercent) {
      bestMonth = { month: monthLabel, returnPercent: Math.round(monthReturn * 100) / 100 };
    }
    if (monthReturn < worstMonth.returnPercent) {
      worstMonth = { month: monthLabel, returnPercent: Math.round(monthReturn * 100) / 100 };
    }
  }

  if (bestMonth.returnPercent === -Infinity) bestMonth = { month: 'N/A', returnPercent: 0 };
  if (worstMonth.returnPercent === Infinity) worstMonth = { month: 'N/A', returnPercent: 0 };

  // Cards added/sold this year
  const yearStr = String(year);
  const cardsAdded = cards.filter(c => c.purchaseDate.startsWith(yearStr)).length;
  const cardsSold = cards.filter(c => c.status === 'sold' && c.saleDate?.startsWith(yearStr)).length;

  // Top gain/loss positions
  const activeCards = cards.filter(c => c.status !== 'sold');
  let topGain: { player: string; gainPercent: number } | null = null;
  let topLoss: { player: string; lossPercent: number } | null = null;

  activeCards.forEach(c => {
    const val = c.currentValue ?? c.purchasePrice;
    const cost = c.purchasePrice;
    if (cost > 0) {
      const pct = ((val - cost) / cost) * 100;
      if (!topGain || pct > topGain.gainPercent) {
        topGain = { player: c.player, gainPercent: Math.round(pct * 100) / 100 };
      }
      if (!topLoss || pct < (topLoss.lossPercent)) {
        topLoss = { player: c.player, lossPercent: Math.round(pct * 100) / 100 };
      }
    }
  });

  // Simulated S&P 500 return — deterministic per year
  const sp500Seed = year * 31;
  const sp500ReturnPercent = Math.round(seededRange(sp500Seed, 99, 5, 18) * 100) / 100;

  return {
    year,
    startNAV: Math.round(startNAV * 100) / 100,
    endNAV: Math.round(endNAV * 100) / 100,
    totalReturnPercent,
    bestMonth,
    worstMonth,
    cardsAdded,
    cardsSold,
    topGainPosition: topGain,
    topLossPosition: topLoss,
    sp500ReturnPercent,
  };
}
