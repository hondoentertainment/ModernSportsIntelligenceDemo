export interface WaxBreak {
  id: string;
  productName: string;        // e.g., "2024 Topps Chrome Hobby Box"
  breakCost: number;           // What the user paid for the break slot
  cards: WaxBreakCard[];
  totalValue: number;
  roi: number;                 // Percentage
  profit: number;              // Dollar
  breakDate: string;
  notes?: string;
}

export interface WaxBreakCard {
  id: string;
  player: string;
  year: number;
  set: string;
  estimatedValue: number;
  isHit: boolean;              // Notable pull (auto, numbered, etc.)
  description?: string;
}

export interface WaxBreakStats {
  totalBreaks: number;
  totalSpent: number;
  totalValue: number;
  totalProfit: number;
  overallROI: number;
  winRate: number;             // % of breaks that were profitable
  avgROI: number;
  bestBreak: WaxBreak | null;
  worstBreak: WaxBreak | null;
  totalHits: number;
  avgHitsPerBreak: number;
}

const STORAGE_KEY = 'msi-wax-breaks';

/**
 * Phase 30: Wax Break ROI Tracker.
 * Tracks the cost vs. return of hobby/wax box breaks.
 */

export function createBreak(
  productName: string,
  breakCost: number,
  notes?: string
): WaxBreak {
  const brk: WaxBreak = {
    id: crypto.randomUUID(),
    productName,
    breakCost,
    cards: [],
    totalValue: 0,
    roi: -100, // Nothing pulled yet
    profit: -breakCost,
    breakDate: new Date().toISOString(),
    notes
  };

  saveBreak(brk);
  return brk;
}

export function addCardToBreak(breakId: string, card: Omit<WaxBreakCard, 'id'>): WaxBreak | null {
  const breaks = getBreaks();
  const brk = breaks.find(b => b.id === breakId);
  if (!brk) return null;

  const newCard: WaxBreakCard = {
    ...card,
    id: crypto.randomUUID()
  };

  brk.cards.push(newCard);
  recalculate(brk);
  saveAllBreaks(breaks);
  return brk;
}

export function removeCardFromBreak(breakId: string, cardId: string): WaxBreak | null {
  const breaks = getBreaks();
  const brk = breaks.find(b => b.id === breakId);
  if (!brk) return null;

  brk.cards = brk.cards.filter(c => c.id !== cardId);
  recalculate(brk);
  saveAllBreaks(breaks);
  return brk;
}

export function deleteBreak(breakId: string): void {
  const breaks = getBreaks().filter(b => b.id !== breakId);
  saveAllBreaks(breaks);
}

export function getBreaks(): WaxBreak[] {
  try {
    const stored = store.get(STORAGE_KEY, null);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

import { store } from './dal/syncStore';
export function getBreakStats(): WaxBreakStats {
  const breaks = getBreaks();

  if (breaks.length === 0) {
    return {
      totalBreaks: 0,
      totalSpent: 0,
      totalValue: 0,
      totalProfit: 0,
      overallROI: 0,
      winRate: 0,
      avgROI: 0,
      bestBreak: null,
      worstBreak: null,
      totalHits: 0,
      avgHitsPerBreak: 0
    };
  }

  const totalSpent = breaks.reduce((s, b) => s + b.breakCost, 0);
  const totalValue = breaks.reduce((s, b) => s + b.totalValue, 0);
  const totalProfit = totalValue - totalSpent;
  const winners = breaks.filter(b => b.profit > 0);
  const totalHits = breaks.reduce((s, b) => s + b.cards.filter(c => c.isHit).length, 0);

  const sorted = [...breaks].sort((a, b) => b.roi - a.roi);

  return {
    totalBreaks: breaks.length,
    totalSpent,
    totalValue,
    totalProfit,
    overallROI: totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0,
    winRate: (winners.length / breaks.length) * 100,
    avgROI: breaks.reduce((s, b) => s + b.roi, 0) / breaks.length,
    bestBreak: sorted[0] || null,
    worstBreak: sorted[sorted.length - 1] || null,
    totalHits,
    avgHitsPerBreak: breaks.length > 0 ? totalHits / breaks.length : 0
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────

function recalculate(brk: WaxBreak): void {
  brk.totalValue = brk.cards.reduce((s, c) => s + c.estimatedValue, 0);
  brk.profit = brk.totalValue - brk.breakCost;
  brk.roi = brk.breakCost > 0 ? (brk.profit / brk.breakCost) * 100 : 0;
}

function saveBreak(brk: WaxBreak): void {
  const breaks = getBreaks();
  breaks.push(brk);
  saveAllBreaks(breaks);
}

function saveAllBreaks(breaks: WaxBreak[]): void {
  store.set(STORAGE_KEY, breaks);
}
